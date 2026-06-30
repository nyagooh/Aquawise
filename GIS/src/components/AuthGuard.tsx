import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../data/auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}
