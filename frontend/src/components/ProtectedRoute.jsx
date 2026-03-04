/**
 * ProtectedRoute Component
 * Restricts access to routes based on authentication and role
 * Redirects unauthenticated users to /login
 * Redirects non-admin users trying to access admin routes to /dashboard
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children - Protected component
 * @param {boolean} [props.adminOnly=false] - Require admin role
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user, loading } = useAuth();

  // Wait until auth state is determined
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--muted)' }}>
        Loading...
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only route but user is not admin → redirect to dashboard
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
