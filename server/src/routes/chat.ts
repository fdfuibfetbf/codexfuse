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

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const chats = await prisma.chat.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: 'desc' },
      take: 100,
      select: { id: true, title: true, model: true, updatedAt: true, botId: true }
    });
    res.json(chats);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { title, model, systemPrompt, botId } = z
      .object({
        title: z.string().optional(),
        model: z.string().optional(),
        systemPrompt: z.string().optional(),
        botId: z.string().optional()
      })
      .parse(req.body ?? {});
    const chat = await prisma.chat.create({
      data: {
        userId: req.user!.id,
        title: title ?? 'New chat',
        model: model ?? null,
        systemPrompt: systemPrompt ?? null,
        botId: botId ?? null
      }
    });
    res.status(201).json(chat);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const chat = await prisma.chat.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { messages: { orderBy: { createdAt: 'asc' } }, bot: true }
    });
    if (!chat) throw notFound('Chat not found');
    res.json(chat);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.chat.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
    res.json({ ok: true });
  })
);

const sendSchema = z.object({
  message: z.string().min(1),
  provider: z.string().optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional()
});

router.post(
  '/:id/messages',
  asyncHandler(async (req, res) => {
    const { message, provider, model, temperature } = sendSchema.parse(req.body);
    const chat = await prisma.chat.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { messages: { orderBy: { createdAt: 'asc' } }, bot: true }
    });
    if (!chat) throw notFound('Chat not found');

    await ensureCredits(req.user!.id, creditCost.chat(message.length));

    await prisma.chatMessage.create({
      data: { chatId: chat.id, role: 'user', content: message }
    });

    const systemPrompt = chat.bot?.systemPrompt ?? chat.systemPrompt ?? 'You are CodexFuse, a helpful AI assistant.';

    const history = [
      { role: 'system' as const, content: systemPrompt },
      ...chat.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      { role: 'user' as const, content: message }
    ];

    const t0 = Date.now();
    const { provider: chosen, call } = pickChatProvider(provider);
    const result = await call({
      model: model ?? chat.bot?.model ?? chat.model ?? undefined,
      temperature: temperature ?? chat.bot?.temperature ?? undefined,
      messages: history
    });

    await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        role: 'assistant',
        content: result.text,
        meta: { provider: chosen, model: result.model } as any
      }
    });

    if (chat.title === 'New chat' && message.length > 0) {
      const newTitle = message.slice(0, 60).trim();
      await prisma.chat.update({ where: { id: chat.id }, data: { title: newTitle } });
    } else {
      await prisma.chat.update({ where: { id: chat.id }, data: { updatedAt: new Date() } });
    }

    const cost = creditCost.chat(result.outputTokens || message.length);
    await recordGeneration({
      userId: req.user!.id,
      kind: 'CHAT',
      provider: chosen,
      model: result.model,
      input: { message },
      output: { text: result.text },
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      creditsUsed: cost,
      durationMs: Date.now() - t0
    });

    res.json({ message: result.text, provider: chosen, model: result.model });
  })
);

export default router;
