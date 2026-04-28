import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { useState, useMemo } from 'react';

interface Tpl {
  id: string;
  slug: string;
  name: string;
  category: string;
  description?: string | null;
  icon?: string | null;
  isFeatured?: boolean;
}

export default function TemplatesPage() {
  const tpls = useQuery({ queryKey: ['templates'], queryFn: () => api.get<Tpl[]>('/templates') });
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');

  const cats = useMemo(() => {
    const set = new Set<string>(['all']);
    (tpls.data ?? []).forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [tpls.data]);

  const filtered = (tpls.data ?? []).filter((t) => {
    if (cat !== 'all' && t.category !== cat) return false;
    if (q && !`${t.name} ${t.description ?? ''} ${t.category}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        eyebrow="Create"
        title="Templates"
        description="Start with a proven prompt — for blogs, ads, emails, scripts and more."
        icon={<Sparkles className="h-6 w-6" />}
        actions={<input className="input w-64" placeholder="Search templates…" value={q} onChange={(e) => setQ(e.target.value)} />}
      />
      <div className="flex flex-wrap gap-2 mb-5">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`chip ${cat === c ? 'border-brand-400/50 text-brand-200 bg-brand-500/10' : ''}`}
          >
            {c}
          </button>
        ))}
      </div>
      {tpls.isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((t) => (
            <Link key={t.id} to={`/app/templates/${t.slug}`} className="panel p-5 hover:border-brand-400/40 hover:-translate-y-0.5 transition group">
              <div className="flex items-start justify-between">
                <div className="text-2xl">{t.icon ?? '✨'}</div>
                <span className="chip">{t.category}</span>
              </div>
              <div className="mt-3 font-semibold text-white">{t.name}</div>
              {t.description && <div className="mt-1 text-sm text-ink-dim line-clamp-2">{t.description}</div>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
