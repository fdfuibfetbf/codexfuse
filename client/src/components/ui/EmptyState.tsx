import { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  description,
  action
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel p-10 text-center">
      {icon && <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-white/[0.04] flex items-center justify-center text-brand-300">{icon}</div>}
      <div className="text-lg font-semibold text-white">{title}</div>
      {description && <div className="mt-1.5 text-sm text-ink-dim max-w-md mx-auto">{description}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
