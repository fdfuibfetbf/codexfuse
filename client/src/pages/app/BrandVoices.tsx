import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';

interface BV { id: string; name: string; tone?: string; styleGuide?: string; sample?: string }

export default function BrandVoicesPage() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ['brand-voices'], queryFn: () => api.get<BV[]>('/brand-voices') });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ name: '', tone: '', styleGuide: '', sample: '' });
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    await api.post('/brand-voices', form);
    setSaving(false);
    setOpen(false);
    setForm({ name: '', tone: '', styleGuide: '', sample: '' });
    qc.invalidateQueries({ queryKey: ['brand-voices'] });
  }
  async function analyze() {
    if (!form.sample || form.sample.length < 50) return;
    const r: any = await api.post('/brand-voices/analyze', { sample: form.sample });
    setForm({ ...form, tone: r.tone ?? '', styleGuide: r.styleGuide ?? '' });
  }
  const del = useMutation({ mutationFn: (id: string) => api.delete(`/brand-voices/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['brand-voices'] }) });
  return (
    <div>
      <PageHeader
        eyebrow="Build"
        title="Brand voices"
        description="Encode your tone and style. Apply to chats, templates, and content gen."
        icon={<Megaphone className="h-6 w-6" />}
        actions={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New voice</button>}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(list.data ?? []).map((b) => (
          <div key={b.id} className="panel p-5">
            <div className="flex items-start justify-between">
              <div className="font-semibold text-white">{b.name}</div>
              <button onClick={() => del.mutate(b.id)} className="text-ink-muted hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
            </div>
            {b.tone && <div className="mt-2 chip">{b.tone}</div>}
            {b.styleGuide && <div className="mt-3 text-xs text-ink-dim line-clamp-4 whitespace-pre-wrap">{b.styleGuide}</div>}
          </div>
        ))}
        {(list.data ?? []).length === 0 && <div className="panel p-12 text-center text-ink-muted col-span-full">No brand voices yet.</div>}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
          <div className="panel-glow p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="font-display text-xl mb-4">Create a brand voice</div>
            <div className="space-y-3">
              <input className="input" placeholder="Name (e.g. CodexFuse Witty)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="input" placeholder="Tone (e.g. confident, witty)" value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} />
              <textarea className="textarea" placeholder="Style guide — bullet rules" value={form.styleGuide} onChange={(e) => setForm({ ...form, styleGuide: e.target.value })} />
              <textarea className="textarea" placeholder="Paste a sample to auto-analyze…" value={form.sample} onChange={(e) => setForm({ ...form, sample: e.target.value })} />
              <button className="btn-secondary" onClick={analyze}>Analyze sample</button>
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn-primary" disabled={saving || !form.name} onClick={save}>{saving ? <Spinner /> : null} Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
