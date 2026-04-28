import { create } from 'zustand';
import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'info';
}

interface ToastStore {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const useToasts = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, ...t }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 4500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
}));

export function ToastViewport() {
  const toasts = useToasts((s) => s.toasts);
  const dismiss = useToasts((s) => s.dismiss);
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {}, []);
  const Icon =
    toast.variant === 'success' ? CheckCircle2 : toast.variant === 'error' ? AlertTriangle : Info;
  return (
    <div
      className={cn(
        'glass-strong rounded-xl p-3 pr-2 flex gap-3 items-start shadow-card',
        toast.variant === 'success' && 'border-emerald-400/30',
        toast.variant === 'error' && 'border-rose-400/30'
      )}
    >
      <Icon
        className={cn(
          'h-5 w-5 mt-0.5 shrink-0',
          toast.variant === 'success'
            ? 'text-emerald-400'
            : toast.variant === 'error'
              ? 'text-rose-400'
              : 'text-brand-300'
        )}
      />
      <div className="flex-1">
        <div className="text-sm font-medium text-white">{toast.title}</div>
        {toast.description && <div className="text-xs text-ink-dim mt-0.5">{toast.description}</div>}
      </div>
      <button onClick={onClose} className="text-ink-muted hover:text-white p-1 -m-1">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
