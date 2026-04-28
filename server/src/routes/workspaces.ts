import { Router } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import { prisma } from '../db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { badRequest, forbidden, notFound } from '../utils/errors.js';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const memberships = await prisma.membership.findMany({
      where: { userId: req.user!.id },
      include: { workspace: true }
    });
    res.json(memberships.map((m) => ({ ...m.workspace, role: m.role })));
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name } = z.object({ name: z.string().min(1).max(80) }).parse(req.body);
    const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    const slug = `${slugBase}-${crypto.randomBytes(2).toString('hex')}`;
    const ws = await prisma.workspace.create({ data: { name, slug, ownerId: req.user!.id } });
    await prisma.membership.create({
      data: { userId: req.user!.id, workspaceId: ws.id, role: 'OWNER' }
    });
    res.status(201).json(ws);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const ws = await prisma.workspace.findFirst({
      where: { id: req.params.id, memberships: { some: { userId: req.user!.id } } },
      include: { memberships: { include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } } } }
    });
    if (!ws) throw notFound();
    res.json(ws);
  })
);

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER')
});
router.post(
  '/:id/invite',
  asyncHandler(async (req, res) => {
    const { email, role } = inviteSchema.parse(req.body);
    const m = await prisma.membership.findFirst({
      where: { workspaceId: req.params.id, userId: req.user!.id, role: { in: ['OWNER', 'ADMIN'] } }
    });
    if (!m) throw forbidden();
    const token = crypto.randomBytes(24).toString('hex');
    const inv = await prisma.invitation.create({
      data: {
        email,
        workspaceId: req.params.id,
        role,
        token,
        inviterId: req.user!.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
      }
    });
    res.status(201).json({ id: inv.id, token, email, role });
  })
);

router.post(
  '/accept/:token',
  asyncHandler(async (req, res) => {
    const inv = await prisma.invitation.findUnique({ where: { token: req.params.token } });
    if (!inv || inv.acceptedAt || inv.expiresAt < new Date()) throw badRequest('Invalid invitation');
    await prisma.membership.upsert({
      where: { userId_workspaceId: { userId: req.user!.id, workspaceId: inv.workspaceId } },
      update: { role: inv.role },
      create: { userId: req.user!.id, workspaceId: inv.workspaceId, role: inv.role }
    });
    await prisma.invitation.update({ where: { id: inv.id }, data: { acceptedAt: new Date() } });
    res.json({ ok: true, workspaceId: inv.workspaceId });
  })
);

router.delete(
  '/:id/members/:userId',
  asyncHandler(async (req, res) => {
    const m = await prisma.membership.findFirst({
      where: { workspaceId: req.params.id, userId: req.user!.id, role: { in: ['OWNER', 'ADMIN'] } }
    });
    if (!m) throw forbidden();
    await prisma.membership.deleteMany({
      where: { workspaceId: req.params.id, userId: req.params.userId }
    });
    res.json({ ok: true });
  })
);

export default router;
