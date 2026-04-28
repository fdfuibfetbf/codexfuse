import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, UserPlus, Copy } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { useToasts } from '@/components/ui/Toast';

export default function WorkspacesPage() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ['workspaces'], queryFn: () => api.get<any[]>('/workspaces') });
  const [name, setName] = useState('');
  const [active, setActive] = useState<any>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const push = useToasts((s) => s.push);

  const create = useMutation({
    mutationFn: () => api.post('/workspaces', { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspaces'] });
      setName('');
    }
  });

  const detail = useQuery({
    queryKey: ['workspace', active?.id],
    queryFn: () => api.get<any>(`/workspaces/${active.id}`),
    enabled: !!active
  });

  const invite = useMutation({
    mutationFn: () => api.post(`/workspaces/${active.id}/invite`, { email: inviteEmail }),
    onSuccess: (r: any) => {
      setInviteToken(r.token);
      setInviteEmail('');
    }
  });

  return (
    <div>
      <PageHeader eyebrow="Team" title="Workspaces" description="Invite teammates, set roles and share assets." icon={<Building2 className="h-6 w-6" />} />
      <div className="grid lg:grid-cols-[360px_1fr] gap-5">
        <aside className="panel p-3">
          <div className="flex gap-2 mb-3 px-1">
            <input className="input" placeholder="New workspace name" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="btn-primary" disabled={!name || create.isPending} onClick={() => create.mutate()}>{create.isPending ? <Spinner /> : <Plus className="h-4 w-4" />}</button>
          </div>
          <div className="space-y-1">
            {(list.data ?? []).map((w) => (
              <button key={w.id} onClick={() => setActive(w)} className={`nav-item w-full text-left ${active?.id === w.id ? 'active' : ''}`}>
                <Building2 className="h-4 w-4" />
                <div className="flex-1 truncate">
                  <div className="text-sm">{w.name}</div>
                  <div className="text-[10px] text-ink-muted">{w.role}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>
        <section className="panel p-5">
          {active && detail.data ? (
            <>
              <div className="font-display text-xl text-white">{detail.data.name}</div>
              <div className="text-sm text-ink-dim">/{detail.data.slug}</div>
              <div className="mt-5 flex gap-2">
                <input className="input" placeholder="Invite by email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                <button className="btn-primary" disabled={!inviteEmail || invite.isPending} onClick={() => invite.mutate()}>
                  {invite.isPending ? <Spinner /> : <UserPlus className="h-4 w-4" />} Invite
                </button>
              </div>
              {inviteToken && (
                <div className="mt-3 panel p-3 flex items-center gap-2">
                  <code className="text-xs text-ink-dim flex-1 truncate">/api/workspaces/accept/{inviteToken}</code>
                  <button onClick={() => navigator.clipboard.writeText(inviteToken)} className="btn-ghost"><Copy className="h-4 w-4" /></button>
                </div>
              )}
              <div className="mt-6">
                <div className="text-sm uppercase tracking-widest text-ink-muted mb-2">Members</div>
                <div className="space-y-2">
                  {(detail.data.memberships ?? []).map((m: any) => (
                    <div key={m.id} className="panel p-3 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center text-xs font-semibold">
                        {(m.user.name ?? m.user.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">{m.user.name ?? m.user.email}</div>
                        <div className="text-[11px] text-ink-muted">{m.user.email}</div>
                      </div>
                      <span className="chip">{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-ink-muted py-16">Select a workspace.</div>
          )}
        </section>
      </div>
    </div>
  );
}
