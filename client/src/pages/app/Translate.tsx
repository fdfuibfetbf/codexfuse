import { useState } from 'react';
import { Languages, Wand2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useToasts } from '@/components/ui/Toast';

const LANGS = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Polish', 'Russian', 'Arabic', 'Hindi', 'Urdu', 'Bengali', 'Chinese (Simplified)', 'Japanese', 'Korean', 'Turkish', 'Indonesian', 'Vietnamese'];

export default function TranslatePage() {
  const [text, setText] = useState('');
  const [target, setTarget] = useState('Spanish');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const push = useToasts((s) => s.push);
  async function go() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const r: any = await api.post('/translate', { text, targetLanguage: target });
      setOut(r.text);
    } catch (e: any) {
      push({ title: 'Translate failed', description: e.message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <PageHeader eyebrow="Knowledge" title="Translate" description="Tone-preserving translation across 100+ languages." icon={<Languages className="h-6 w-6" />} />
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="panel p-5">
          <label className="label">Source</label>
          <textarea className="textarea min-h-[260px]" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="mt-3 flex items-center gap-2">
            <select className="select w-auto" value={target} onChange={(e) => setTarget(e.target.value)}>
              {LANGS.map((l) => <option key={l}>{l}</option>)}
            </select>
            <button onClick={go} disabled={loading || !text.trim()} className="btn-primary">{loading ? <Spinner /> : <Wand2 className="h-4 w-4" />} Translate</button>
          </div>
        </div>
        <div className="panel p-5">
          <label className="label">Translation ({target})</label>
          <textarea className="textarea min-h-[260px]" value={out} readOnly />
        </div>
      </div>
    </div>
  );
}
