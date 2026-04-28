import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { pickChatProvider } from '../providers/index.js';
import { creditCost, ensureCredits } from '../services/credits.js';
import { recordGeneration } from '../services/recordGeneration.js';
import { notFound } from '../utils/errors.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const templates = await prisma.promptTemplate.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }]
    });
    res.json(templates);
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const t = await prisma.promptTemplate.findUnique({ where: { slug: req.params.slug } });
    if (!t) throw notFound();
    res.json(t);
  })
);

const runSchema = z.object({
  values: z.record(z.any()),
  provider: z.string().optional(),
  model: z.string().optional(),
  brandVoiceId: z.string().optional()
});

function fillTemplate(tpl: string, values: Record<string, unknown>) {
  return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => String(values[k] ?? ''));
}

router.post(
  '/:slug/run',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { values, provider, model, brandVoiceId } = runSchema.parse(req.body);
    const t = await prisma.promptTemplate.findUnique({ where: { slug: req.params.slug } });
    if (!t) throw notFound();
    const filled = fillTemplate(t.promptTemplate, values);
    let system = t.systemPrompt ?? 'You are a senior content strategist who writes high-quality, on-brand copy.';
    if (brandVoiceId) {
      const bv = await prisma.brandVoice.findFirst({
        where: { id: brandVoiceId, userId: req.user!.id }
      });
      if (bv) {
        system += `\n\nBrand voice: ${bv.name}\nTone: ${bv.tone ?? ''}\nStyle guide: ${bv.styleGuide ?? ''}`;
      }
    }
    await ensureCredits(req.user!.id, creditCost.template(filled.length));
    const t0 = Date.now();
    const { provider: chosen, call } = pickChatProvider(provider);
    const result = await call({
      model: model ?? t.defaultModel ?? undefined,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: filled }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    const cost = creditCost.template(result.outputTokens || result.text.length);
    const gen = await recordGeneration({
      userId: req.user!.id,
      kind: 'TEMPLATE',
      provider: chosen,
      model: result.model,
      input: { template: t.slug, values },
      output: { text: result.text },
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      creditsUsed: cost,
      durationMs: Date.now() - t0
    });
    res.json({ text: result.text, provider: chosen, model: result.model, generationId: gen.id });
  })
);

export default router;
