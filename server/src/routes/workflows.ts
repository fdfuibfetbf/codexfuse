import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { pickChatProvider, pickImageProvider } from '../providers/index.js';
import { creditCost, ensureCredits } from '../services/credits.js';
import { recordGeneration } from '../services/recordGeneration.js';
import { notFound } from '../utils/errors.js';

const router = Router();
router.use(requireAuth);

const node = z.object({
  id: z.string(),
  type: z.enum(['prompt', 'chat', 'image', 'transform', 'output']),
  data: z.record(z.any()).default({})
});
const upsert = z.object({
  name: z.string().min(1).max(120),
  description: z.string().optional(),
  nodes: z.array(node).default([]),
  edges: z
    .array(
      z.object({
        id: z.string(),
        source: z.string(),
        target: z.string()
      })
    )
    .default([]),
  isActive: z.boolean().optional()
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await prisma.workflow.findMany({
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
    const wf = await prisma.workflow.create({
      data: {
        userId: req.user!.id,
        name: data.name,
        description: data.description ?? null,
        nodes: data.nodes as any,
        edges: data.edges as any,
        isActive: data.isActive ?? true
      }
    });
    res.status(201).json(wf);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const wf = await prisma.workflow.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { runs: { orderBy: { createdAt: 'desc' }, take: 20 } }
    });
    if (!wf) throw notFound();
    res.json(wf);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = upsert.partial().parse(req.body);
    await prisma.workflow.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: {
        ...data,
        nodes: data.nodes ? (data.nodes as any) : undefined,
        edges: data.edges ? (data.edges as any) : undefined
      } as any
    });
    res.json({ ok: true });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.workflow.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
    res.json({ ok: true });
  })
);

router.post(
  '/:id/run',
  asyncHandler(async (req, res) => {
    const { input } = z.object({ input: z.record(z.any()).default({}) }).parse(req.body ?? {});
    const wf = await prisma.workflow.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!wf) throw notFound();
    await ensureCredits(req.user!.id, creditCost.workflow());
    const run = await prisma.workflowRun.create({
      data: { workflowId: wf.id, input: input as any, status: 'running', log: [] as any }
    });
    const log: any[] = [];
    const variables: Record<string, any> = { ...input };
    const t0 = Date.now();
    try {
      // Execute nodes in declared order (simple linear executor; visual editor on the FE).
      for (const n of wf.nodes as any[]) {
        const t = n.type;
        const data = n.data ?? {};
        if (t === 'prompt') {
          variables[n.id] = String(data.template ?? '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => String(variables[k] ?? ''));
          log.push({ node: n.id, type: t, output: variables[n.id] });
        } else if (t === 'chat') {
          const { call, provider } = pickChatProvider(data.provider);
          const r = await call({
            messages: [
              ...(data.system ? [{ role: 'system' as const, content: String(data.system) }] : []),
              {
                role: 'user' as const,
                content: String(data.input ?? variables[data.inputFrom] ?? '')
              }
            ],
            model: data.model,
            temperature: data.temperature ?? 0.7
          });
          variables[n.id] = r.text;
          log.push({ node: n.id, type: t, provider, model: r.model, output: r.text });
        } else if (t === 'image') {
          const { call, provider } = pickImageProvider(data.provider);
          const prompt = String(data.prompt ?? variables[data.promptFrom] ?? '');
          const r = await call({ prompt });
          variables[n.id] = r.images;
          log.push({ node: n.id, type: t, provider, model: r.model, output: { images: r.images.length } });
        } else if (t === 'transform') {
          // simple JS-like template
          variables[n.id] = String(data.template ?? '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => String(variables[k] ?? ''));
          log.push({ node: n.id, type: t, output: variables[n.id] });
        } else if (t === 'output') {
          variables['__output__'] = variables[data.from] ?? variables[n.id];
          log.push({ node: n.id, type: t, output: variables['__output__'] });
        }
      }
      await prisma.workflowRun.update({
        where: { id: run.id },
        data: {
          status: 'success',
          output: { variables, output: variables['__output__'] } as any,
          log: log as any
        }
      });
      await recordGeneration({
        userId: req.user!.id,
        kind: 'WORKFLOW',
        provider: 'codexfuse',
        input: { workflowId: wf.id },
        output: { output: variables['__output__'] },
        creditsUsed: creditCost.workflow(),
        durationMs: Date.now() - t0
      });
      res.json({ id: run.id, status: 'success', output: variables['__output__'], log });
    } catch (e: any) {
      await prisma.workflowRun.update({
        where: { id: run.id },
        data: { status: 'failed', log: [...log, { error: e.message }] as any }
      });
      res.status(500).json({ id: run.id, status: 'failed', error: e.message, log });
    }
  })
);

export default router;
