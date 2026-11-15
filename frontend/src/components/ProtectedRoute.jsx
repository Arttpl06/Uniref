import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-4">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!user.emailVerified) {
    return <Navigate to="/PasswordVerificationPage" replace />;
  }

  return <Outlet />;
}
