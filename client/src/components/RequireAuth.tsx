import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';

export default function RequireAuth({
  children,
  requireAdmin = false
}: {
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, access, setUser, clear } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (access && user) {
      api
        .get('/auth/me')
        .then((u: any) =>
          setUser({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
            credits: u.credits,
            avatarUrl: u.avatarUrl
          })
        )
        .catch(() => clear());
    }
  }, [access, user?.id]); // eslint-disable-line

  if (!access || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (requireAdmin && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
    return <Navigate to="/app" replace />;
  }
  return <>{children}</>;
}
