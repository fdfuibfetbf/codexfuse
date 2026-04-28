import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../db.js';
import { forbidden, unauthorized } from '../utils/errors.js';
import type { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) throw unauthorized('Missing bearer token');
    const token = auth.slice('Bearer '.length);
    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true, role: true, isActive: true }
    });
    if (!user || !user.isActive) throw unauthorized('Invalid user');
    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (e) {
    if ((e as Error).name === 'TokenExpiredError') return next(unauthorized('Token expired'));
    if ((e as Error).name === 'JsonWebTokenError') return next(unauthorized('Invalid token'));
    next(e);
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden('Insufficient role'));
    next();
  };
}
