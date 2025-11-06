import { PreTokenGenerationTriggerHandler } from 'aws-lambda';

/**
 * Pre Token Generation Lambda Trigger
 *
 * This function runs BEFORE generating ID/Access tokens during authentication.
 * It injects fine-grained permissions into the ID token based on user's Cognito groups.
 *
 * Flow:
 * 1. User authenticates → Cognito invokes this Lambda
 * 2. Lambda reads user's groups (User, Organizer, Admin, SuperAdmin)
 * 3. Lambda maps groups to permissions using ROLE_PERMISSIONS
 * 4. Lambda adds permissions to ID token as 'custom:permissions' claim
 * 5. Frontend reads permissions from ID token for UI/UX
 *
 * IMPORTANT:
 * - This is the SOURCE OF TRUTH for permissions
 * - Keep ROLE_PERMISSIONS synchronized with src/types/permissions.ts
 * - Backend MUST validate permissions independently (never trust client)
 * - Custom claims have 2KB limit - consider optimization if needed
 *
 * Token Claims Added:
 * - custom:permissions: Space-separated string of permissions (e.g., "event:view event:create")
 */

// Permission constants - MUST match src/types/permissions.ts
const PERMISSIONS = {
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

/**
 * Role to Permission Mapping
 * MUST be kept in sync with src/types/permissions.ts
 *
 * NOTE: In production, consider:
 * - Storing this in DynamoDB for dynamic updates
 * - Caching in Lambda for performance
 * - Using Parameter Store or Secrets Manager
 */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  User: [
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.BOOKING_VIEW_OWN,
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_CANCEL,
    PERMISSIONS.USER_VIEW_OWN,
    PERMISSIONS.USER_EDIT_OWN,
    PERMISSIONS.KYC_SUBMIT,
  ],

  Organizer: [
    // Inherits User permissions
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.BOOKING_VIEW_OWN,
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_CANCEL,
    PERMISSIONS.USER_VIEW_OWN,
    PERMISSIONS.USER_EDIT_OWN,
    PERMISSIONS.KYC_SUBMIT,
    // Plus Organizer-specific
    PERMISSIONS.EVENT_CREATE,
    PERMISSIONS.EVENT_EDIT,
    PERMISSIONS.EVENT_PUBLISH,
    PERMISSIONS.TICKET_SCAN,
    PERMISSIONS.TICKET_VALIDATE,
    PERMISSIONS.BOOKING_VIEW_ALL,
    PERMISSIONS.REPORTS_VIEW_OWN,
    PERMISSIONS.REPORTS_EXPORT,
  ],

  Admin: [
    // Inherits Organizer permissions
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.BOOKING_VIEW_OWN,
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_CANCEL,
    PERMISSIONS.USER_VIEW_OWN,
    PERMISSIONS.USER_EDIT_OWN,
    PERMISSIONS.KYC_SUBMIT,
    PERMISSIONS.EVENT_CREATE,
    PERMISSIONS.EVENT_EDIT,
    PERMISSIONS.EVENT_PUBLISH,
    PERMISSIONS.TICKET_SCAN,
    PERMISSIONS.TICKET_VALIDATE,
    PERMISSIONS.BOOKING_VIEW_ALL,
    PERMISSIONS.REPORTS_VIEW_OWN,
    PERMISSIONS.REPORTS_EXPORT,
    // Plus Admin-specific
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
  ],

  SuperAdmin: [
    // Inherits Admin permissions
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.BOOKING_VIEW_OWN,
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_CANCEL,
    PERMISSIONS.USER_VIEW_OWN,
    PERMISSIONS.USER_EDIT_OWN,
    PERMISSIONS.KYC_SUBMIT,
    PERMISSIONS.EVENT_CREATE,
    PERMISSIONS.EVENT_EDIT,
    PERMISSIONS.EVENT_PUBLISH,
    PERMISSIONS.TICKET_SCAN,
    PERMISSIONS.TICKET_VALIDATE,
    PERMISSIONS.BOOKING_VIEW_ALL,
    PERMISSIONS.REPORTS_VIEW_OWN,
    PERMISSIONS.REPORTS_EXPORT,
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
    // Plus SuperAdmin-specific
    PERMISSIONS.ADMIN_SETTINGS,
    PERMISSIONS.ADMIN_AUDIT,
    PERMISSIONS.TICKET_GENERATE,
  ],

  // Pending users have no permissions
  Pending: [],
};

/**
 * Get all permissions for a user based on their groups
 */
function getPermissionsForGroups(groups: string[]): string[] {
  const allPermissions = new Set<string>();

  groups.forEach(group => {
    const permissions = ROLE_PERMISSIONS[group] || [];
    permissions.forEach(perm => allPermissions.add(perm));
  });

  return Array.from(allPermissions);
}

/**
 * Pre Token Generation Handler
 */
export const handler: PreTokenGenerationTriggerHandler = async (event) => {
  console.log('Pre Token Generation Trigger Event:', JSON.stringify(event, null, 2));

  try {
    // Extract user's Cognito groups
    const groups: string[] = event.request.groupConfiguration?.groupsToOverride || [];

    console.log(`User groups: ${groups.join(', ')}`);

    // Map groups to permissions
    const permissions = getPermissionsForGroups(groups);

    console.log(`Permissions (${permissions.length}): ${permissions.join(' ')}`);

    // Add permissions to ID token as custom claim
    // Format: Space-separated string (e.g., "event:view event:create booking:view:own")
    event.response = {
      claimsOverrideDetails: {
        claimsToAddOrOverride: {
          'custom:permissions': permissions.join(' '),
        },
      },
    };

    // Log token size for monitoring (2KB limit for custom claims)
    const tokenSize = JSON.stringify(event.response.claimsOverrideDetails.claimsToAddOrOverride).length;
    console.log(`Token custom claims size: ${tokenSize} bytes`);

    if (tokenSize > 2000) {
      console.warn('⚠️  Custom claims approaching 2KB limit. Consider optimization.');
    }

    console.log('✅ Successfully added permissions to ID token');
    return event;

  } catch (error) {
    console.error('❌ Error in Pre Token Generation:', error);
    // Don't fail authentication if permission injection fails
    // User will get fallback permissions from frontend (based on roles)
    return event;
  }
};
