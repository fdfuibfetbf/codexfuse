import { FormEvent, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { useToasts } from '@/components/ui/Toast';

export default function ResetPage() {
  const [params] = useSearchParams();
  const [token, setToken] = useState(params.get('token') ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const push = useToasts((s) => s.push);
  const nav = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      push({ title: 'Password updated', variant: 'success' });
      nav('/login');
    } catch (err: any) {
      push({ title: 'Reset failed', description: err.message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthShell title="Set a new password" footer={<Link to="/login" className="text-brand-300">Back to sign in</Link>}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Reset token</label>
          <input value={token} onChange={(e) => setToken(e.target.value)} className="input" required />
        </div>
        <div>
          <label className="label">New password</label>
          <input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input" required />
        </div>
        <button disabled={loading} className="btn-primary w-full justify-center">{loading ? <Spinner /> : null} Update password</button>
      </form>
    </AuthShell>
  );
}
