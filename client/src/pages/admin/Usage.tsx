import { useQuery } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { formatDateTime, formatNumber } from '@/lib/utils';

export default function AdminUsagePage() {
  const usage = useQuery({ queryKey: ['admin-usage'], queryFn: () => api.get<any>('/admin/usage') });
  const recent = useQuery({ queryKey: ['admin-recent'], queryFn: () => api.get<any>('/admin/recent') });
  return (
    <div>
      <PageHeader eyebrow="Admin" title="Usage analytics" description="What's running across your platform." icon={<BarChart3 className="h-6 w-6" />} />
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="panel p-5">
          <div className="font-semibold mb-3">By tool</div>
          <div className="space-y-2">
            {(usage.data?.byKind ?? []).map((u: any) => (
              <div key={u.kind} className="flex items-center gap-3">
                <div className="text-sm w-28 capitalize">{u.kind.toLowerCase()}</div>
                <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-accent-cyan" style={{ width: `${Math.min(100, u._count?._all)}%` }} />
                </div>
                <div className="text-xs text-ink-muted w-20 text-right">{formatNumber(u._sum?.creditsUsed ?? 0)} cr</div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-5">
          <div className="font-semibold mb-3">By provider</div>
          <div className="space-y-2">
            {(usage.data?.byProvider ?? []).map((u: any) => (
              <div key={u.provider} className="flex items-center gap-3">
                <div className="text-sm w-28">{u.provider}</div>
                <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent-fuchsia to-accent-cyan" style={{ width: `${Math.min(100, u._count?._all)}%` }} />
                </div>
                <div className="text-xs text-ink-muted w-20 text-right">{u._count?._all} runs</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="panel mt-5 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] font-semibold">Recent generations</div>
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-widest text-ink-muted">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Tool</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3 text-right">Credits</th>
            </tr>
          </thead>
          <tbody>
            {(recent.data?.generations ?? []).map((g: any) => (
              <tr key={g.id} className="border-t border-white/[0.04]">
                <td className="px-4 py-2.5 whitespace-nowrap">{formatDateTime(g.createdAt)}</td>
                <td className="px-4 py-2.5 text-ink-dim">{g.user?.email}</td>
                <td className="px-4 py-2.5">{g.kind}</td>
                <td className="px-4 py-2.5">{g.provider}</td>
                <td className="px-4 py-2.5 text-right">{g.creditsUsed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
