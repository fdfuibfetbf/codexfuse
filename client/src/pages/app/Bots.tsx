import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bot, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { useToasts } from '@/components/ui/Toast';

interface Bot { id: string; name: string; description?: string | null; systemPrompt: string; model?: string | null; isPublic: boolean }

export default function BotsPage() {
  const qc = useQueryClient();
  const push = useToasts((s) => s.push);
  const list = useQuery({ queryKey: ['bots'], queryFn: () => api.get<Bot[]>('/bots') });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', systemPrompt: '', model: '' });
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    try {
      await api.post('/bots', form);
      setOpen(false);
      setForm({ name: '', description: '', systemPrompt: '', model: '' });
      qc.invalidateQueries({ queryKey: ['bots'] });
    } catch (e: any) {
      push({ title: 'Save failed', description: e.message, variant: 'error' });
    } finally {
      setSaving(false);
    }
  }
  const del = useMutation({ mutationFn: (id: string) => api.delete(`/bots/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['bots'] }) });
  return (
    <div>
      <PageHeader
        eyebrow="Build"
        title="Custom bots"
        description="Build private GPT-style bots with your prompts, persona and tools."
        icon={<Bot className="h-6 w-6" />}
        actions={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New bot</button>}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(list.data ?? []).map((b) => (
          <div key={b.id} className="panel p-5 hover:border-brand-400/40">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-white">{b.name}</div>
                {b.description && <div className="text-sm text-ink-dim line-clamp-2 mt-1">{b.description}</div>}
              </div>
              <button onClick={() => del.mutate(b.id)} className="text-ink-muted hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 chip">{b.model ?? 'auto-model'}</div>
          </div>
        ))}
        {(list.data ?? []).length === 0 && (
          <div className="panel p-12 text-center text-ink-muted col-span-full">No bots yet — create your first one.</div>
        )}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
          <div className="panel-glow p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="font-display text-xl mb-4">Create a bot</div>
            <div className="space-y-3">
              <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="input" placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <textarea className="textarea" placeholder="System prompt — give your bot personality, expertise & rules" value={form.systemPrompt} onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })} />
              <input className="input" placeholder="Model (optional, e.g. gpt-4o)" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn-primary" disabled={saving || !form.name || !form.systemPrompt} onClick={save}>{saving ? <Spinner /> : null} Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
