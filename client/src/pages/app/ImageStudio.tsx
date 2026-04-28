import { useState } from 'react';
import { Image as ImageIcon, Sparkles, Wand2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useToasts } from '@/components/ui/Toast';

interface ImgResult { url?: string; b64?: string }

export default function ImageStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [provider, setProvider] = useState('openai');
  const [size, setSize] = useState('1024x1024');
  const [n, setN] = useState(1);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ImgResult[]>([]);
  const push = useToasts((s) => s.push);

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const r: any = await api.post('/image/generate', { prompt, provider, size, n });
      setImages(r.images);
    } catch (e: any) {
      push({ title: 'Generation failed', description: e.message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Create"
        title="Image studio"
        description="Generate images with DALL-E, FLUX, Stable Diffusion and more."
        icon={<ImageIcon className="h-6 w-6" />}
      />
      <div className="grid lg:grid-cols-[360px_1fr] gap-5">
        <aside className="panel p-5 space-y-4">
          <div>
            <label className="label">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="textarea"
              placeholder="An astronaut surfing a wave of stars, cinematic lighting…"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Provider</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)} className="select">
                <option value="openai">OpenAI · DALL·E</option>
                <option value="stability">Stability · SD 3.5</option>
                <option value="replicate">Replicate · FLUX</option>
              </select>
            </div>
            <div>
              <label className="label">Size</label>
              <select value={size} onChange={(e) => setSize(e.target.value)} className="select">
                <option>1024x1024</option>
                <option>1792x1024</option>
                <option>1024x1792</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Variations: {n}</label>
            <input type="range" min={1} max={4} value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full" />
          </div>
          <button onClick={generate} disabled={loading || !prompt.trim()} className="btn-primary w-full justify-center">
            {loading ? <Spinner /> : <Wand2 className="h-4 w-4" />} Generate
          </button>
        </aside>
        <section>
          {images.length === 0 ? (
            <div className="panel p-12 text-center text-ink-muted">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-white/[0.04] flex items-center justify-center text-brand-300 mb-4">
                <Sparkles className="h-7 w-7" />
              </div>
              Your generations will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((img, i) => (
                <div key={i} className="panel p-3">
                  <img
                    src={img.url ?? `data:image/png;base64,${img.b64}`}
                    alt="generation"
                    className="rounded-xl w-full"
                  />
                  <a
                    href={img.url ?? `data:image/png;base64,${img.b64}`}
                    download={`codexfuse-${i}.png`}
                    className="mt-2 inline-block text-xs text-ink-dim hover:text-white"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
