import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { pickTTSProvider, providers } from '../providers/index.js';
import { creditCost, ensureCredits } from '../services/credits.js';
import { recordGeneration } from '../services/recordGeneration.js';
import { ProviderNotConfiguredError } from '../providers/types.js';
import { badRequest } from '../utils/errors.js';

const router = Router();
router.use(requireAuth);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const ttsSchema = z.object({
  text: z.string().min(1).max(8000),
  provider: z.string().optional(),
  voice: z.string().optional(),
  model: z.string().optional()
});

router.post(
  '/tts',
  asyncHandler(async (req, res) => {
    const args = ttsSchema.parse(req.body);
    await ensureCredits(req.user!.id, creditCost.tts(args.text.length));
    const t0 = Date.now();
    const { provider, call } = pickTTSProvider(args.provider);
    const result = await call(args);
    const cost = creditCost.tts(args.text.length);
    const gen = await recordGeneration({
      userId: req.user!.id,
      kind: 'TTS',
      provider,
      model: result.model,
      input: { text: args.text.slice(0, 500), voice: args.voice },
      creditsUsed: cost,
      durationMs: Date.now() - t0
    });
    res.json({
      audioBase64: result.audioBase64,
      mimeType: result.mimeType,
      provider,
      model: result.model,
      generationId: gen.id
    });
  })
);

router.post(
  '/stt',
  upload.single('audio'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest('Missing audio file');
    if (!providers.openai.available()) throw new ProviderNotConfiguredError('openai');
    await ensureCredits(req.user!.id, creditCost.stt(30));
    const t0 = Date.now();
    const result = await providers.openai.stt({
      audio: req.file.buffer,
      filename: req.file.originalname || 'audio.webm',
      language: req.body.language
    });
    const gen = await recordGeneration({
      userId: req.user!.id,
      kind: 'STT',
      provider: result.provider,
      model: result.model,
      input: { language: req.body.language, filename: req.file.originalname },
      output: { text: result.text },
      creditsUsed: creditCost.stt(30),
      durationMs: Date.now() - t0
    });
    res.json({ ...result, generationId: gen.id });
  })
);

router.get(
  '/voices',
  asyncHandler(async (_req, res) => {
    const list: { id: string; name: string; provider: string }[] = [];
    if (providers.elevenlabs.available()) {
      try {
        const data: any = await providers.elevenlabs.listVoices();
        for (const v of data.voices ?? []) {
          list.push({ id: v.voice_id, name: v.name, provider: 'elevenlabs' });
        }
      } catch {}
    }
    if (providers.openai.available()) {
      for (const v of ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']) {
        list.push({ id: v, name: v.charAt(0).toUpperCase() + v.slice(1), provider: 'openai' });
      }
    }
    res.json({ voices: list });
  })
);

export default router;
