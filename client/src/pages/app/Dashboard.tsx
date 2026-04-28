import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquare,
  Sparkles,
  Code2,
  Image as ImageIcon,
  AudioLines,
  FileText,
  Search,
  Bot,
  Wand2,
  Workflow,
  Languages,
  ScanText,
  ShieldCheck,
  Music2,
  Video,
  Megaphone,
  ArrowRight,
  Activity,
  Zap
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

const QUICK = [
  { to: '/app/chat', label: 'AI Chat', icon: MessageSquare, desc: 'Multi-model chat' },
  { to: '/app/templates', label: 'Templates', icon: Sparkles, desc: '60+ ready prompts' },
  { to: '/app/code', label: 'Code', icon: Code2, desc: 'Generate · explain · refactor' },
  { to: '/app/image', label: 'Image studio', icon: ImageIcon, desc: 'SDXL · FLUX · DALL·E' },
  { to: '/app/voice', label: 'Voice studio', icon: AudioLines, desc: 'TTS · transcription' },
  { to: '/app/documents', label: 'Documents · RAG', icon: FileText, desc: 'Chat with your files' },
  { to: '/app/agents', label: 'Agents', icon: Wand2, desc: 'Plan & execute' },
  { to: '/app/workflows', label: 'Workflows', icon: Workflow, desc: 'Chain models & data' }
];

const TOOLS = [
  { to: '/app/search', label: 'AI Search', icon: Search },
  { to: '/app/translate', label: 'Translate', icon: Languages },
  { to: '/app/ocr', label: 'OCR', icon: ScanText },
  { to: '/app/detector', label: 'AI detector', icon: ShieldCheck },
  { to: '/app/plagiarism', label: 'Plagiarism', icon: ShieldCheck },
  { to: '/app/bots', label: 'Custom bots', icon: Bot },
  { to: '/app/brand-voices', label: 'Brand voices', icon: Megaphone },
  { to: '/app/video', label: 'Video', icon: Video },
  { to: '/app/music', label: 'Music', icon: Music2 }
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const summary = useQuery({
    queryKey: ['usage-summary'],
    queryFn: () => api.get<{ totals: any[]; recent: any[] }>('/usage/summary')
  });

  const totalCredits = summary.data?.totals.reduce((acc, t) => acc + (t._sum?.creditsUsed ?? 0), 0) ?? 0;
  const totalGens = summary.data?.totals.reduce((acc, t) => acc + (t._count?._all ?? 0), 0) ?? 0;

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title={`Welcome${user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋`}
        description="Pick a tool to get started, or jump back into your latest work."
        icon={<Sparkles className="h-6 w-6" />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Credits available" value={formatNumber(user?.credits ?? 0)} icon={<Zap className="h-4 w-4" />} accent="brand" />
        <Stat label="Used (last 30d)" value={formatNumber(totalCredits)} icon={<Activity className="h-4 w-4" />} accent="cyan" />
        <Stat label="Generations" value={formatNumber(totalGens)} icon={<Sparkles className="h-4 w-4" />} accent="fuchsia" />
        <Stat label="Plan" value={user?.role === 'SUPERADMIN' ? 'Unlimited' : 'Free'} icon={<Sparkles className="h-4 w-4" />} accent="lime" />
      </div>

      <h2 className="text-sm uppercase tracking-widest text-ink-muted mb-3">Quick actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="panel p-4 hover:border-brand-400/40 hover:-translate-y-0.5 transition group"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500/30 to-accent-cyan/20 ring-1 ring-white/10 flex items-center justify-center text-brand-200 group-hover:scale-105 transition">
              <q.icon className="h-5 w-5" />
            </div>
            <div className="mt-3 text-sm font-semibold text-white">{q.label}</div>
            <div className="text-xs text-ink-muted">{q.desc}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-8">
        <div className="lg:col-span-2 panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">More tools</h3>
            <Link to="/app/templates" className="text-xs text-ink-dim hover:text-white inline-flex items-center gap-1">
              Browse all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {TOOLS.map((t) => (
              <Link key={t.to} to={t.to} className="nav-item">
                <t.icon className="h-4 w-4" /> {t.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent activity</h3>
            <Link to="/app/history" className="text-xs text-ink-dim hover:text-white">View all</Link>
          </div>
          <div className="space-y-2">
            {summary.isLoading ? (
              <>
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </>
            ) : (summary.data?.recent ?? []).slice(0, 6).length === 0 ? (
              <div className="text-sm text-ink-muted">No activity yet — try a tool above.</div>
            ) : (
              (summary.data?.recent ?? []).slice(0, 6).map((r) => (
                <div key={r.id} className="flex items-center gap-3 text-sm">
                  <div className="h-7 w-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-brand-300">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-white">{r.kind}</div>
                    <div className="text-[11px] text-ink-muted">
                      {r.provider} · {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-ink-muted">{r.creditsUsed} cr</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  accent
}: {
  label: string;
  value: string;
  icon: any;
  accent: 'brand' | 'cyan' | 'fuchsia' | 'lime';
}) {
  const map = {
    brand: 'from-brand-500/30 to-brand-700/10 text-brand-200',
    cyan: 'from-accent-cyan/20 to-accent-cyan/5 text-accent-cyan',
    fuchsia: 'from-accent-fuchsia/20 to-accent-fuchsia/5 text-accent-fuchsia',
    lime: 'from-accent-lime/20 to-accent-lime/5 text-accent-lime'
  };
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 text-xs text-ink-muted mb-2">
        <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${map[accent]} ring-1 ring-white/10 flex items-center justify-center`}>
          {icon}
        </div>
        {label}
      </div>
      <div className="font-display text-2xl text-white">{value}</div>
    </div>
  );
}
