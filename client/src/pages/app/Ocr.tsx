import { useState } from 'react';
import { ScanText, Upload, Wand2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useToasts } from '@/components/ui/Toast';

export default function OcrPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const push = useToasts((s) => s.push);
  async function go() {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const r: any = await api.upload('/ocr', fd);
      setText(r.text);
    } catch (e: any) {
      push({ title: 'OCR failed', description: e.message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <PageHeader eyebrow="Knowledge" title="OCR" description="Extract text from images, screenshots and receipts." icon={<ScanText className="h-6 w-6" />} />
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="panel p-5 space-y-4">
          <label className="label">Image</label>
          <label className="flex items-center justify-center h-56 rounded-xl border border-dashed border-white/[0.12] cursor-pointer hover:border-brand-400/40">
            {preview ? <img src={preview} className="max-h-full rounded-lg" /> : <div className="text-ink-muted text-sm flex items-center gap-2"><Upload className="h-4 w-4" /> Choose image</div>}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                setPreview(f ? URL.createObjectURL(f) : null);
              }}
            />
          </label>
          <button onClick={go} disabled={loading || !file} className="btn-primary w-full justify-center">{loading ? <Spinner /> : <Wand2 className="h-4 w-4" />} Extract text</button>
        </div>
        <div className="panel p-5">
          <label className="label">Extracted text</label>
          <textarea className="textarea min-h-[260px]" value={text} readOnly placeholder="Output will appear here…" />
        </div>
      </div>
    </div>
  );
}
