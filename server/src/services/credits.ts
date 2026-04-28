import { prisma } from '../db.js';
import { badRequest } from '../utils/errors.js';

export async function ensureCredits(userId: string, cost: number) {
  if (cost <= 0) return;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { credits: true, role: true } });
  if (!user) throw badRequest('User not found');
  if (user.role === 'SUPERADMIN') return; // unlimited
  if (user.credits < cost) throw badRequest('Insufficient credits');
}

export async function deductCredits(userId: string, cost: number) {
  if (cost <= 0) return;
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: cost } }
  });
}

export const creditCost = {
  chat: (tokens: number) => Math.max(1, Math.ceil(tokens / 100)),
  image: () => 50,
  imageEdit: () => 60,
  tts: (chars: number) => Math.max(1, Math.ceil(chars / 50)),
  stt: (seconds: number) => Math.max(1, Math.ceil(seconds / 5)),
  code: (tokens: number) => Math.max(1, Math.ceil(tokens / 100)),
  template: (tokens: number) => Math.max(1, Math.ceil(tokens / 100)),
  rag: (tokens: number) => Math.max(2, Math.ceil(tokens / 80)),
  agent: () => 25,
  workflow: () => 30,
  video: () => 200,
  music: () => 100,
  ocr: () => 5,
  translate: (tokens: number) => Math.max(1, Math.ceil(tokens / 120)),
  detector: () => 3,
  plagiarism: () => 8,
  search: () => 5
};
