import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Settings as SettingsIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useToasts } from '@/components/ui/Toast';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const push = useToasts((s) => s.push);
  const [name, setName] = useState(user?.name ?? '');
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });

  const saveProfile = useMutation({
    mutationFn: () => api.patch('/auth/me', { name }),
    onSuccess: (u: any) => {
      setUser({ ...(user as any), ...u });
      push({ title: 'Profile updated', variant: 'success' });
    }
  });

  const changePw = useMutation({
    mutationFn: () => api.post('/auth/change-password', pw),
    onSuccess: () => {
      push({ title: 'Password updated', variant: 'success' });
      setPw({ currentPassword: '', newPassword: '' });
    },
    onError: (e: any) => push({ title: 'Update failed', description: e.message, variant: 'error' })
  });

  return (
    <div>
      <PageHeader eyebrow="Account" title="Settings" description="Profile, security and preferences." icon={<SettingsIcon className="h-6 w-6" />} />
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="panel p-5">
          <div className="font-semibold text-white mb-4">Profile</div>
          <label className="label">Email</label>
          <input className="input" value={user?.email ?? ''} disabled />
          <label className="label mt-3">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={() => saveProfile.mutate()} className="btn-primary mt-4">{saveProfile.isPending && <Spinner />} Save</button>
        </div>
        <div className="panel p-5">
          <div className="font-semibold text-white mb-4">Change password</div>
          <label className="label">Current password</label>
          <input type="password" className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          <label className="label mt-3">New password</label>
          <input type="password" className="input" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          <button onClick={() => changePw.mutate()} disabled={!pw.currentPassword || pw.newPassword.length < 8} className="btn-primary mt-4">{changePw.isPending && <Spinner />} Update</button>
        </div>
      </div>
    </div>
  );
}
