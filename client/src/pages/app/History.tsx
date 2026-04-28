import { useQuery } from '@tanstack/react-query';
import { History as HistoryIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

export default function HistoryPage() {
  const q = useQuery({ queryKey: ['usage-summary'], queryFn: () => api.get<any>('/usage/summary') });
  return (
    <div>
      <PageHeader eyebrow="Workspace" title="History" description="Every generation you've run, across every tool." icon={<HistoryIcon className="h-6 w-6" />} />
      {q.isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] border-b border-white/[0.06] text-left text-xs uppercase tracking-widest text-ink-muted">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Tool</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3 text-right">Credits</th>
              </tr>
            </thead>
            <tbody>
              {(q.data?.recent ?? []).map((r: any) => (
                <tr key={r.id} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(r.createdAt)}</td>
                  <td className="px-4 py-3">{r.kind}</td>
                  <td className="px-4 py-3">{r.provider}</td>
                  <td className="px-4 py-3 text-ink-dim">{r.model ?? '—'}</td>
                  <td className="px-4 py-3 text-right">{r.creditsUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(q.data?.recent ?? []).length === 0 && (
            <div className="py-16 text-center text-ink-muted">No history yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
