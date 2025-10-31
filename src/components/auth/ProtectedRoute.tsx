import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRoles?: UserRole[];
  requireOrganizer?: boolean;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireRoles,
  requireOrganizer,
  requireAdmin,
  requireSuperAdmin,
}: ProtectedRouteProps) {
  const { loading, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="py-12 px-8">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requireRoles && requireRoles.length > 0) {
    const hasRequiredRole = requireRoles.some((role) => hasRole(role));
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (requireOrganizer && !hasRole(['Organizer', 'Admin', 'SuperAdmin'] as const)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireAdmin && !hasRole(['Admin', 'SuperAdmin'] as const)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireSuperAdmin && !hasRole('SuperAdmin')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
