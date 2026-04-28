import { useQuery } from '@tanstack/react-query';
import { Settings, ShieldCheck, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';

export default function AdminSettingsPage() {
  const providers = useQuery({ queryKey: ['providers'], queryFn: () => api.get<any>('/providers') });
  return (
    <div>
      <PageHeader eyebrow="Admin" title="System settings" description="Provider keys are configured via server environment variables." icon={<Settings className="h-6 w-6" />} />
      <div className="panel p-5">
        <div className="font-semibold mb-3">AI provider connectivity</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(providers.data ?? {}).map(([name, ok]) => (
            <div key={name} className={`panel p-4 flex items-center gap-3 ${ok ? 'border-emerald-400/20' : 'border-rose-400/20'}`}>
              {ok ? <ShieldCheck className="h-5 w-5 text-emerald-400" /> : <AlertTriangle className="h-5 w-5 text-rose-400" />}
              <div className="flex-1">
                <div className="text-sm font-medium capitalize">{name}</div>
                <div className="text-[11px] text-ink-muted">{ok ? 'Configured' : 'Set API key in .env'}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 text-xs text-ink-muted">
          To enable a provider, set its API key environment variable on the server (see <code>server/.env.example</code>).
        </div>
      </div>
    </div>
  );
}
