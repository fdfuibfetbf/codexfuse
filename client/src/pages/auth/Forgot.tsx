import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthShell from './AuthShell';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { useToasts } from '@/components/ui/Toast';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const push = useToasts((s) => s.push);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res: any = await api.post('/auth/forgot-password', { email });
      if (res.resetToken) setResetToken(res.resetToken);
      push({ title: 'If your email exists, a reset link has been sent.', variant: 'success' });
    } catch (err: any) {
      push({ title: 'Error', description: err.message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a reset link." footer={<><Link to="/login" className="text-brand-300 hover:text-brand-200">Back to sign in</Link></>}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        </div>
        <button disabled={loading} className="btn-primary w-full justify-center">{loading ? <Spinner /> : null} Send reset link</button>
        {resetToken && (
          <div className="panel p-3 text-xs text-ink-dim">
            Dev-mode reset token: <code className="text-brand-300">{resetToken}</code>
            <br />Use it on <Link to={`/reset?token=${resetToken}`} className="text-brand-300 hover:text-brand-200">/reset</Link>.
          </div>
        )}
      </form>
    </AuthShell>
  );
}
