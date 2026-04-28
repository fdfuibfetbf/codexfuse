import { Router } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import { prisma } from '../db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest, conflict, unauthorized } from '../utils/errors.js';
import {
  createRefreshSession,
  hashPassword,
  rotateRefresh,
  signAccessToken,
  signRefreshToken,
  verifyPassword
} from '../services/auth.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  name: z.string().min(1).max(120).optional()
});

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password, name } = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw conflict('Email already registered');
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name ?? null,
        emailVerifyToken: crypto.randomBytes(24).toString('hex')
      }
    });
    // Auto-create a personal workspace
    const slug = `${(name ?? email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${user.id.slice(-4)}`;
    const ws = await prisma.workspace.create({
      data: { name: name ? `${name}'s Workspace` : 'Personal Workspace', slug, ownerId: user.id }
    });
    await prisma.membership.create({ data: { userId: user.id, workspaceId: ws.id, role: 'OWNER' } });

    const access = signAccessToken(user);
    const refresh = signRefreshToken(user.id);
    await createRefreshSession(user.id, refresh, req.headers['user-agent'] ?? undefined, req.ip);
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, credits: user.credits },
      access,
      refresh
    });
  })
);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) throw unauthorized('Invalid credentials');
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw unauthorized('Invalid credentials');
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const access = signAccessToken(user);
    const refresh = signRefreshToken(user.id);
    await createRefreshSession(user.id, refresh, req.headers['user-agent'] ?? undefined, req.ip);
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, credits: user.credits },
      access,
      refresh
    });
  })
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = req.body?.refresh;
    if (!token) throw badRequest('Missing refresh token');
    const result = await rotateRefresh(token);
    res.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        credits: result.user.credits
      },
      access: result.access,
      refresh: result.refresh
    });
  })
);

router.post(
  '/logout',
  requireAuth,
  asyncHandler(async (req, res) => {
    const token = req.body?.refresh as string | undefined;
    if (token) {
      const { sha256 } = await import('../services/auth.js');
      await prisma.refreshToken.updateMany({
        where: { tokenHash: sha256(token), userId: req.user!.id },
        data: { revoked: true }
      });
    }
    res.json({ ok: true });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { plan: true }
    });
    if (!user) throw unauthorized();
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      credits: user.credits,
      avatarUrl: user.avatarUrl,
      plan: user.plan
    });
  })
);

const updateMeSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  avatarUrl: z.string().url().optional()
});
router.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = updateMeSchema.parse(req.body);
    const user = await prisma.user.update({ where: { id: req.user!.id }, data });
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role, credits: user.credits });
  })
);

const changePwSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(200)
});
router.post(
  '/change-password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = changePwSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw unauthorized();
    const ok = await verifyPassword(currentPassword, user.passwordHash);
    if (!ok) throw badRequest('Current password is incorrect');
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    res.json({ ok: true });
  })
);

router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const email = z.string().email().parse(req.body?.email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const resetToken = crypto.randomBytes(24).toString('hex');
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry: new Date(Date.now() + 1000 * 60 * 30) }
      });
      // In production: send email. Here we simply expose the token in dev.
      if (process.env.NODE_ENV !== 'production') {
        return res.json({ ok: true, resetToken });
      }
    }
    res.json({ ok: true });
  })
);

router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const { token, password } = z
      .object({ token: z.string().min(8), password: z.string().min(8).max(200) })
      .parse(req.body);
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } }
    });
    if (!user) throw badRequest('Invalid or expired token');
    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null }
    });
    res.json({ ok: true });
  })
);

export default router;
