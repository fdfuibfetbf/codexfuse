import { cn } from '@/lib/utils';

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="relative h-8 w-8 shrink-0">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500 via-brand-400 to-accent-cyan opacity-50 blur-md" />
        <div className="relative h-8 w-8 rounded-xl bg-bg-card ring-1 ring-white/10 flex items-center justify-center">
          <svg viewBox="0 0 64 64" className="h-5 w-5">
            <defs>
              <linearGradient id="cflogo-a" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#a78bfa" />
                <stop offset="0.5" stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
              <linearGradient id="cflogo-b" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#f0abfc" />
                <stop offset="1" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <path
              d="M22 18 L14 32 L22 46"
              stroke="url(#cflogo-a)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M42 18 L50 32 L42 46"
              stroke="url(#cflogo-b)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path d="M28 46 L36 18" stroke="url(#cflogo-a)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      </div>
      {withText && (
        <div className="leading-tight">
          <div className="font-display font-semibold tracking-tight text-[15px]">
            <span className="text-white">Codex</span>
            <span className="gradient-text-vibrant">Fuse</span>
          </div>
        </div>
      )}
    </div>
  );
}
