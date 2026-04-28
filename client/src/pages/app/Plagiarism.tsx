import { useState } from 'react';
import { ShieldCheck, Wand2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useToasts } from '@/components/ui/Toast';

export default function PlagiarismPage() {
  const [text, setText] = useState('');
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const push = useToasts((s) => s.push);
  async function go() {
    if (text.length < 20) return;
    setLoading(true);
    try {
      const r: any = await api.post('/detect/plagiarism', { text });
      setOut(r);
    } catch (e: any) {
      push({ title: 'Check failed', description: e.message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <PageHeader eyebrow="Knowledge" title="Plagiarism check" description="Heuristic plagiarism analysis with flagged spans." icon={<ShieldCheck className="h-6 w-6" />} />
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="panel p-5 space-y-4">
          <textarea className="textarea min-h-[260px]" value={text} onChange={(e) => setText(e.target.value)} />
          <button onClick={go} disabled={loading || text.length < 20} className="btn-primary w-full justify-center">{loading ? <Spinner /> : <Wand2 className="h-4 w-4" />} Check</button>
        </div>
        <div className="panel p-6">
          {out ? (
            <div>
              <div className="text-sm text-ink-muted">Originality</div>
              <div className="mt-1 font-display text-5xl gradient-text">{Math.round((out.originalityScore ?? 0) * 100)}%</div>
              <div className="mt-3 text-sm text-ink-dim">{out.summary}</div>
              <div className="mt-5 space-y-2">
                {(out.flaggedSpans ?? []).map((s: any, i: number) => (
                  <div key={i} className="panel p-3">
                    <div className="text-sm">"{s.text}"</div>
                    <div className="text-xs text-ink-muted mt-1">{s.reason} · likely source: {s.likelySource}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-ink-muted py-12">Paste text to check.</div>
          )}
        </div>
      </div>
    </div>
  );
}
