import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Workflow, Plus, Play, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';

interface WF { id: string; name: string; description?: string; nodes: any[]; edges: any[] }

const STARTER_NODES = [
  { id: 'prompt-1', type: 'prompt', data: { template: 'Write a {{tone}} tweet about {{topic}}' } },
  { id: 'chat-1', type: 'chat', data: { input: '{{prompt-1}}', system: 'You are a witty social copywriter.' } },
  { id: 'output-1', type: 'output', data: { from: 'chat-1' } }
];

export default function WorkflowsPage() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ['workflows'], queryFn: () => api.get<WF[]>('/workflows') });
  const [active, setActive] = useState<WF | null>(null);
  const [out, setOut] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [input, setInput] = useState<{ topic: string; tone: string }>({ topic: 'CodexFuse', tone: 'witty' });

  async function create() {
    const wf: any = await api.post('/workflows', {
      name: 'Tweet writer',
      description: 'Compose a brand tweet from {topic, tone}',
      nodes: STARTER_NODES,
      edges: []
    });
    qc.invalidateQueries({ queryKey: ['workflows'] });
    setActive(wf);
  }

  const del = useMutation({ mutationFn: (id: string) => api.delete(`/workflows/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['workflows'] }) });

  async function run() {
    if (!active) return;
    setRunning(true);
    try {
      const r: any = await api.post(`/workflows/${active.id}/run`, { input });
      setOut(r);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Build"
        title="Workflows"
        description="Chain prompts, models, and data into reusable AI automations."
        icon={<Workflow className="h-6 w-6" />}
        actions={<button className="btn-primary" onClick={create}><Plus className="h-4 w-4" /> New workflow</button>}
      />
      <div className="grid lg:grid-cols-[300px_1fr] gap-5">
        <aside className="panel p-3 space-y-1">
          {(list.data ?? []).map((w) => (
            <div key={w.id} className={`nav-item ${active?.id === w.id ? 'active' : ''}`}>
              <button onClick={() => setActive(w)} className="flex-1 text-left truncate">{w.name}</button>
              <button onClick={() => del.mutate(w.id)} className="text-ink-muted hover:text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          {(list.data ?? []).length === 0 && <div className="p-3 text-sm text-ink-muted">No workflows yet — click "New workflow" for a starter.</div>}
        </aside>
        <section className="panel p-5">
          {active ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-white text-lg">{active.name}</div>
                  <div className="text-sm text-ink-dim">{active.description}</div>
                </div>
                <button onClick={run} disabled={running} className="btn-primary">{running ? <Spinner /> : <Play className="h-4 w-4" />} Run</button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <input className="input" placeholder="topic" value={input.topic} onChange={(e) => setInput({ ...input, topic: e.target.value })} />
                <input className="input" placeholder="tone" value={input.tone} onChange={(e) => setInput({ ...input, tone: e.target.value })} />
              </div>
              <div className="mt-5 grid lg:grid-cols-2 gap-3">
                {active.nodes.map((n) => (
                  <div key={n.id} className="panel p-4">
                    <div className="text-xs uppercase tracking-widest text-ink-muted">{n.type}</div>
                    <div className="text-sm mt-1 font-mono text-ink-dim whitespace-pre-wrap">
                      {JSON.stringify(n.data, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
              {out && (
                <div className="mt-5 panel p-4">
                  <div className="text-xs uppercase tracking-widest text-ink-muted mb-2">Output</div>
                  <pre className="whitespace-pre-wrap text-sm">{typeof out.output === 'string' ? out.output : JSON.stringify(out.output, null, 2)}</pre>
                </div>
              )}
            </>
          ) : (
            <div className="text-ink-muted text-center py-12">Pick a workflow on the left.</div>
          )}
        </section>
      </div>
    </div>
  );
}
