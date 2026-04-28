import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { providers } from '../providers/index.js';
import { ProviderNotConfiguredError } from '../providers/types.js';
import { creditCost, ensureCredits } from '../services/credits.js';
import { recordGeneration } from '../services/recordGeneration.js';
import OpenAI from 'openai';
import { env } from '../config/env.js';
import { badRequest } from '../utils/errors.js';

const router = Router();
router.use(requireAuth);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

router.post(
  '/',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest('Missing image file');
    if (!providers.openai.available()) throw new ProviderNotConfiguredError('openai');
    await ensureCredits(req.user!.id, creditCost.ocr());
    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY, baseURL: env.OPENAI_BASE_URL });
    const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const t0 = Date.now();
    const result = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You extract all visible text from images verbatim, preserving line breaks and structure. Output ONLY the extracted text, no commentary.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract all text from this image:' },
            { type: 'image_url', image_url: { url: dataUrl } } as any
          ] as any
        }
      ],
      max_tokens: 2000
    });
    const text = result.choices[0]?.message?.content ?? '';
    const gen = await recordGeneration({
      userId: req.user!.id,
      kind: 'OCR',
      provider: 'openai',
      model: 'gpt-4o-mini',
      input: { filename: req.file.originalname },
      output: { text },
      creditsUsed: creditCost.ocr(),
      durationMs: Date.now() - t0
    });
    res.json({ text, generationId: gen.id });
  })
);

export default router;
