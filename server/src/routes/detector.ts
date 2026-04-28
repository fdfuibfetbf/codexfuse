import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { pickChatProvider } from '../providers/index.js';
import { creditCost, ensureCredits } from '../services/credits.js';
import { recordGeneration } from '../services/recordGeneration.js';

const router = Router();
router.use(requireAuth);

const schema = z.object({ text: z.string().min(20).max(20000), provider: z.string().optional() });

router.post(
  '/ai-detector',
  asyncHandler(async (req, res) => {
    const { text, provider } = schema.parse(req.body);
    await ensureCredits(req.user!.id, creditCost.detector());
    const sys = `You are an AI text classifier. Analyze the supplied text and return STRICT JSON of the form:
{"aiProbability":0..1,"verdict":"likely-human"|"mixed"|"likely-ai","reasons":["...","..."]}
No prose, no markdown. JSON only.`;
    const { provider: chosen, call } = pickChatProvider(provider);
    const t0 = Date.now();
    const r = await call({
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: text }
      ],
      temperature: 0
    });
    let parsed: any = { aiProbability: 0, verdict: 'mixed', reasons: [] };
    try {
      parsed = JSON.parse(r.text.match(/\{[\s\S]*\}/)?.[0] ?? r.text);
    } catch {}
    const gen = await recordGeneration({
      userId: req.user!.id,
      kind: 'AI_DETECTOR',
      provider: chosen,
      model: r.model,
      input: { length: text.length },
      output: parsed,
      creditsUsed: creditCost.detector(),
      durationMs: Date.now() - t0
    });
    res.json({ ...parsed, generationId: gen.id });
  })
);

router.post(
  '/plagiarism',
  asyncHandler(async (req, res) => {
    const { text, provider } = schema.parse(req.body);
    await ensureCredits(req.user!.id, creditCost.plagiarism());
    const sys = `You are a plagiarism heuristics analyst. The supplied text MAY contain content paraphrased or copied from common sources.
Return STRICT JSON only:
{"originalityScore":0..1,"flaggedSpans":[{"text":"...","reason":"...","likelySource":"..."}],"summary":"..."}
JSON only.`;
    const { provider: chosen, call } = pickChatProvider(provider);
    const t0 = Date.now();
    const r = await call({
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: text }
      ],
      temperature: 0
    });
    let parsed: any = { originalityScore: 1, flaggedSpans: [], summary: '' };
    try {
      parsed = JSON.parse(r.text.match(/\{[\s\S]*\}/)?.[0] ?? r.text);
    } catch {}
    const gen = await recordGeneration({
      userId: req.user!.id,
      kind: 'PLAGIARISM',
      provider: chosen,
      model: r.model,
      input: { length: text.length },
      output: parsed,
      creditsUsed: creditCost.plagiarism(),
      durationMs: Date.now() - t0
    });
    res.json({ ...parsed, generationId: gen.id });
  })
);

export default router;
