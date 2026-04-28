import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { providerStatus } from '../config/env.js';

const router = Router();
router.use(requireAuth, requireRole('ADMIN', 'SUPERADMIN'));

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [users, generations, plans, workspaces, last30] = await Promise.all([
      prisma.user.count(),
      prisma.generation.count(),
      prisma.plan.count(),
      prisma.workspace.count(),
      prisma.generation.groupBy({
        by: ['kind'],
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        _count: { _all: true },
        _sum: { creditsUsed: true }
      })
    ]);
    const recent = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
    res.json({ users, generations, plans, workspaces, last30, recent, providers: providerStatus() });
  })
);

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? '');
    const take = Math.min(Number(req.query.take ?? 50), 200);
    const users = await prisma.user.findMany({
      where: q
        ? { OR: [{ email: { contains: q, mode: 'insensitive' } }, { name: { contains: q, mode: 'insensitive' } }] }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        credits: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        plan: { select: { id: true, name: true } }
      }
    });
    res.json(users);
  })
);

const updateUser = z.object({
  role: z.enum(['USER', 'ADMIN', 'SUPERADMIN']).optional(),
  credits: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  planId: z.string().nullable().optional()
});
router.patch(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const data = updateUser.parse(req.body);
    const user = await prisma.user.update({ where: { id: req.params.id }, data });
    res.json({ id: user.id });
  })
);

router.get(
  '/plans',
  asyncHandler(async (_req, res) => {
    res.json(await prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } }));
  })
);
router.post(
  '/plans',
  asyncHandler(async (req, res) => {
    const data = z
      .object({
        name: z.string(),
        description: z.string().optional(),
        priceCents: z.number().int().min(0),
        currency: z.string().default('USD'),
        interval: z.enum(['MONTH', 'YEAR', 'ONE_TIME']).default('MONTH'),
        monthlyCredits: z.number().int().min(0),
        features: z.record(z.any()).default({}),
        isActive: z.boolean().default(true),
        sortOrder: z.number().int().default(0)
      })
      .parse(req.body);
    const p = await prisma.plan.create({ data });
    res.status(201).json(p);
  })
);
router.patch(
  '/plans/:id',
  asyncHandler(async (req, res) => {
    const data = z
      .object({
        name: z.string().optional(),
        description: z.string().optional(),
        priceCents: z.number().int().min(0).optional(),
        currency: z.string().optional(),
        interval: z.enum(['MONTH', 'YEAR', 'ONE_TIME']).optional(),
        monthlyCredits: z.number().int().min(0).optional(),
        features: z.record(z.any()).optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().int().optional()
      })
      .parse(req.body);
    await prisma.plan.update({ where: { id: req.params.id }, data });
    res.json({ ok: true });
  })
);
router.delete(
  '/plans/:id',
  asyncHandler(async (req, res) => {
    await prisma.plan.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

router.get(
  '/templates',
  asyncHandler(async (_req, res) => {
    res.json(await prisma.promptTemplate.findMany({ orderBy: { sortOrder: 'asc' } }));
  })
);
router.post(
  '/templates',
  asyncHandler(async (req, res) => {
    const data = z
      .object({
        slug: z.string(),
        name: z.string(),
        category: z.string(),
        description: z.string().optional(),
        icon: z.string().optional(),
        systemPrompt: z.string().optional(),
        promptTemplate: z.string(),
        fields: z.array(z.any()).default([]),
        defaultModel: z.string().optional(),
        isActive: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
        sortOrder: z.number().int().default(0)
      })
      .parse(req.body);
    const t = await prisma.promptTemplate.create({ data });
    res.status(201).json(t);
  })
);
router.patch(
  '/templates/:id',
  asyncHandler(async (req, res) => {
    await prisma.promptTemplate.update({ where: { id: req.params.id }, data: req.body });
    res.json({ ok: true });
  })
);
router.delete(
  '/templates/:id',
  asyncHandler(async (req, res) => {
    await prisma.promptTemplate.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

router.get(
  '/usage',
  asyncHandler(async (_req, res) => {
    const totals = await prisma.generation.groupBy({
      by: ['kind', 'provider'],
      _count: { _all: true },
      _sum: { creditsUsed: true, inputTokens: true, outputTokens: true }
    });
    const series = await prisma.$queryRawUnsafe<any[]>(
      `select date_trunc('day', "createdAt") as day, count(*)::int as count, coalesce(sum("creditsUsed"),0)::int as credits
       from "Generation"
       where "createdAt" > now() - interval '30 days'
       group by 1 order by 1 asc`
    ).catch(() => []);
    res.json({ totals, series });
  })
);

router.get(
  '/audit',
  asyncHandler(async (_req, res) => {
    const items = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: { select: { id: true, email: true } } }
    });
    res.json(items);
  })
);

router.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    const items = await prisma.setting.findMany();
    res.json(items);
  })
);

router.put(
  '/settings/:key',
  asyncHandler(async (req, res) => {
    const value = req.body?.value;
    const item = await prisma.setting.upsert({
      where: { key: req.params.key },
      create: { key: req.params.key, value },
      update: { value }
    });
    res.json(item);
  })
);

export default router;
