import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Spinner } from '@/components/ui/Spinner';
import { useToasts } from '@/components/ui/Toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const nav = useNavigate();
  const push = useToasts((s) => s.push);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res: any = await api.post('/auth/register', { email, password, name });
      setAuth(res);
      push({ title: 'Workspace created', description: 'Welcome to CodexFuse 🎉', variant: 'success' });
      nav('/app', { replace: true });
    } catch (err: any) {
      push({ title: 'Could not create account', description: err.message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Free forever plan. No credit card required."
      footer={
        <>
          Have an account? <Link to="/login" className="text-brand-300 hover:text-brand-200">Sign in</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Ada Lovelace" />
        </div>
        <div>
          <label className="label">Work email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@company.com" />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="At least 8 characters" />
        </div>
        <button disabled={loading} className="btn-primary w-full justify-center">
          {loading ? <Spinner /> : null} Create workspace
        </button>
        <div className="text-[11px] text-ink-muted text-center">
          By continuing you agree to the CodexFuse Terms & Privacy.
        </div>
      </form>
    </AuthShell>
  );
}
