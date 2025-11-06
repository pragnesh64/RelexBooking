import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth, type UserRole } from '@/hooks/useAuth';
import { Loader2, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface RequireRoleProps {
  children?: React.ReactNode;
  role: UserRole | ReadonlyArray<UserRole>;
}

/**
 * RequireRole component - guards routes requiring specific Cognito groups
 *
 * Usage patterns:
 * 1. With children: <RequireRole role="Admin"><Component /></RequireRole>
 * 2. With Outlet: <Route element={<RequireRole role="Admin" />}><Route ... /></Route>
 * 3. Multiple roles: <RequireRole role={['Admin', 'SuperAdmin']} />
 *
 * This component:
 * - Checks authentication first
 * - Then checks if user has any of the specified roles (Cognito groups)
 * - Redirects to /signin if not authenticated
 * - Redirects to /unauthorized if authenticated but missing required role
 *
 * Security: Client-side only! Backend must validate Cognito groups via:
 * - AppSync @auth directives
 * - API Gateway Cognito authorizer
 * - Lambda token validation
 */
export function RequireRole({ children, role }: RequireRoleProps) {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  const roles = Array.isArray(role) ? role : [role];
  const roleNames = roles.join(', ');

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
                <p className="text-sm font-medium">Verifying permissions...</p>
                <p className="text-xs text-muted-foreground">Checking role: {roleNames}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check authentication first
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check if user has any of the required roles
  const hasRequiredRole = roles.some((r) => hasRole(r));

  if (!hasRequiredRole) {
    return (
      <Navigate
        to="/unauthorized"
        state={{
          from: location,
          requiredRole: roleNames,
          userRoles: user?.groups.join(', ') || 'none',
        }}
        replace
      />
    );
  }

  // Render children (old pattern) or Outlet (new React Router v6 pattern)
  return children ? <>{children}</> : <Outlet />;
}
