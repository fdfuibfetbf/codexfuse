import { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  icon
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-6 md:mb-8 flex items-start justify-between gap-4 flex-wrap">
      <div className="flex items-start gap-4">
        {icon && (
          <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-500/30 to-accent-cyan/20 ring-1 ring-white/10 items-center justify-center text-brand-200">
            {icon}
          </div>
        )}
        <div>
          {eyebrow && (
            <div className="text-[11px] uppercase tracking-widest text-brand-300 font-medium mb-1">
              {eyebrow}
            </div>
          )}
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-white tracking-tight">
            {title}
          </h1>
          {description && <p className="mt-1.5 text-sm text-ink-dim max-w-2xl">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
