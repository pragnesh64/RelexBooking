import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { type Permission } from '@/types/permissions';

/**
 * PermissionGuard - Conditional UI rendering based on permissions
 *
 * This component provides fine-grained access control for UI elements.
 * It checks if the current user has the required permission(s) and renders
 * children only if authorized.
 *
 * Usage Examples:
 *
 * 1. Single permission check:
 * ```tsx
 * <PermissionGuard permission={PERMISSIONS.EVENT_CREATE}>
 *   <Button>Create Event</Button>
 * </PermissionGuard>
 * ```
 *
 * 2. Multiple permissions (any):
 * ```tsx
 * <PermissionGuard permissions={[PERMISSIONS.EVENT_EDIT, PERMISSIONS.EVENT_DELETE]} requireAll={false}>
 *   <Button>Manage Event</Button>
 * </PermissionGuard>
 * ```
 *
 * 3. Multiple permissions (all required):
 * ```tsx
 * <PermissionGuard permissions={[PERMISSIONS.TICKET_SCAN, PERMISSIONS.TICKET_VALIDATE]} requireAll>
 *   <ScannerComponent />
 * </PermissionGuard>
 * ```
 *
 * 4. With fallback content:
 * ```tsx
 * <PermissionGuard permission={PERMISSIONS.ADMIN_DASHBOARD} fallback={<p>Access denied</p>}>
 *   <AdminDashboard />
 * </PermissionGuard>
 * ```
 *
 * 5. Render prop pattern:
 * ```tsx
 * <PermissionGuard permission={PERMISSIONS.EVENT_EDIT}>
 *   {(hasPermission) => (
 *     <Button disabled={!hasPermission}>Edit Event</Button>
 *   )}
 * </PermissionGuard>
 * ```
 *
 * IMPORTANT:
 * - This is for UX/UI only - NEVER rely on this for security
 * - Backend MUST always validate permissions independently
 * - Users can bypass client-side checks via browser DevTools
 * - Always validate permissions in API resolvers and Lambda functions
 */

interface PermissionGuardProps {
  /**
   * Single permission to check
   */
  permission?: Permission;

  /**
   * Multiple permissions to check
   */
  permissions?: Permission[];

  /**
   * If true, all permissions must be present (AND logic)
   * If false, any permission is sufficient (OR logic)
   * Default: false
   */
  requireAll?: boolean;

  /**
   * Optional fallback content when permission is denied
   * If not provided, nothing is rendered
   */
  fallback?: ReactNode;

  /**
   * Content to render when authorized
   * Can be ReactNode or function receiving boolean for render prop pattern
   */
  children: ReactNode | ((hasPermission: boolean) => ReactNode);

  /**
   * If true, renders children even when not authenticated (for loading states)
   * Default: false
   */
  showWhileLoading?: boolean;
}

export function PermissionGuard({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
  showWhileLoading = false,
}: PermissionGuardProps) {
  const { user, loading, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  // Handle loading state
  if (loading) {
    if (showWhileLoading) {
      return typeof children === 'function' ? <>{children(false)}</> : <>{children}</>;
    }
    return <>{fallback}</>;
  }

  // Not authenticated - deny by default
  if (!user) {
    return <>{fallback}</>;
  }

  // Determine if user has required permission(s)
  let hasRequiredPermission = false;

  if (permission) {
    // Single permission check
    hasRequiredPermission = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    // Multiple permissions check
    hasRequiredPermission = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    // No permissions specified - deny by default (safer than allowing)
    console.warn('PermissionGuard: No permission or permissions prop provided');
    hasRequiredPermission = false;
  }

  // Render prop pattern support
  if (typeof children === 'function') {
    return <>{children(hasRequiredPermission)}</>;
  }

  // Standard render
  return hasRequiredPermission ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook version for use in component logic
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const canEdit = usePermissionGuard(PERMISSIONS.EVENT_EDIT);
 *   const canManage = usePermissionGuard([PERMISSIONS.EVENT_EDIT, PERMISSIONS.EVENT_DELETE], true);
 *
 *   return (
 *     <div>
 *       <Button disabled={!canEdit}>Edit</Button>
 *       <Button disabled={!canManage}>Delete</Button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissionGuard(
  permissionOrPermissions: Permission | Permission[],
  requireAll = false
): boolean {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  if (!user) return false;

  if (Array.isArray(permissionOrPermissions)) {
    return requireAll
      ? hasAllPermissions(permissionOrPermissions)
      : hasAnyPermission(permissionOrPermissions);
  }

  return hasPermission(permissionOrPermissions);
}

/**
 * Alternative component names for semantic clarity
 */
export const RequirePermission = PermissionGuard;
export const IfHasPermission = PermissionGuard;
