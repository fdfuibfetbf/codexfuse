import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';

export default function AdminTemplatesPage() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ['admin-templates'], queryFn: () => api.get<any[]>('/admin/templates') });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ slug: '', name: '', category: 'Content', icon: '✨', promptTemplate: '', fields: [] });
  const create = useMutation({
    mutationFn: () => api.post('/admin/templates', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-templates'] });
      setOpen(false);
    }
  });
  const del = useMutation({ mutationFn: (id: string) => api.delete(`/admin/templates/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-templates'] }) });
  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Prompt templates"
        description="Curate the templates available to your users."
        icon={<Sparkles className="h-6 w-6" />}
        actions={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New template</button>}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(list.data ?? []).map((t) => (
          <div key={t.id} className="panel p-5">
            <div className="flex items-start justify-between">
              <div className="text-2xl">{t.icon ?? '✨'}</div>
              <button onClick={() => del.mutate(t.id)} className="text-ink-muted hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="mt-3 font-semibold text-white">{t.name}</div>
            <div className="mt-1 chip">{t.category}</div>
            <div className="mt-2 text-xs text-ink-muted truncate">/{t.slug}</div>
          </div>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div className="panel-glow p-6 w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="font-display text-xl mb-4">Create template</div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input className="input" placeholder="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                <input className="input" placeholder="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="input" placeholder="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                <input className="input" placeholder="icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              </div>
              <textarea className="textarea" placeholder="Prompt template (use {{var}} for fields)" value={form.promptTemplate} onChange={(e) => setForm({ ...form, promptTemplate: e.target.value })} />
              <textarea className="textarea font-mono text-xs" placeholder='Fields JSON, e.g. [{"name":"topic","label":"Topic","type":"text"}]' onChange={(e) => {
                try {
                  setForm({ ...form, fields: JSON.parse(e.target.value) });
                } catch {
                  /* ignore until JSON is valid */
                }
              }} />
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => create.mutate()}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
