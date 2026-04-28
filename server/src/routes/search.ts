import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { pickChatProvider } from '../providers/index.js';
import { creditCost, ensureCredits } from '../services/credits.js';
import { recordGeneration } from '../services/recordGeneration.js';

const router = Router();
router.use(requireAuth);

const schema = z.object({ query: z.string().min(1).max(500), provider: z.string().optional() });

// AI Search synthesises an answer with sources. We use DuckDuckGo's HTML for free results, then summarize.
async function ddgSearch(q: string) {
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
      }
    });
    const html = await res.text();
    const results: { title: string; url: string; snippet: string }[] = [];
    const rx = /<a class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(html)) && results.length < 6) {
      results.push({
        url: decodeURIComponent(m[1].replace(/^.*uddg=/, '').replace(/&.*$/, '')),
        title: m[2].replace(/<[^>]+>/g, '').trim(),
        snippet: m[3].replace(/<[^>]+>/g, '').trim()
      });
    }
    return results;
  } catch {
    return [];
  }
}

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { query, provider } = schema.parse(req.body);
    await ensureCredits(req.user!.id, creditCost.search());
    const sources = await ddgSearch(query);
    const ctx = sources.map((s, i) => `[${i + 1}] ${s.title}\n${s.url}\n${s.snippet}`).join('\n\n');
    const sys = `You are an AI search assistant. Use the supplied web snippets to answer.
- Cite sources inline as [1], [2], etc.
- If sources are empty or insufficient, answer from general knowledge but say so.
- Be concise and structured.`;
    const t0 = Date.now();
    const { provider: chosen, call } = pickChatProvider(provider);
    const r = await call({
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: `Question: ${query}\n\nWeb snippets:\n${ctx || '(none)'}` }
      ],
      temperature: 0.3,
      max_tokens: 800
    });
    const gen = await recordGeneration({
      userId: req.user!.id,
      kind: 'AI_SEARCH',
      provider: chosen,
      model: r.model,
      input: { query },
      output: { answer: r.text, sources },
      creditsUsed: creditCost.search(),
      durationMs: Date.now() - t0
    });
    res.json({ answer: r.text, sources, provider: chosen, model: r.model, generationId: gen.id });
  })
);

export default router;
