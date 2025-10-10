import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  fallbackPath = '/dashboard',
}: ProtectedRouteProps) {
  const { session, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !session?.user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = session.user.role;

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
