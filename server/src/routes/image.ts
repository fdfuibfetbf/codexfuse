import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import OpenAI from 'openai';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { pickImageProvider } from '../providers/index.js';
import { creditCost, ensureCredits } from '../services/credits.js';
import { recordGeneration } from '../services/recordGeneration.js';
import { env } from '../config/env.js';
import { ProviderNotConfiguredError } from '../providers/types.js';

const router = Router();
router.use(requireAuth);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const genSchema = z.object({
  prompt: z.string().min(1),
  provider: z.string().optional(),
  model: z.string().optional(),
  n: z.number().int().min(1).max(4).optional(),
  size: z.string().optional(),
  negativePrompt: z.string().optional()
});

router.post(
  '/generate',
  asyncHandler(async (req, res) => {
    const args = genSchema.parse(req.body);
    await ensureCredits(req.user!.id, creditCost.image() * (args.n ?? 1));
    const t0 = Date.now();
    const { provider, call } = pickImageProvider(args.provider);
    const result = await call(args);
    const cost = creditCost.image() * result.images.length;
    const gen = await recordGeneration({
      userId: req.user!.id,
      kind: 'IMAGE',
      provider,
      model: result.model,
      input: args,
      output: { count: result.images.length },
      creditsUsed: cost,
      durationMs: Date.now() - t0
    });
    res.json({ ...result, generationId: gen.id });
  })
);

router.post(
  '/edit',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const prompt = String(req.body.prompt ?? '');
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
    if (!req.file) return res.status(400).json({ error: 'Missing image file' });
    if (!env.OPENAI_API_KEY) throw new ProviderNotConfiguredError('openai');
    await ensureCredits(req.user!.id, creditCost.imageEdit());
    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY, baseURL: env.OPENAI_BASE_URL });
    const file = new File([new Uint8Array(req.file.buffer)], req.file.originalname || 'image.png', {
      type: req.file.mimetype || 'image/png'
    });
    const t0 = Date.now();
    const result = await client.images.edit({
      model: 'gpt-image-1',
      image: file,
      prompt
    });
    const images = (result.data ?? []).map((d: any) => ({ url: d.url, b64: d.b64_json }));
    const gen = await recordGeneration({
      userId: req.user!.id,
      kind: 'IMAGE_EDIT',
      provider: 'openai',
      model: 'gpt-image-1',
      input: { prompt },
      output: { count: images.length },
      creditsUsed: creditCost.imageEdit(),
      durationMs: Date.now() - t0
    });
    res.json({ images, provider: 'openai', model: 'gpt-image-1', generationId: gen.id });
  })
);

export default router;
