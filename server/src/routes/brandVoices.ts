import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { pickChatProvider } from '../providers/index.js';

const router = Router();
router.use(requireAuth);

const upsert = z.object({
  name: z.string().min(1).max(120),
  description: z.string().optional(),
  tone: z.string().optional(),
  styleGuide: z.string().optional(),
  sample: z.string().optional()
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await prisma.brandVoice.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(items);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = upsert.parse(req.body);
    const item = await prisma.brandVoice.create({ data: { ...data, userId: req.user!.id } });
    res.status(201).json(item);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = upsert.partial().parse(req.body);
    await prisma.brandVoice.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data
    });
    res.json({ ok: true });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.brandVoice.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
    res.json({ ok: true });
  })
);

router.post(
  '/analyze',
  asyncHandler(async (req, res) => {
    const { sample, provider } = z.object({ sample: z.string().min(50), provider: z.string().optional() }).parse(req.body);
    const sys = `Analyze the writing sample. Return STRICT JSON:
{"tone":"...","styleGuide":"- bullet points of style rules","summary":"..."}`;
    const { call } = pickChatProvider(provider);
    const r = await call({
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: sample }
      ],
      temperature: 0.2
    });
    let parsed: any = { tone: '', styleGuide: '', summary: '' };
    try {
      parsed = JSON.parse(r.text.match(/\{[\s\S]*\}/)?.[0] ?? r.text);
    } catch {}
    res.json(parsed);
  })
);

export default router;
