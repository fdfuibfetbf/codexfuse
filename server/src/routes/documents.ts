import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { prisma } from '../db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { providers } from '../providers/index.js';
import { ProviderNotConfiguredError } from '../providers/types.js';
import { pickChatProvider } from '../providers/index.js';
import { creditCost, ensureCredits } from '../services/credits.js';
import { recordGeneration } from '../services/recordGeneration.js';
import { badRequest, notFound } from '../utils/errors.js';

const router = Router();
router.use(requireAuth);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

function chunkText(text: string, chunkSize = 1200, overlap = 150) {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks;
}

function cosine(a: number[], b: number[]) {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const docs = await prisma.document.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, mimeType: true, sizeBytes: true, status: true, createdAt: true }
    });
    res.json(docs);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.document.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
    res.json({ ok: true });
  })
);

router.post(
  '/upload',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest('Missing file');
    let text = '';
    const mt = req.file.mimetype || '';
    const buf = req.file.buffer;
    if (mt.startsWith('text/') || mt === 'application/json' || mt === 'text/markdown') {
      text = buf.toString('utf8');
    } else if (mt === 'application/pdf') {
      // Lazy parse via pdfjs-dist in production; for now, fall back to text extraction skip.
      text = `[PDF uploaded: ${req.file.originalname}]\n(For full PDF extraction install a parser like pdf-parse or pdfjs-dist.)`;
    } else {
      text = buf.toString('utf8');
    }
    const doc = await prisma.document.create({
      data: {
        userId: req.user!.id,
        name: req.file.originalname,
        mimeType: mt,
        sizeBytes: buf.length,
        text,
        status: 'embedding'
      }
    });
    // Embed if OpenAI is configured
    if (providers.openai.available()) {
      const chunks = chunkText(text);
      const embed = await providers.openai.embed({ texts: chunks });
      await prisma.$transaction(
        chunks.map((c, i) =>
          prisma.documentChunk.create({
            data: {
              documentId: doc.id,
              index: i,
              content: c,
              embedding: embed.vectors[i] as any
            }
          })
        )
      );
      await prisma.document.update({ where: { id: doc.id }, data: { status: 'ready' } });
    } else {
      await prisma.document.update({ where: { id: doc.id }, data: { status: 'ready-no-embedding' } });
    }
    res.json({ id: doc.id, name: doc.name, status: 'ready' });
  })
);

const askSchema = z.object({
  question: z.string().min(1),
  documentIds: z.array(z.string()).optional(),
  provider: z.string().optional()
});

router.post(
  '/ask',
  asyncHandler(async (req, res) => {
    const args = askSchema.parse(req.body);
    if (!providers.openai.available()) throw new ProviderNotConfiguredError('openai');
    await ensureCredits(req.user!.id, creditCost.rag(args.question.length));
    const chunks = await prisma.documentChunk.findMany({
      where: {
        document: {
          userId: req.user!.id,
          ...(args.documentIds?.length ? { id: { in: args.documentIds } } : {})
        }
      },
      include: { document: { select: { name: true, id: true } } }
    });
    if (chunks.length === 0) throw badRequest('No documents available. Upload one first.');
    const qEmbed = (await providers.openai.embed({ texts: [args.question] })).vectors[0];
    const ranked = chunks
      .map((c) => ({ c, score: cosine(qEmbed, (c.embedding as any) ?? []) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
    const context = ranked
      .map((r, i) => `[${i + 1}] (${r.c.document.name})\n${r.c.content}`)
      .join('\n\n');
    const sys = `You are a Q&A assistant grounded ONLY in the provided context.
Cite sources inline like [1], [2]. If the answer isn't in the context, say so plainly.`;
    const t0 = Date.now();
    const { provider, call } = pickChatProvider(args.provider);
    const r = await call({
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: `Question: ${args.question}\n\nContext:\n${context}` }
      ],
      temperature: 0.2,
      max_tokens: 800
    });
    const gen = await recordGeneration({
      userId: req.user!.id,
      kind: 'RAG',
      provider,
      model: r.model,
      input: { question: args.question, documentIds: args.documentIds },
      output: { answer: r.text },
      creditsUsed: creditCost.rag(r.outputTokens || r.text.length),
      durationMs: Date.now() - t0
    });
    res.json({
      answer: r.text,
      sources: ranked.map((rk, i) => ({
        index: i + 1,
        documentId: rk.c.documentId,
        documentName: rk.c.document.name,
        score: Number(rk.score.toFixed(3))
      })),
      provider,
      model: r.model,
      generationId: gen.id
    });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.user!.id }
    });
    if (!doc) throw notFound();
    res.json(doc);
  })
);

export default router;
