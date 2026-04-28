import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { notFound } from '../utils/errors.js';

const router = Router();
router.use(requireAuth);

const upsert = z.object({
  name: z.string().min(1).max(120),
  description: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  systemPrompt: z.string().min(1),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  isPublic: z.boolean().optional(),
  tools: z.array(z.string()).optional()
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const bots = await prisma.customBot.findMany({
      where: { OR: [{ userId: req.user!.id }, { isPublic: true }] },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(bots);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = upsert.parse(req.body);
    const bot = await prisma.customBot.create({
      data: {
        userId: req.user!.id,
        name: data.name,
        description: data.description ?? null,
        avatarUrl: data.avatarUrl || null,
        systemPrompt: data.systemPrompt,
        model: data.model ?? null,
        temperature: data.temperature ?? 0.7,
        isPublic: data.isPublic ?? false,
        tools: (data.tools ?? []) as any
      }
    });
    res.status(201).json(bot);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const bot = await prisma.customBot.findFirst({
      where: { id: req.params.id, OR: [{ userId: req.user!.id }, { isPublic: true }] }
    });
    if (!bot) throw notFound();
    res.json(bot);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = upsert.partial().parse(req.body);
    const bot = await prisma.customBot.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: {
        ...data,
        avatarUrl: data.avatarUrl || null,
        tools: data.tools ? (data.tools as any) : undefined
      } as any
    });
    if (bot.count === 0) throw notFound();
    res.json({ ok: true });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.customBot.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
    res.json({ ok: true });
  })
);

export default router;
