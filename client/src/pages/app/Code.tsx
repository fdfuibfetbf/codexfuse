import { useState } from 'react';
import { Code2, Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useToasts } from '@/components/ui/Toast';

export default function CodePage() {
  const [task, setTask] = useState('');
  const [language, setLanguage] = useState('TypeScript');
  const [mode, setMode] = useState('generate');
  const [context, setContext] = useState('');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const push = useToasts((s) => s.push);
  async function go() {
    if (!task.trim()) return;
    setLoading(true);
    try {
      const r: any = await api.post('/code', { task, language, mode, context });
      setOut(r.text);
    } catch (e: any) {
      push({ title: 'Code failed', description: e.message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <PageHeader
        eyebrow="Create"
        title="Code generator"
        description="Generate, explain, refactor, debug or test code in any language."
        icon={<Code2 className="h-6 w-6" />}
      />
      <div className="grid lg:grid-cols-[400px_1fr] gap-5">
        <aside className="panel p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Language</label>
              <input className="input" value={language} onChange={(e) => setLanguage(e.target.value)} />
            </div>
            <div>
              <label className="label">Mode</label>
              <select className="select" value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="generate">Generate</option>
                <option value="explain">Explain</option>
                <option value="refactor">Refactor</option>
                <option value="debug">Debug</option>
                <option value="tests">Tests</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Task</label>
            <textarea className="textarea min-h-[140px]" value={task} onChange={(e) => setTask(e.target.value)} placeholder="Describe what you want…" />
          </div>
          <div>
            <label className="label">Context / existing code (optional)</label>
            <textarea className="textarea min-h-[140px] font-mono text-xs" value={context} onChange={(e) => setContext(e.target.value)} />
          </div>
          <button onClick={go} disabled={loading || !task.trim()} className="btn-primary w-full justify-center">
            {loading ? <Spinner /> : <Wand2 className="h-4 w-4" />} Run
          </button>
        </aside>
        <section className="panel p-6 prose-chat overflow-x-auto">
          {out ? <ReactMarkdown>{out}</ReactMarkdown> : <div className="text-ink-muted text-center py-12">Output will appear here.</div>}
        </section>
      </div>
    </div>
  );
}
