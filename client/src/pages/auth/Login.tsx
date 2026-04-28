import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Spinner } from '@/components/ui/Spinner';
import { useToasts } from '@/components/ui/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const nav = useNavigate();
  const loc = useLocation() as any;
  const push = useToasts((s) => s.push);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res: any = await api.post('/auth/login', { email, password });
      setAuth(res);
      push({ title: 'Welcome back', variant: 'success' });
      nav(loc.state?.from ?? '/app', { replace: true });
    } catch (err: any) {
      push({ title: 'Login failed', description: err.message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your CodexFuse workspace."
      footer={
        <>
          New here? <Link to="/register" className="text-brand-300 hover:text-brand-200">Create an account</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            autoFocus
            placeholder="you@company.com"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label">Password</label>
            <Link to="/forgot" className="text-xs text-ink-dim hover:text-white">Forgot?</Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
          />
        </div>
        <button disabled={loading} className="btn-primary w-full justify-center">
          {loading ? <Spinner /> : null} Sign in
        </button>
      </form>
    </AuthShell>
  );
}
