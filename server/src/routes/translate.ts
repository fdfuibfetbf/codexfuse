import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { pickChatProvider } from '../providers/index.js';
import { creditCost, ensureCredits } from '../services/credits.js';
import { recordGeneration } from '../services/recordGeneration.js';

const router = Router();
router.use(requireAuth);

const schema = z.object({
  text: z.string().min(1).max(20000),
  targetLanguage: z.string().min(2).max(40),
  sourceLanguage: z.string().optional(),
  provider: z.string().optional(),
  model: z.string().optional()
});

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const args = schema.parse(req.body);
    await ensureCredits(req.user!.id, creditCost.translate(args.text.length));
    const sys = `You are a professional translator. Translate the user's text into ${args.targetLanguage}.
- Preserve meaning, tone, formatting, names, code, and inline markup.
- Output ONLY the translated text. No explanations.`;
    const t0 = Date.now();
    const { provider, call } = pickChatProvider(args.provider);
    const result = await call({
      model: args.model,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: args.text }
      ],
      temperature: 0.2,
      max_tokens: 2048
    });
    const cost = creditCost.translate(result.outputTokens || result.text.length);
    const gen = await recordGeneration({
      userId: req.user!.id,
      kind: 'TRANSLATE',
      provider,
      model: result.model,
      input: { targetLanguage: args.targetLanguage, sourceLanguage: args.sourceLanguage },
      output: { text: result.text },
      creditsUsed: cost,
      durationMs: Date.now() - t0
    });
    res.json({ text: result.text, provider, model: result.model, generationId: gen.id });
  })
);

export default router;
