import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, ArrowLeft, Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useToasts } from '@/components/ui/Toast';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  options?: string[];
  placeholder?: string;
  required?: boolean;
  default?: any;
}

export default function TemplateRunnerPage() {
  const { slug = '' } = useParams();
  const tpl = useQuery({
    queryKey: ['template', slug],
    queryFn: () => api.get<any>(`/templates/${slug}`)
  });
  const [values, setValues] = useState<Record<string, any>>({});
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const push = useToasts((s) => s.push);

  async function run() {
    setLoading(true);
    try {
      const r: any = await api.post(`/templates/${slug}/run`, { values });
      setOut(r.text);
    } catch (e: any) {
      push({ title: 'Run failed', description: e.message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link to="/app/templates" className="inline-flex items-center gap-1 text-sm text-ink-dim hover:text-white mb-3">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to templates
      </Link>
      <PageHeader
        eyebrow={tpl.data?.category ?? 'Template'}
        title={tpl.data?.name ?? 'Loading…'}
        description={tpl.data?.description ?? ''}
        icon={<Sparkles className="h-6 w-6" />}
      />
      <div className="grid lg:grid-cols-[400px_1fr] gap-5">
        <aside className="panel p-5 space-y-4">
          {(tpl.data?.fields ?? []).map((f: Field) => (
            <div key={f.name}>
              <label className="label">{f.label}{f.required && <span className="text-rose-400 ml-1">*</span>}</label>
              {f.type === 'textarea' ? (
                <textarea className="textarea" value={values[f.name] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))} placeholder={f.placeholder} />
              ) : f.type === 'select' ? (
                <select className="select" value={values[f.name] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}>
                  <option value="">Select…</option>
                  {(f.options ?? []).map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={f.type === 'number' ? 'number' : 'text'}
                  className="input"
                  value={values[f.name] ?? f.default ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                  placeholder={f.placeholder}
                />
              )}
            </div>
          ))}
          <button onClick={run} disabled={loading} className="btn-primary w-full justify-center">{loading ? <Spinner /> : <Wand2 className="h-4 w-4" />} Generate</button>
        </aside>
        <section className="panel p-6 prose-chat">
          {out ? <ReactMarkdown>{out}</ReactMarkdown> : <div className="text-ink-muted text-center py-12">Fill in the fields and hit Generate.</div>}
        </section>
      </div>
    </div>
  );
}
