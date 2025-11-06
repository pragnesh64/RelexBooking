/**
 * Permission System - Type Definitions
 *
 * This module defines the fine-grained permission system for RelexBooking.
 * Permissions are capability-based and map to specific actions users can perform.
 *
 * Architecture:
 * - Roles (Cognito Groups) provide coarse-grained access (User, Organizer, Admin, SuperAdmin)
 * - Permissions provide fine-grained capabilities (event:create, ticket:scan, etc.)
 * - Roles map to permissions (configured in Pre Token Generation Lambda)
 * - Permissions embedded in ID token for offline/fast checks
 * - Server MUST always validate permissions independently
 */

/**
 * Available permissions in the system
 * Format: <resource>:<action>
 */
export const PERMISSIONS = {
  // Event permissions
  EVENT_VIEW: 'event:view',
  EVENT_CREATE: 'event:create',
  EVENT_EDIT: 'event:edit',
  EVENT_DELETE: 'event:delete',
  EVENT_PUBLISH: 'event:publish',

  // Booking permissions
  BOOKING_VIEW_OWN: 'booking:view:own',
  BOOKING_VIEW_ALL: 'booking:view:all',
  BOOKING_CREATE: 'booking:create',
  BOOKING_CANCEL: 'booking:cancel',

  // Ticket permissions
  TICKET_SCAN: 'ticket:scan',
  TICKET_VALIDATE: 'ticket:validate',
  TICKET_GENERATE: 'ticket:generate',

  // User permissions
  USER_VIEW_OWN: 'user:view:own',
  USER_VIEW_ALL: 'user:view:all',
  USER_EDIT_OWN: 'user:edit:own',
  USER_EDIT_ALL: 'user:edit:all',
  USER_MANAGE_GROUPS: 'user:manage:groups',

  // KYC permissions
  KYC_SUBMIT: 'kyc:submit',
  KYC_REVIEW: 'kyc:review',
  KYC_APPROVE: 'kyc:approve',
  KYC_REJECT: 'kyc:reject',

  // Reports permissions
  REPORTS_VIEW_OWN: 'reports:view:own',
  REPORTS_VIEW_ALL: 'reports:view:all',
  REPORTS_EXPORT: 'reports:export',

  // Admin permissions
  ADMIN_DASHBOARD: 'admin:dashboard',
  ADMIN_USERS: 'admin:users',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_AUDIT: 'admin:audit',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Role to Permission mapping
 * This is the source of truth for what each role can do
 *
 * In production, this should be:
 * - Stored in DynamoDB or Parameter Store
 * - Managed via admin UI
 * - Cached by Pre Token Generation Lambda
 */

// Define base permissions for each role first (to avoid circular reference)
const USER_PERMISSIONS = [
  PERMISSIONS.EVENT_VIEW,
  PERMISSIONS.BOOKING_VIEW_OWN,
  PERMISSIONS.BOOKING_CREATE,
  PERMISSIONS.BOOKING_CANCEL,
  PERMISSIONS.USER_VIEW_OWN,
  PERMISSIONS.USER_EDIT_OWN,
  PERMISSIONS.KYC_SUBMIT,
] as const;

const ORGANIZER_PERMISSIONS = [
  PERMISSIONS.EVENT_CREATE,
  PERMISSIONS.EVENT_EDIT,
  PERMISSIONS.EVENT_PUBLISH,
  PERMISSIONS.TICKET_SCAN,
  PERMISSIONS.TICKET_VALIDATE,
  PERMISSIONS.BOOKING_VIEW_ALL, // For their events
  PERMISSIONS.REPORTS_VIEW_OWN,
  PERMISSIONS.REPORTS_EXPORT,
] as const;

const ADMIN_PERMISSIONS = [
  PERMISSIONS.EVENT_DELETE,
  PERMISSIONS.USER_VIEW_ALL,
  PERMISSIONS.USER_EDIT_ALL,
  PERMISSIONS.USER_MANAGE_GROUPS,
  PERMISSIONS.KYC_REVIEW,
  PERMISSIONS.KYC_APPROVE,
  PERMISSIONS.KYC_REJECT,
  PERMISSIONS.REPORTS_VIEW_ALL,
  PERMISSIONS.ADMIN_DASHBOARD,
  PERMISSIONS.ADMIN_USERS,
] as const;

const SUPERADMIN_PERMISSIONS = [
  PERMISSIONS.ADMIN_SETTINGS,
  PERMISSIONS.ADMIN_AUDIT,
  PERMISSIONS.TICKET_GENERATE, // Can generate tickets manually
] as const;

// Now compose roles with inheritance
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  User: [
    ...USER_PERMISSIONS,
  ],

  Organizer: [
    // User permissions +
    ...USER_PERMISSIONS,
    ...ORGANIZER_PERMISSIONS,
  ],

  Admin: [
    // Organizer permissions +
    ...USER_PERMISSIONS,
    ...ORGANIZER_PERMISSIONS,
    ...ADMIN_PERMISSIONS,
  ],

  SuperAdmin: [
    // Admin permissions +
    ...USER_PERMISSIONS,
    ...ORGANIZER_PERMISSIONS,
    ...ADMIN_PERMISSIONS,
    ...SUPERADMIN_PERMISSIONS,
  ],

  // Pending users have no permissions until KYC approved
  Pending: [],
};

/**
 * Permission metadata for UI and documentation
 */
export const PERMISSION_METADATA: Record<Permission, {
  label: string;
  description: string;
  category: string;
  requiresKYC?: boolean;
}> = {
  [PERMISSIONS.EVENT_VIEW]: {
    label: 'View Events',
    description: 'Can view public event listings',
    category: 'Events',
  },
  [PERMISSIONS.EVENT_CREATE]: {
    label: 'Create Events',
    description: 'Can create new events',
    category: 'Events',
    requiresKYC: true,
  },
  [PERMISSIONS.EVENT_EDIT]: {
    label: 'Edit Events',
    description: 'Can edit event details',
    category: 'Events',
  },
  [PERMISSIONS.EVENT_DELETE]: {
    label: 'Delete Events',
    description: 'Can delete events (admin only)',
    category: 'Events',
  },
  [PERMISSIONS.EVENT_PUBLISH]: {
    label: 'Publish Events',
    description: 'Can make events visible to public',
    category: 'Events',
  },
  [PERMISSIONS.BOOKING_VIEW_OWN]: {
    label: 'View Own Bookings',
    description: 'Can view own booking history',
    category: 'Bookings',
  },
  [PERMISSIONS.BOOKING_VIEW_ALL]: {
    label: 'View All Bookings',
    description: 'Can view all bookings for managed events',
    category: 'Bookings',
  },
  [PERMISSIONS.BOOKING_CREATE]: {
    label: 'Create Bookings',
    description: 'Can book tickets for events',
    category: 'Bookings',
  },
  [PERMISSIONS.BOOKING_CANCEL]: {
    label: 'Cancel Bookings',
    description: 'Can cancel own bookings',
    category: 'Bookings',
  },
  [PERMISSIONS.TICKET_SCAN]: {
    label: 'Scan Tickets',
    description: 'Can scan QR codes at event entrance',
    category: 'Tickets',
    requiresKYC: true,
  },
  [PERMISSIONS.TICKET_VALIDATE]: {
    label: 'Validate Tickets',
    description: 'Can validate ticket authenticity',
    category: 'Tickets',
  },
  [PERMISSIONS.TICKET_GENERATE]: {
    label: 'Generate Tickets',
    description: 'Can manually generate tickets (admin only)',
    category: 'Tickets',
  },
  [PERMISSIONS.USER_VIEW_OWN]: {
    label: 'View Own Profile',
    description: 'Can view own user profile',
    category: 'Users',
  },
  [PERMISSIONS.USER_VIEW_ALL]: {
    label: 'View All Users',
    description: 'Can view all user profiles',
    category: 'Users',
  },
  [PERMISSIONS.USER_EDIT_OWN]: {
    label: 'Edit Own Profile',
    description: 'Can edit own user profile',
    category: 'Users',
  },
  [PERMISSIONS.USER_EDIT_ALL]: {
    label: 'Edit All Users',
    description: 'Can edit any user profile',
    category: 'Users',
  },
  [PERMISSIONS.USER_MANAGE_GROUPS]: {
    label: 'Manage User Groups',
    description: 'Can add/remove users from groups',
    category: 'Users',
  },
  [PERMISSIONS.KYC_SUBMIT]: {
    label: 'Submit KYC',
    description: 'Can submit KYC documents',
    category: 'KYC',
  },
  [PERMISSIONS.KYC_REVIEW]: {
    label: 'Review KYC',
    description: 'Can review KYC submissions',
    category: 'KYC',
  },
  [PERMISSIONS.KYC_APPROVE]: {
    label: 'Approve KYC',
    description: 'Can approve KYC submissions',
    category: 'KYC',
  },
  [PERMISSIONS.KYC_REJECT]: {
    label: 'Reject KYC',
    description: 'Can reject KYC submissions',
    category: 'KYC',
  },
  [PERMISSIONS.REPORTS_VIEW_OWN]: {
    label: 'View Own Reports',
    description: 'Can view reports for own events',
    category: 'Reports',
  },
  [PERMISSIONS.REPORTS_VIEW_ALL]: {
    label: 'View All Reports',
    description: 'Can view all system reports',
    category: 'Reports',
  },
  [PERMISSIONS.REPORTS_EXPORT]: {
    label: 'Export Reports',
    description: 'Can export reports to CSV/PDF',
    category: 'Reports',
  },
  [PERMISSIONS.ADMIN_DASHBOARD]: {
    label: 'Admin Dashboard',
    description: 'Can access admin dashboard',
    category: 'Admin',
  },
  [PERMISSIONS.ADMIN_USERS]: {
    label: 'Admin Users',
    description: 'Can manage users in admin panel',
    category: 'Admin',
  },
  [PERMISSIONS.ADMIN_SETTINGS]: {
    label: 'Admin Settings',
    description: 'Can modify system settings',
    category: 'Admin',
  },
  [PERMISSIONS.ADMIN_AUDIT]: {
    label: 'Admin Audit',
    description: 'Can view audit logs',
    category: 'Admin',
  },
};

/**
 * Helper function to get all permissions for a role
 */
export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Helper function to get all permissions for multiple roles
 */
export function getPermissionsForRoles(roles: string[]): Permission[] {
  const allPermissions = new Set<Permission>();
  roles.forEach(role => {
    getPermissionsForRole(role).forEach(perm => allPermissions.add(perm));
  });
  return Array.from(allPermissions);
}

/**
 * Helper to check if a specific permission requires KYC
 */
export function requiresKYC(permission: Permission): boolean {
  return PERMISSION_METADATA[permission]?.requiresKYC || false;
}
