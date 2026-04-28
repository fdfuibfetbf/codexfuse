import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Image as ImageIcon,
  AudioLines,
  Code2,
  FileText,
  Sparkles,
  Search,
  Bot,
  Workflow,
  Mic2,
  ScanText,
  ShieldCheck,
  Languages,
  Building2,
  User2,
  Crown,
  ChevronDown,
  LogOut,
  History,
  Music2,
  Video,
  Wand2,
  Megaphone
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const NAV_GROUPS: { title: string; items: { to: string; label: string; icon: any; badge?: string }[] }[] = [
  {
    title: 'Workspace',
    items: [
      { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/app/history', label: 'History', icon: History }
    ]
  },
  {
    title: 'Create',
    items: [
      { to: '/app/chat', label: 'AI Chat', icon: MessageSquare },
      { to: '/app/templates', label: 'Templates', icon: Sparkles },
      { to: '/app/code', label: 'Code', icon: Code2 },
      { to: '/app/image', label: 'Image studio', icon: ImageIcon },
      { to: '/app/voice', label: 'Voice studio', icon: AudioLines },
      { to: '/app/video', label: 'Video', icon: Video, badge: 'beta' },
      { to: '/app/music', label: 'Music', icon: Music2, badge: 'beta' }
    ]
  },
  {
    title: 'Knowledge',
    items: [
      { to: '/app/documents', label: 'Documents · RAG', icon: FileText },
      { to: '/app/search', label: 'AI Search', icon: Search },
      { to: '/app/translate', label: 'Translate', icon: Languages },
      { to: '/app/ocr', label: 'OCR', icon: ScanText },
      { to: '/app/detector', label: 'AI detector', icon: ShieldCheck },
      { to: '/app/plagiarism', label: 'Plagiarism', icon: ShieldCheck }
    ]
  },
  {
    title: 'Build',
    items: [
      { to: '/app/bots', label: 'Custom bots', icon: Bot },
      { to: '/app/agents', label: 'AI agents', icon: Wand2 },
      { to: '/app/workflows', label: 'Workflows', icon: Workflow },
      { to: '/app/brand-voices', label: 'Brand voices', icon: Megaphone }
    ]
  },
  {
    title: 'Team',
    items: [
      { to: '/app/workspaces', label: 'Workspaces', icon: Building2 },
      { to: '/app/settings', label: 'Settings', icon: User2 }
    ]
  }
];

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'w-72 shrink-0 border-r border-white/[0.06] bg-bg-soft/80 backdrop-blur-xl flex flex-col',
          'fixed inset-y-0 left-0 z-40 transform transition lg:translate-x-0 lg:static',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-4 border-b border-white/[0.06]">
          <NavLink to="/" className="block">
            <Logo />
          </NavLink>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {NAV_GROUPS.map((g) => (
            <div key={g.title}>
              <div className="px-3 mb-1.5 text-[10px] uppercase tracking-widest text-ink-muted font-medium">
                {g.title}
              </div>
              <div className="space-y-0.5">
                {g.items.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.to === '/app'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => cn('nav-item', isActive && 'active')}
                  >
                    <it.icon className="h-4 w-4" />
                    <span className="flex-1">{it.label}</span>
                    {it.badge && <span className="badge-new">{it.badge}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-white/[0.06]">
          {user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' ? (
            <NavLink
              to="/admin"
              className="nav-item bg-gradient-to-r from-brand-500/10 to-accent-cyan/10 border border-brand-400/20"
            >
              <Crown className="h-4 w-4 text-brand-300" />
              <span className="flex-1">Admin panel</span>
            </NavLink>
          ) : null}
          <div className="mt-2 panel p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center text-sm font-semibold">
              {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name ?? user?.email}</div>
              <div className="text-xs text-ink-muted truncate">
                {user?.credits.toLocaleString()} credits
              </div>
            </div>
            <button
              onClick={() => {
                clear();
                nav('/');
              }}
              className="p-2 rounded-lg hover:bg-white/[0.06] text-ink-dim hover:text-white"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 border-b border-white/[0.06] bg-bg-soft/80 backdrop-blur-xl flex items-center px-4">
        <button onClick={() => setOpen((o) => !o)} className="btn-ghost px-2 py-1">
          <ChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} />
        </button>
        <div className="ml-2"><Logo /></div>
      </div>

      <main className="flex-1 min-w-0 lg:ml-0 mt-14 lg:mt-0">
        <div className="max-w-[1400px] mx-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
