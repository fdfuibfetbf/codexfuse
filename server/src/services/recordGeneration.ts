import { GenerationKind, GenerationStatus } from '@prisma/client';
import { prisma } from '../db.js';
import { deductCredits } from './credits.js';

export async function recordGeneration(args: {
  userId: string;
  kind: GenerationKind;
  provider: string;
  model?: string;
  input: unknown;
  output?: unknown;
  status?: GenerationStatus;
  error?: string;
  inputTokens?: number;
  outputTokens?: number;
  creditsUsed?: number;
  durationMs?: number;
}) {
  const gen = await prisma.generation.create({
    data: {
      userId: args.userId,
      kind: args.kind,
      provider: args.provider,
      model: args.model ?? null,
      input: args.input as any,
      output: (args.output ?? null) as any,
      status: args.status ?? GenerationStatus.SUCCESS,
      error: args.error ?? null,
      inputTokens: args.inputTokens ?? 0,
      outputTokens: args.outputTokens ?? 0,
      creditsUsed: args.creditsUsed ?? 0,
      durationMs: args.durationMs ?? 0
    }
  });
  if (args.creditsUsed && args.creditsUsed > 0) {
    await deductCredits(args.userId, args.creditsUsed);
  }
  return gen;
}
