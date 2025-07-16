import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  allowedRoles = [],
  redirectTo = '/auth/login'
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for auth context to finish loading
      if (loading) return;

      // If authentication is required but user is not logged in
      if (requireAuth && !user) {
        const currentPath = router.asPath;
        const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
        router.push(loginUrl);
        return;
      }

      // If user is logged in but doesn't have required role
      if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.user_type)) {
        // Redirect to appropriate dashboard based on user type
        let dashboardPath = '/';
        if (user.user_type === 'provider') {
          dashboardPath = '/as/dashboard';
        } else if (user.user_type === 'customer') {
          dashboardPath = '/explorador/dashboard';
        }
        router.push(dashboardPath);
        return;
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [user, loading, router, requireAuth, allowedRoles, redirectTo]);

  // Show loading while checking authentication
  if (loading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando autenticación..." />
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return null; // Will redirect in useEffect
  }

  // If user doesn't have required role
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.user_type)) {
    return null; // Will redirect in useEffect
  }

  // User is authorized, render children
  return <>{children}</>;
};

export default ProtectedRoute;