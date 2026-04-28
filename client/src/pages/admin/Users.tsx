import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToasts } from '@/components/ui/Toast';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const push = useToasts((s) => s.push);
  const [q, setQ] = useState('');
  const list = useQuery({ queryKey: ['admin-users', q], queryFn: () => api.get<any[]>(`/admin/users?q=${encodeURIComponent(q)}`) });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.patch(`/admin/users/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      push({ title: 'Updated', variant: 'success' });
    }
  });
  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Users"
        description="Manage roles, status and credit allowances."
        icon={<Users className="h-6 w-6" />}
        actions={<input className="input w-64" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />}
      />
      {list.isLoading ? <Skeleton className="h-64" /> : (
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] border-b border-white/[0.06] text-left text-xs uppercase tracking-widest text-ink-muted">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Credits</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(list.data ?? []).map((u) => (
                <tr key={u.id} className="border-t border-white/[0.04]">
                  <td className="px-4 py-3">
                    <div className="text-sm">{u.name ?? '—'}</div>
                    <div className="text-[11px] text-ink-muted">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select className="select" value={u.role} onChange={(e) => update.mutate({ id: u.id, body: { role: e.target.value } })}>
                      <option>USER</option>
                      <option>ADMIN</option>
                      <option>SUPERADMIN</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      className="input w-28"
                      defaultValue={u.credits}
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (v !== u.credits) update.mutate({ id: u.id, body: { credits: v } });
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`chip ${u.isActive ? 'border-emerald-400/30 text-emerald-300' : 'border-rose-400/30 text-rose-300'}`}>
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-ghost !py-1" onClick={() => update.mutate({ id: u.id, body: { isActive: !u.isActive } })}>
                      {u.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
