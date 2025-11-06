import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth, type UserRole } from '@/hooks/useAuth';
import { type Permission } from '@/types/permissions';
import { Loader2, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireAuth?: boolean;
  requireRoles?: UserRole[];
  requireOrganizer?: boolean;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  // Permission-based access control (fine-grained)
  requirePermission?: Permission;
  requirePermissions?: Permission[];
  requireAllPermissions?: boolean; // If true, user needs ALL permissions; if false, ANY permission is enough
}

/**
 * ProtectedRoute component - guards routes requiring authentication, roles, and/or permissions
 *
 * Usage patterns:
 * 1. With children: <ProtectedRoute><Component /></ProtectedRoute>
 * 2. With Outlet (React Router v6): <Route element={<ProtectedRoute />}><Route ... /></Route>
 * 3. Role-based: <ProtectedRoute requireAdmin><AdminPanel /></ProtectedRoute>
 * 4. Permission-based: <ProtectedRoute requirePermission={PERMISSIONS.EVENT_CREATE}><CreateEvent /></ProtectedRoute>
 * 5. Multiple permissions: <ProtectedRoute requirePermissions={[PERMISSIONS.TICKET_SCAN, PERMISSIONS.TICKET_VALIDATE]} requireAllPermissions={true}>
 *
 * Security notes:
 * - Client-side route protection is UX convenience only
 * - Backend must always validate authentication and permissions
 * - AWS Amplify handles token refresh automatically via Cognito
 * - User roles/groups come from Cognito token claims
 * - Permissions injected into ID token by Pre Token Generation Lambda
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  requireRoles,
  requireOrganizer,
  requireAdmin,
  requireSuperAdmin,
  requirePermission,
  requirePermissions,
  requireAllPermissions = false,
}: ProtectedRouteProps) {
  const { loading, isAuthenticated, user, hasRole, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();
  const location = useLocation();

  // Show loading state while auth status is being resolved
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-[400px]">
          <CardContent className="py-12 px-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <Shield className="h-12 w-12 text-muted-foreground" />
                <Loader2 className="h-6 w-6 animate-spin text-primary absolute -bottom-1 -right-1" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Verifying authentication...</p>
                <p className="text-xs text-muted-foreground">This should only take a moment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check authentication - preserve attempted route for redirect after login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requireRoles && requireRoles.length > 0) {
    const hasRequiredRole = requireRoles.some((role) => hasRole(role));
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  // Convenience role checks for common patterns
  if (requireOrganizer && !hasRole(['Organizer', 'Admin', 'SuperAdmin'] as const)) {
    return <Navigate to="/unauthorized" state={{ from: location, requiredRole: 'Organizer' }} replace />;
  }

  if (requireAdmin && !hasRole(['Admin', 'SuperAdmin'] as const)) {
    return <Navigate to="/unauthorized" state={{ from: location, requiredRole: 'Admin' }} replace />;
  }

  if (requireSuperAdmin && !hasRole('SuperAdmin')) {
    return <Navigate to="/unauthorized" state={{ from: location, requiredRole: 'SuperAdmin' }} replace />;
  }

  // Check permission requirements (fine-grained access control)
  if (requirePermission) {
    if (!hasPermission(requirePermission)) {
      return (
        <Navigate
          to="/unauthorized"
          state={{
            from: location,
            requiredPermission: requirePermission,
            userPermissions: user?.permissions.length || 0,
          }}
          replace
        />
      );
    }
  }

  if (requirePermissions && requirePermissions.length > 0) {
    const hasRequiredPermissions = requireAllPermissions
      ? hasAllPermissions(requirePermissions)
      : hasAnyPermission(requirePermissions);

    if (!hasRequiredPermissions) {
      return (
        <Navigate
          to="/unauthorized"
          state={{
            from: location,
            requiredPermissions: requirePermissions.join(', '),
            requireAll: requireAllPermissions,
            userPermissions: user?.permissions.length || 0,
          }}
          replace
        />
      );
    }
  }

  // Render children (old pattern) or Outlet (new React Router v6 pattern)
  return children ? <>{children}</> : <Outlet />;
}
