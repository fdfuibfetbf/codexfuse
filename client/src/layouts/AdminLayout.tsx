import { NavLink, Outlet } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Crown, LayoutDashboard, Users, CreditCard, Sparkles, BarChart3, Settings, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/plans', label: 'Plans', icon: CreditCard },
  { to: '/admin/templates', label: 'Prompt templates', icon: Sparkles },
  { to: '/admin/usage', label: 'Usage analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'System settings', icon: Settings }
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 border-r border-white/[0.06] bg-bg-soft/80 backdrop-blur-xl">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <Logo />
          <span className="chip border-brand-400/30 text-brand-200"><Crown className="h-3 w-3" /> Admin</span>
        </div>
        <div className="p-3 space-y-0.5">
          {NAV.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) => cn('nav-item', isActive && 'active')}
            >
              <it.icon className="h-4 w-4" /> {it.label}
            </NavLink>
          ))}
        </div>
        <div className="p-3 border-t border-white/[0.06] mt-3">
          <NavLink to="/app" className="nav-item">
            <ArrowLeft className="h-4 w-4" /> Back to app
          </NavLink>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="max-w-[1400px] mx-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
