import { useState } from 'react';
import { Music2, Wand2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useToasts } from '@/components/ui/Toast';

export default function MusicPage() {
  const [prompt, setPrompt] = useState('');
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const push = useToasts((s) => s.push);
  async function go() {
    setLoading(true);
    try {
      const r: any = await api.post('/music', { prompt });
      setUrl(r.url);
    } catch (e: any) {
      push({ title: 'Music failed', description: e.message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <PageHeader eyebrow="Create" title="Music gen" description="Compose short royalty-free music with text." icon={<Music2 className="h-6 w-6" />} />
      <div className="grid lg:grid-cols-[400px_1fr] gap-5">
        <aside className="panel p-5 space-y-4">
          <textarea className="textarea min-h-[160px]" placeholder="Lo-fi beat with mellow piano and crackling vinyl…" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <button onClick={go} disabled={loading || !prompt.trim()} className="btn-primary w-full justify-center">{loading ? <Spinner /> : <Wand2 className="h-4 w-4" />} Compose</button>
          <div className="text-xs text-ink-muted">Powered by Replicate · MusicGen.</div>
        </aside>
        <section className="panel p-5">
          {url ? <audio controls src={url} className="w-full" /> : <div className="text-center text-ink-muted py-16">Your composition will appear here.</div>}
        </section>
      </div>
    </div>
  );
}
