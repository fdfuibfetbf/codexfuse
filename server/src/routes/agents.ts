import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { pickChatProvider } from '../providers/index.js';
import { creditCost, ensureCredits } from '../services/credits.js';
import { recordGeneration } from '../services/recordGeneration.js';
import { notFound } from '../utils/errors.js';

const router = Router();
router.use(requireAuth);

const upsert = z.object({
  name: z.string().min(1).max(120),
  description: z.string().optional(),
  goal: z.string().min(1),
  systemPrompt: z.string().optional(),
  model: z.string().optional(),
  tools: z.array(z.string()).optional()
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await prisma.agent.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(items);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = upsert.parse(req.body);
    const item = await prisma.agent.create({
      data: { ...data, userId: req.user!.id, tools: (data.tools ?? []) as any }
    });
    res.status(201).json(item);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await prisma.agent.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { runs: { orderBy: { createdAt: 'desc' }, take: 20 } }
    });
    if (!item) throw notFound();
    res.json(item);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = upsert.partial().parse(req.body);
    await prisma.agent.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { ...data, tools: data.tools ? (data.tools as any) : undefined } as any
    });
    res.json({ ok: true });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.agent.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
    res.json({ ok: true });
  })
);

router.post(
  '/:id/run',
  asyncHandler(async (req, res) => {
    const { input, provider } = z.object({ input: z.string().min(1), provider: z.string().optional() }).parse(req.body);
    const agent = await prisma.agent.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!agent) throw notFound();
    await ensureCredits(req.user!.id, creditCost.agent());
    const run = await prisma.agentRun.create({
      data: { agentId: agent.id, input, status: 'running', steps: [] as any }
    });
    const { call, provider: chosen } = pickChatProvider(provider);
    const t0 = Date.now();
    // Simple plan-then-execute loop (single iteration; expandable to tool-using ReAct)
    const planSys = `${agent.systemPrompt ?? ''}
You are an autonomous agent named "${agent.name}". Goal: ${agent.goal}
Plan briefly (3-5 numbered steps), then EXECUTE by writing the final deliverable.
Output format:
PLAN:
1. ...
2. ...
EXECUTION:
<final deliverable here>`;
    const r = await call({
      messages: [
        { role: 'system', content: planSys },
        { role: 'user', content: input }
      ],
      temperature: 0.4,
      max_tokens: 2000
    });
    const planMatch = r.text.match(/PLAN:[\s\S]*?(?=EXECUTION:|$)/i);
    const execMatch = r.text.match(/EXECUTION:([\s\S]*)/i);
    const steps = planMatch
      ? planMatch[0]
          .replace(/PLAN:/i, '')
          .split(/\n+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const output = execMatch ? execMatch[1].trim() : r.text;
    await prisma.agentRun.update({
      where: { id: run.id },
      data: { status: 'success', steps: steps as any, output }
    });
    await recordGeneration({
      userId: req.user!.id,
      kind: 'AGENT',
      provider: chosen,
      model: r.model,
      input: { agentId: agent.id, input },
      output: { steps, output },
      creditsUsed: creditCost.agent(),
      durationMs: Date.now() - t0
    });
    res.json({ id: run.id, steps, output, provider: chosen, model: r.model });
  })
);

export default router;
