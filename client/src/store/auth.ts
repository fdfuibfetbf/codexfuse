import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  credits: number;
  avatarUrl?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  access: string | null;
  refresh: string | null;
  setAuth: (a: { user: AuthUser; access: string; refresh: string }) => void;
  setUser: (u: AuthUser) => void;
  clear: () => void;
  tryRefresh: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      access: null,
      refresh: null,
      setAuth: ({ user, access, refresh }) => set({ user, access, refresh }),
      setUser: (user) => set({ user }),
      clear: () => set({ user: null, access: null, refresh: null }),
      tryRefresh: async () => {
        const refresh = get().refresh;
        if (!refresh) return false;
        try {
          const res = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh })
          });
          if (!res.ok) {
            set({ user: null, access: null, refresh: null });
            return false;
          }
          const data = await res.json();
          set({ user: data.user, access: data.access, refresh: data.refresh });
          return true;
        } catch {
          set({ user: null, access: null, refresh: null });
          return false;
        }
      }
    }),
    { name: 'codexfuse-auth' }
  )
);
