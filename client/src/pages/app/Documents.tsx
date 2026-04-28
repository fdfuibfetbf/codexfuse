import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Upload, Send, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useToasts } from '@/components/ui/Toast';

interface Doc { id: string; name: string; sizeBytes?: number | null; status: string; createdAt: string }

export default function DocumentsPage() {
  const qc = useQueryClient();
  const push = useToasts((s) => s.push);
  const docs = useQuery({ queryKey: ['docs'], queryFn: () => api.get<Doc[]>('/documents') });
  const [selected, setSelected] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [out, setOut] = useState<{ answer: string; sources: any[] } | null>(null);
  const [thinking, setThinking] = useState(false);

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return api.upload('/documents/upload', fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['docs'] })
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/documents/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['docs'] })
  });

  async function ask() {
    if (!q.trim()) return;
    setThinking(true);
    try {
      const r: any = await api.post('/documents/ask', { question: q, documentIds: selected.length ? selected : undefined });
      setOut(r);
    } catch (e: any) {
      push({ title: 'Q&A failed', description: e.message, variant: 'error' });
    } finally {
      setThinking(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Knowledge"
        title="Documents · RAG"
        description="Upload PDFs / docs and ask grounded, source-cited questions."
        icon={<FileText className="h-6 w-6" />}
        actions={
          <label className="btn-primary cursor-pointer">
            <Upload className="h-4 w-4" /> Upload
            <input
              type="file"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload.mutate(f);
              }}
            />
          </label>
        }
      />
      <div className="grid lg:grid-cols-[360px_1fr] gap-5">
        <aside className="panel p-3 space-y-1">
          <div className="px-2 py-1.5 text-xs uppercase tracking-widest text-ink-muted">Documents</div>
          {(docs.data ?? []).length === 0 && <div className="p-3 text-sm text-ink-muted">No documents yet.</div>}
          {(docs.data ?? []).map((d) => (
            <div key={d.id} className={`nav-item items-start ${selected.includes(d.id) ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={selected.includes(d.id)}
                onChange={() => setSelected((s) => (s.includes(d.id) ? s.filter((x) => x !== d.id) : [...s, d.id]))}
              />
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm">{d.name}</div>
                <div className="text-[11px] text-ink-muted">{d.status}</div>
              </div>
              <button className="text-ink-muted hover:text-rose-400" onClick={() => del.mutate(d.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </aside>
        <section className="panel p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask();
            }}
            className="flex gap-2"
          >
            <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask anything across your documents…" />
            <button className="btn-primary" disabled={thinking || !q.trim()}>{thinking ? <Spinner /> : <Send className="h-4 w-4" />}</button>
          </form>
          <div className="mt-5 prose-chat min-h-[260px]">
            {out ? (
              <>
                <ReactMarkdown>{out.answer}</ReactMarkdown>
                <div className="mt-4 text-xs text-ink-muted">
                  Sources:
                  <ul className="mt-1 space-y-1">
                    {out.sources.map((s: any) => (
                      <li key={s.index}>[{s.index}] {s.documentName} <span className="text-ink-muted">· score {s.score}</span></li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-ink-muted text-center py-12">Upload documents and ask a question to get started.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
