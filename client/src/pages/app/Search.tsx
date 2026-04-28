import { useState } from 'react';
import { Search, Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useToasts } from '@/components/ui/Toast';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [out, setOut] = useState<{ answer: string; sources: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const push = useToasts((s) => s.push);
  async function go() {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const r: any = await api.post('/search', { query: q });
      setOut(r);
    } catch (e: any) {
      push({ title: 'Search failed', description: e.message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <PageHeader eyebrow="Knowledge" title="AI Search" description="Real-time web search with cited, synthesised answers." icon={<Search className="h-6 w-6" />} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go();
        }}
        className="panel p-3 flex gap-2 mb-5"
      >
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="What would you like to know?" />
        <button className="btn-primary" disabled={loading || !q.trim()}>{loading ? <Spinner /> : <Wand2 className="h-4 w-4" />} Search</button>
      </form>
      {out ? (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 panel p-6 prose-chat"><ReactMarkdown>{out.answer}</ReactMarkdown></div>
          <div className="panel p-5">
            <div className="text-sm font-semibold mb-3">Sources</div>
            <div className="space-y-2">
              {out.sources.map((s: any, i: number) => (
                <a key={i} href={s.url} target="_blank" rel="noreferrer" className="panel p-3 block hover:border-brand-400/40">
                  <div className="text-sm font-medium text-white truncate">[{i + 1}] {s.title}</div>
                  <div className="text-[11px] text-ink-muted truncate">{s.url}</div>
                  <div className="text-xs text-ink-dim mt-1 line-clamp-2">{s.snippet}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="panel p-12 text-center text-ink-muted">Enter a query above to get started.</div>
      )}
    </div>
  );
}
