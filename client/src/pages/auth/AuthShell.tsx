import { Link } from 'react-router-dom';
import { ReactNode } from 'react';
import { Logo } from '@/components/Logo';
import { Sparkles, ShieldCheck, Zap, Building2 } from 'lucide-react';

export default function AuthShell({
  title,
  subtitle,
  children,
  footer
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between p-10 border-r border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-70 pointer-events-none" />
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="relative">
          <Link to="/"><Logo /></Link>
        </div>
        <div className="relative">
          <h2 className="font-display text-4xl xl:text-5xl font-semibold gradient-text leading-tight">
            Every AI service.<br />One platform.
          </h2>
          <p className="mt-4 text-ink-dim max-w-md">
            Chat, image, voice, video, code, RAG, agents, workflows — fused into a single
            dark-mode workspace your team can brand and ship from.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
            {[
              { icon: Sparkles, title: '19+ AI tools' },
              { icon: Zap, title: '8 providers' },
              { icon: Building2, title: 'Team workspaces' },
              { icon: ShieldCheck, title: 'Audit logs' }
            ].map((f) => (
              <div key={f.title} className="panel p-3 flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-brand-300">
                  <f.icon className="h-4 w-4" />
                </div>
                <div className="text-sm text-white">{f.title}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-ink-muted">
          © {new Date().getFullYear()} CodexFuse · Built for builders
        </div>
      </div>
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8"><Link to="/"><Logo /></Link></div>
          <h1 className="font-display text-3xl font-semibold gradient-text">{title}</h1>
          {subtitle && <p className="mt-2 text-ink-dim">{subtitle}</p>}
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-sm text-ink-dim">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
