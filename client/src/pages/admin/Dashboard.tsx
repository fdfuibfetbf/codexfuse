import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Users, Activity, Sparkles, CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminDashboardPage() {
  const stats = useQuery({ queryKey: ['admin-stats'], queryFn: () => api.get<any>('/admin/stats') });
  const usage = useQuery({ queryKey: ['admin-usage'], queryFn: () => api.get<any>('/admin/usage') });
  const recent = useQuery({ queryKey: ['admin-recent'], queryFn: () => api.get<any>('/admin/recent') });
  return (
    <div>
      <PageHeader eyebrow="Admin" title="Overview" description="Operational stats across your CodexFuse workspace." icon={<LayoutDashboard className="h-6 w-6" />} />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Stat label="Users" value={formatNumber(stats.data?.users ?? 0)} icon={<Users className="h-4 w-4" />} />
        <Stat label="Active (7d)" value={formatNumber(stats.data?.activeUsers7d ?? 0)} icon={<Activity className="h-4 w-4" />} />
        <Stat label="Generations" value={formatNumber(stats.data?.generations ?? 0)} icon={<Sparkles className="h-4 w-4" />} />
        <Stat label="Credits used" value={formatNumber(stats.data?.creditsUsed ?? 0)} icon={<Sparkles className="h-4 w-4" />} />
        <Stat label="Plans" value={formatNumber(stats.data?.plans ?? 0)} icon={<CreditCard className="h-4 w-4" />} />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="panel p-5">
          <div className="font-semibold text-white mb-3">Usage by tool (30d)</div>
          {usage.isLoading ? <Skeleton className="h-32" /> : (
            <div className="space-y-2">
              {(usage.data?.byKind ?? []).map((u: any) => (
                <div key={u.kind} className="flex items-center gap-3">
                  <div className="text-sm w-32 capitalize">{u.kind.toLowerCase()}</div>
                  <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-500 to-accent-cyan rounded-full" style={{ width: `${Math.min(100, u._count?._all)}%` }} />
                  </div>
                  <div className="text-xs text-ink-muted w-16 text-right">{u._count?._all} runs</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="panel p-5">
          <div className="font-semibold text-white mb-3">Recent signups</div>
          <div className="space-y-2">
            {(recent.data?.users ?? []).map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 panel p-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center text-xs font-semibold">
                  {(u.name ?? u.email).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{u.name ?? u.email}</div>
                  <div className="text-[11px] text-ink-muted truncate">{u.email}</div>
                </div>
                <span className="chip">{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 text-xs text-ink-muted mb-2">
        <div className="h-7 w-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-brand-300">{icon}</div>
        {label}
      </div>
      <div className="font-display text-2xl">{value}</div>
    </div>
  );
}
