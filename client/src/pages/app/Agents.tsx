import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Wand2, Play, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';

interface A { id: string; name: string; goal: string; description?: string }

export default function AgentsPage() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ['agents'], queryFn: () => api.get<A[]>('/agents') });
  const [active, setActive] = useState<A | null>(null);
  const [input, setInput] = useState('');
  const [out, setOut] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ name: '', description: '', goal: '' });
  async function run() {
    if (!active || !input.trim()) return;
    setRunning(true);
    try {
      const r: any = await api.post(`/agents/${active.id}/run`, { input });
      setOut(r);
    } finally {
      setRunning(false);
    }
  }
  async function save() {
    await api.post('/agents', form);
    setOpen(false);
    setForm({ name: '', description: '', goal: '' });
    qc.invalidateQueries({ queryKey: ['agents'] });
  }
  return (
    <div>
      <PageHeader
        eyebrow="Build"
        title="AI agents"
        description="Plan-and-execute agents that complete real goals."
        icon={<Wand2 className="h-6 w-6" />}
        actions={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New agent</button>}
      />
      <div className="grid lg:grid-cols-[300px_1fr] gap-5">
        <aside className="panel p-3 space-y-1">
          {(list.data ?? []).map((a) => (
            <button
              key={a.id}
              onClick={() => setActive(a)}
              className={`nav-item w-full text-left ${active?.id === a.id ? 'active' : ''}`}
            >
              <Wand2 className="h-4 w-4" />
              <span className="flex-1 truncate">{a.name}</span>
            </button>
          ))}
          {(list.data ?? []).length === 0 && <div className="p-3 text-sm text-ink-muted">No agents yet.</div>}
        </aside>
        <section className="panel p-5">
          {active ? (
            <>
              <div className="font-semibold text-white text-lg">{active.name}</div>
              <div className="text-sm text-ink-dim mt-1">{active.goal}</div>
              <div className="mt-4 flex gap-2">
                <input className="input" placeholder="Input for this run…" value={input} onChange={(e) => setInput(e.target.value)} />
                <button className="btn-primary" onClick={run} disabled={running || !input.trim()}>{running ? <Spinner /> : <Play className="h-4 w-4" />} Run</button>
              </div>
              {out && (
                <div className="mt-5 space-y-3">
                  <div className="panel p-4">
                    <div className="text-xs uppercase tracking-widest text-ink-muted mb-2">Plan</div>
                    <ul className="text-sm text-ink-dim list-decimal pl-5 space-y-1">{(out.steps ?? []).map((s: string, i: number) => <li key={i}>{s.replace(/^\d+\.\s*/, '')}</li>)}</ul>
                  </div>
                  <div className="panel p-4">
                    <div className="text-xs uppercase tracking-widest text-ink-muted mb-2">Output</div>
                    <pre className="whitespace-pre-wrap text-sm text-ink">{out.output}</pre>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-ink-muted py-12">Select an agent to run, or create a new one.</div>
          )}
        </section>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
          <div className="panel-glow p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="font-display text-xl mb-4">Create an agent</div>
            <div className="space-y-3">
              <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <textarea className="textarea" placeholder="Goal — what is the agent's job?" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn-primary" disabled={!form.name || !form.goal} onClick={save}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
