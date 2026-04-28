import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { prisma } from '../db.js';
import type { User } from '@prisma/client';

export const hashPassword = (pw: string) => bcrypt.hash(pw, 10);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

export function signAccessToken(user: Pick<User, 'id' | 'email' | 'role'>) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as SignOptions
  );
}

export function signRefreshToken(userId: string) {
  return jwt.sign(
    { sub: userId, jti: crypto.randomBytes(16).toString('hex') },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions
  );
}

export const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

export async function createRefreshSession(userId: string, token: string, ua?: string, ip?: string) {
  const tokenHash = sha256(token);
  const decoded = jwt.decode(token) as { exp?: number } | null;
  const expiresAt = new Date((decoded?.exp ?? Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30) * 1000);
  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt, userAgent: ua ?? null, ip: ip ?? null }
  });
}

export async function rotateRefresh(oldToken: string) {
  const decoded = jwt.verify(oldToken, env.JWT_REFRESH_SECRET) as { sub: string };
  const tokenHash = sha256(oldToken);
  const session = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!session || session.revoked || session.expiresAt < new Date()) {
    throw new Error('Invalid refresh token');
  }
  await prisma.refreshToken.update({ where: { id: session.id }, data: { revoked: true } });
  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user || !user.isActive) throw new Error('Invalid user');
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user.id);
  await createRefreshSession(user.id, refresh);
  return { access, refresh, user };
}

export async function revokeAllSessions(userId: string) {
  await prisma.refreshToken.updateMany({ where: { userId, revoked: false }, data: { revoked: true } });
}
