import { ReactNode } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { type Permission } from '@/types/permissions';
import { Lock } from 'lucide-react';

/**
 * PermButton - Safe permission-based button component
 * 
 * This component:
 * - Hides the button completely if user lacks permission (removes from DOM)
 * - Prevents action execution if permission check fails
 * - Provides optional fallback UI for unauthorized users
 * 
 * Usage Examples:
 * 
 * 1. Basic usage (hides if no permission):
 * ```tsx
 * <PermButton permission={PERMISSIONS.EVENT_CREATE} onClick={handleCreate}>
 *   Create Event
 * </PermButton>
 * ```
 * 
 * 2. With fallback content:
 * ```tsx
 * <PermButton 
 *   permission={PERMISSIONS.ADMIN_DASHBOARD}
 *   onClick={handleAdmin}
 *   fallback={<Button disabled>Request Access</Button>}
 * >
 *   Admin Panel
 * </PermButton>
 * ```
 * 
 * 3. Multiple permissions (any):
 * ```tsx
 * <PermButton 
 *   permissions={[PERMISSIONS.EVENT_EDIT, PERMISSIONS.EVENT_DELETE]}
 *   onClick={handleManage}
 * >
 *   Manage Event
 * </PermButton>
 * ```
 * 
 * 4. Multiple permissions (all required):
 * ```tsx
 * <PermButton 
 *   permissions={[PERMISSIONS.TICKET_SCAN, PERMISSIONS.TICKET_VALIDATE]}
 *   requireAll
 *   onClick={handleScan}
 * >
 *   Scan & Validate
 * </PermButton>
 * ```
 * 
 * 5. With custom button props:
 * ```tsx
 * <PermButton 
 *   permission={PERMISSIONS.EVENT_DELETE}
 *   variant="destructive"
 *   size="sm"
 *   onClick={handleDelete}
 * >
 *   Delete Event
 * </PermButton>
 * ```
 * 
 * SECURITY NOTES:
 * - This is UX only - backend MUST validate permissions
 * - Button is completely removed from DOM if no permission (not just hidden)
 * - onClick handler is wrapped with permission check as defense-in-depth
 * - Never rely on this for security - always validate server-side
 */

interface PermButtonProps extends Omit<ButtonProps, 'onClick'> {
  /**
   * Single permission required to show button
   */
  permission?: Permission;

  /**
   * Multiple permissions (user needs any or all depending on requireAll)
   */
  permissions?: Permission[];

  /**
   * If true, all permissions must be present (AND logic)
   * If false, any permission is sufficient (OR logic)
   * Default: false
   */
  requireAll?: boolean;

  /**
   * Click handler - automatically wrapped with permission check
   */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;

  /**
   * Optional fallback content when permission is denied
   * If not provided, button is completely hidden (removed from DOM)
   */
  fallback?: ReactNode;

  /**
   * If true, shows button but disabled when no permission
   * If false (default), button is completely hidden
   */
  showDisabled?: boolean;

  /**
   * Custom disabled message shown in tooltip when showDisabled is true
   */
  disabledMessage?: string;

  /**
   * Children to render inside button
   */
  children: ReactNode;
}

export function PermButton({
  permission,
  permissions,
  requireAll = false,
  onClick,
  fallback = null,
  showDisabled = false,
  disabledMessage = 'You do not have permission to perform this action',
  children,
  ...buttonProps
}: PermButtonProps) {
  const { user, loading, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  // Determine if user has required permission(s)
  let hasRequiredPermission = false;

  if (loading) {
    // Show disabled button while loading
    return (
      <Button {...buttonProps} disabled>
        {children}
      </Button>
    );
  }

  if (!user) {
    // Not authenticated - show fallback or nothing
    return showDisabled ? (
      <Button {...buttonProps} disabled title={disabledMessage}>
        <Lock className="h-4 w-4 mr-2" />
        {children}
      </Button>
    ) : (
      <>{fallback}</>
    );
  }

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
    console.warn('PermButton: No permission or permissions prop provided');
    hasRequiredPermission = false;
  }

  // Wrap onClick with permission check as defense-in-depth
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Double-check permission before executing (defense-in-depth)
    if (!hasRequiredPermission) {
      e.preventDefault();
      e.stopPropagation();
      console.warn('[SECURITY] Permission check failed for button action');
      alert(disabledMessage);
      return;
    }

    onClick?.(e);
  };

  // Show disabled button if showDisabled is true and no permission
  if (!hasRequiredPermission && showDisabled) {
    return (
      <Button {...buttonProps} disabled title={disabledMessage}>
        <Lock className="h-4 w-4 mr-2" />
        {children}
      </Button>
    );
  }

  // Hide completely if no permission and no fallback
  if (!hasRequiredPermission) {
    return <>{fallback}</>;
  }

  // Render button with permission
  return (
    <Button {...buttonProps} onClick={handleClick}>
      {children}
    </Button>
  );
}

/**
 * Hook version for conditional rendering logic
 * 
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const canDelete = usePermCheck(PERMISSIONS.EVENT_DELETE);
 *   
 *   return (
 *     <Button 
 *       onClick={handleDelete}
 *       disabled={!canDelete}
 *       title={!canDelete ? 'Permission denied' : ''}
 *     >
 *       Delete
 *     </Button>
 *   );
 * }
 * ```
 */
export function usePermCheck(
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

