import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { pickChatProvider } from '../providers/index.js';
import { creditCost, ensureCredits } from '../services/credits.js';
import { recordGeneration } from '../services/recordGeneration.js';

const router = Router();
router.use(requireAuth);

const codeSchema = z.object({
  task: z.string().min(1),
  language: z.string().min(1),
  context: z.string().optional(),
  mode: z.enum(['generate', 'explain', 'refactor', 'debug', 'tests']).default('generate'),
  provider: z.string().optional(),
  model: z.string().optional()
});

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const args = codeSchema.parse(req.body);
    await ensureCredits(req.user!.id, creditCost.code(args.task.length));

    const sys = `You are an elite ${args.language} developer working in CodexFuse.
Mode: ${args.mode}.
- Output clean, idiomatic, runnable ${args.language} code.
- Prefer modern syntax and best practices.
- Include short comments only where they meaningfully aid understanding.
- Wrap final code in a single fenced \`\`\`${args.language} block.`;

    const userMsg = `${args.context ? `Context:\n${args.context}\n\n` : ''}Task:\n${args.task}`;

    const t0 = Date.now();
    const { provider, call } = pickChatProvider(args.provider);
    const result = await call({
      model: args.model,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: userMsg }
      ],
      temperature: 0.2,
      max_tokens: 2048
    });

    const cost = creditCost.code(result.outputTokens || result.text.length);
    const gen = await recordGeneration({
      userId: req.user!.id,
      kind: 'CODE',
      provider,
      model: result.model,
      input: args,
      output: { text: result.text },
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      creditsUsed: cost,
      durationMs: Date.now() - t0
    });
    res.json({ text: result.text, provider, model: result.model, generationId: gen.id });
  })
);

export default router;
