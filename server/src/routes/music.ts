import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { providers } from '../providers/index.js';
import { ProviderNotConfiguredError } from '../providers/types.js';
import { creditCost, ensureCredits } from '../services/credits.js';
import { recordGeneration } from '../services/recordGeneration.js';

const router = Router();
router.use(requireAuth);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { prompt, model } = z
      .object({ prompt: z.string().min(1), model: z.string().optional() })
      .parse(req.body);
    if (!providers.replicate.available()) throw new ProviderNotConfiguredError('replicate');
    await ensureCredits(req.user!.id, creditCost.music());
    const t0 = Date.now();
    const result: any = await providers.replicate.music(prompt, model);
    const url = Array.isArray(result.output) ? result.output[0] : result.output;
    const gen = await recordGeneration({
      userId: req.user!.id,
      kind: 'MUSIC',
      provider: 'replicate',
      model: model ?? 'meta/musicgen',
      input: { prompt },
      output: { url },
      creditsUsed: creditCost.music(),
      durationMs: Date.now() - t0
    });
    res.json({ url, provider: 'replicate', generationId: gen.id });
  })
);

export default router;
