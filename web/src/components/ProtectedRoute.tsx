import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const location = useLocation();

  if (typeof token === 'undefined') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
