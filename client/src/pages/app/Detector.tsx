import { useState } from 'react';
import { ShieldCheck, Wand2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useToasts } from '@/components/ui/Toast';

export default function DetectorPage() {
  const [text, setText] = useState('');
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const push = useToasts((s) => s.push);
  async function go() {
    if (text.length < 20) return;
    setLoading(true);
    try {
      const r: any = await api.post('/detect/ai-detector', { text });
      setOut(r);
    } catch (e: any) {
      push({ title: 'Detection failed', description: e.message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <PageHeader eyebrow="Knowledge" title="AI detector" description="Estimate the probability that text was AI-generated." icon={<ShieldCheck className="h-6 w-6" />} />
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="panel p-5 space-y-4">
          <label className="label">Text</label>
          <textarea className="textarea min-h-[260px]" value={text} onChange={(e) => setText(e.target.value)} />
          <button onClick={go} disabled={loading || text.length < 20} className="btn-primary w-full justify-center">{loading ? <Spinner /> : <Wand2 className="h-4 w-4" />} Analyze</button>
        </div>
        <div className="panel p-6">
          {out ? (
            <div>
              <div className="text-sm text-ink-muted">AI probability</div>
              <div className="mt-1 font-display text-5xl gradient-text">{Math.round((out.aiProbability ?? 0) * 100)}%</div>
              <div className="mt-3 chip">Verdict: {out.verdict}</div>
              <ul className="mt-5 space-y-1.5 text-sm text-ink-dim list-disc pl-5">
                {(out.reasons ?? []).map((r: string, i: number) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          ) : (
            <div className="text-center text-ink-muted py-12">Paste text to analyze.</div>
          )}
        </div>
      </div>
    </div>
  );
}
