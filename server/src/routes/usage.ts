import { Router } from 'express';
import { prisma } from '../db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const totals = await prisma.generation.groupBy({
      by: ['kind'],
      where: { userId: req.user!.id, createdAt: { gte: since } },
      _count: { _all: true },
      _sum: { creditsUsed: true, inputTokens: true, outputTokens: true }
    });
    const recent = await prisma.generation.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        id: true,
        kind: true,
        provider: true,
        model: true,
        creditsUsed: true,
        durationMs: true,
        createdAt: true,
        status: true
      }
    });
    res.json({ totals, recent });
  })
);

export default router;
