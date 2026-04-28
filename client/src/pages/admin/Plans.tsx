import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { useState } from 'react';

export default function AdminPlansPage() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ['admin-plans'], queryFn: () => api.get<any[]>('/admin/plans') });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.patch(`/admin/plans/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-plans'] })
  });
  const [editing, setEditing] = useState<Record<string, any>>({});
  return (
    <div>
      <PageHeader eyebrow="Admin" title="Plans" description="Adjust pricing, credit allowances and feature flags." icon={<CreditCard className="h-6 w-6" />} />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {(list.data ?? []).map((p) => {
          const local = editing[p.id] ?? p;
          return (
            <div key={p.id} className="panel p-5">
              <div className="font-semibold text-white text-lg">{p.name}</div>
              <div className="text-xs text-ink-muted">{p.description}</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <div className="label">Price (¢)</div>
                  <input type="number" className="input" value={local.priceCents} onChange={(e) => setEditing((s) => ({ ...s, [p.id]: { ...local, priceCents: Number(e.target.value) } }))} />
                </div>
                <div>
                  <div className="label">Credits / mo</div>
                  <input type="number" className="input" value={local.monthlyCredits} onChange={(e) => setEditing((s) => ({ ...s, [p.id]: { ...local, monthlyCredits: Number(e.target.value) } }))} />
                </div>
              </div>
              <button
                onClick={() => update.mutate({ id: p.id, body: { priceCents: local.priceCents, monthlyCredits: local.monthlyCredits } })}
                className="btn-primary mt-4 w-full justify-center"
              >
                Save
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
