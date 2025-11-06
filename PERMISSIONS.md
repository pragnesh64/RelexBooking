# Permission System Documentation

## Overview

RelexBooking implements a **fine-grained permission system** on top of Cognito's role-based groups. This provides flexible, capability-based access control for both UI and API operations.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Authentication Flow                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. User signs in → Cognito authenticates                        │
│  2. Post Confirmation Lambda → Assigns user to group             │
│     (User, Organizer, Admin, SuperAdmin)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Pre Token Generation Lambda (CRITICAL)                       │
│     - Reads user's Cognito groups from event                     │
│     - Maps groups → permissions (ROLE_PERMISSIONS)               │
│     - Injects permissions into ID token as 'custom:permissions'  │
│     - Token contains: "event:view event:create booking:create"   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. Frontend receives ID token with permissions                  │
│     - useAuth hook extracts permissions from token               │
│     - Exposes: hasPermission(), hasAnyPermission(), etc.         │
│     - UI components use PermissionGuard for conditional render   │
│     - Routes use ProtectedRoute with permission checks           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. Backend validates permissions (REQUIRED FOR SECURITY)        │
│     - AppSync @auth directives                                   │
│     - API Gateway Cognito authorizer                             │
│     - Lambda functions check token claims                        │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Permission Definitions (`src/types/permissions.ts`)

Defines all available permissions in the system using a consistent naming format: `<resource>:<action>` or `<resource>:<action>:<scope>`.

```typescript
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

  // ... more permissions
} as const;
```

### 2. Role → Permission Mapping

Maps Cognito groups to their allowed permissions. This is the **source of truth** for access control.

```typescript
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  User: [
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.BOOKING_VIEW_OWN,
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.USER_VIEW_OWN,
    PERMISSIONS.KYC_SUBMIT,
  ],

  Organizer: [
    ...ROLE_PERMISSIONS.User,  // Inherits User permissions
    PERMISSIONS.EVENT_CREATE,
    PERMISSIONS.EVENT_EDIT,
    PERMISSIONS.TICKET_SCAN,
    PERMISSIONS.REPORTS_VIEW_OWN,
  ],

  Admin: [
    ...ROLE_PERMISSIONS.Organizer,  // Inherits Organizer permissions
    PERMISSIONS.EVENT_DELETE,
    PERMISSIONS.USER_VIEW_ALL,
    PERMISSIONS.KYC_APPROVE,
    PERMISSIONS.ADMIN_DASHBOARD,
  ],

  SuperAdmin: [
    ...ROLE_PERMISSIONS.Admin,  // Inherits Admin permissions
    PERMISSIONS.ADMIN_SETTINGS,
    PERMISSIONS.ADMIN_AUDIT,
    PERMISSIONS.TICKET_GENERATE,
  ],
};
```

### 3. Pre Token Generation Lambda

**Location**: `amplify/functions/pre-token-generation/handler.ts`

This Lambda is triggered **before** Cognito generates ID/Access tokens. It:
1. Reads user's Cognito groups from the event
2. Maps groups to permissions using `ROLE_PERMISSIONS`
3. Injects permissions into ID token as `custom:permissions` claim
4. Returns modified event to Cognito

**CRITICAL**: This Lambda MUST be configured as a Cognito trigger in `amplify/auth/resource.ts`:

```typescript
export const auth = defineAuth({
  // ...
  triggers: {
    postConfirmation,
    preTokenGeneration,  // ← REQUIRED
  },
});
```

### 4. Enhanced useAuth Hook

**Location**: `src/hooks/useAuth.tsx`

The `useAuth` hook now includes:
- `hasPermission(permission: Permission): boolean` - Check single permission
- `hasAnyPermission(permissions: Permission[]): boolean` - Check if user has ANY of the permissions
- `hasAllPermissions(permissions: Permission[]): boolean` - Check if user has ALL permissions
- `user.permissions: Permission[]` - Array of user's permissions

**Example Usage**:

```typescript
function CreateEventButton() {
  const { hasPermission } = useAuth();

  if (!hasPermission(PERMISSIONS.EVENT_CREATE)) {
    return null; // Don't show button if no permission
  }

  return <Button>Create Event</Button>;
}
```

### 5. PermissionGuard Component

**Location**: `src/components/auth/PermissionGuard.tsx`

Conditional rendering based on permissions. Provides multiple usage patterns:

**Pattern 1: Single Permission**
```tsx
<PermissionGuard permission={PERMISSIONS.EVENT_CREATE}>
  <CreateEventForm />
</PermissionGuard>
```

**Pattern 2: Multiple Permissions (ANY)**
```tsx
<PermissionGuard
  permissions={[PERMISSIONS.EVENT_EDIT, PERMISSIONS.EVENT_DELETE]}
  requireAll={false}
>
  <ManageEventButton />
</PermissionGuard>
```

**Pattern 3: Multiple Permissions (ALL)**
```tsx
<PermissionGuard
  permissions={[PERMISSIONS.TICKET_SCAN, PERMISSIONS.TICKET_VALIDATE]}
  requireAll={true}
>
  <QRScannerComponent />
</PermissionGuard>
```

**Pattern 4: With Fallback**
```tsx
<PermissionGuard
  permission={PERMISSIONS.ADMIN_DASHBOARD}
  fallback={<p>You need admin access to view this.</p>}
>
  <AdminDashboard />
</PermissionGuard>
```

**Pattern 5: Render Prop (for dynamic UI)**
```tsx
<PermissionGuard permission={PERMISSIONS.EVENT_EDIT}>
  {(hasPermission) => (
    <Button disabled={!hasPermission}>
      {hasPermission ? 'Edit Event' : 'No Edit Permission'}
    </Button>
  )}
</PermissionGuard>
```

**Hook Version**:
```tsx
import { usePermissionGuard } from '@/components/auth/PermissionGuard';

function MyComponent() {
  const canEdit = usePermissionGuard(PERMISSIONS.EVENT_EDIT);
  const canManage = usePermissionGuard(
    [PERMISSIONS.EVENT_EDIT, PERMISSIONS.EVENT_DELETE],
    true  // requireAll
  );

  return (
    <div>
      <Button disabled={!canEdit}>Edit</Button>
      <Button disabled={!canManage}>Delete</Button>
    </div>
  );
}
```

### 6. Enhanced ProtectedRoute

**Location**: `src/components/auth/ProtectedRoute.tsx`

Route-level permission guards. Supports both role-based and permission-based checks.

**Permission-Based Route Protection**:

```tsx
import { PERMISSIONS } from '@/types/permissions';

// Single permission
<Route
  path="/events/create"
  element={
    <ProtectedRoute requirePermission={PERMISSIONS.EVENT_CREATE}>
      <CreateEvent />
    </ProtectedRoute>
  }
/>

// Multiple permissions (ANY)
<Route
  path="/events/:id/manage"
  element={
    <ProtectedRoute
      requirePermissions={[PERMISSIONS.EVENT_EDIT, PERMISSIONS.EVENT_DELETE]}
      requireAllPermissions={false}
    >
      <ManageEvent />
    </ProtectedRoute>
  }
/>

// Multiple permissions (ALL)
<Route
  path="/scan"
  element={
    <ProtectedRoute
      requirePermissions={[PERMISSIONS.TICKET_SCAN, PERMISSIONS.TICKET_VALIDATE]}
      requireAllPermissions={true}
    >
      <ScanTicket />
    </ProtectedRoute>
  }
/>

// Combined: Role + Permission
<Route
  path="/admin"
  element={
    <ProtectedRoute
      requireAdmin
      requirePermission={PERMISSIONS.ADMIN_DASHBOARD}
    >
      <Admin />
    </ProtectedRoute>
  }
/>
```

## Adding New Permissions

### Step 1: Define Permission

Edit `src/types/permissions.ts`:

```typescript
export const PERMISSIONS = {
  // ... existing permissions

  // New permission
  REFUND_PROCESS: 'refund:process',
} as const;
```

### Step 2: Add Metadata

```typescript
export const PERMISSION_METADATA: Record<Permission, {...}> = {
  // ... existing metadata

  [PERMISSIONS.REFUND_PROCESS]: {
    label: 'Process Refunds',
    description: 'Can process booking refunds',
    category: 'Bookings',
    requiresKYC: true,  // Optional: if KYC required
  },
};
```

### Step 3: Assign to Roles

```typescript
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // ... other roles

  Admin: [
    // ... existing Admin permissions
    PERMISSIONS.REFUND_PROCESS,  // Add new permission
  ],
};
```

### Step 4: Update Lambda (CRITICAL)

Edit `amplify/functions/pre-token-generation/handler.ts`:

```typescript
const PERMISSIONS = {
  // ... existing permissions
  REFUND_PROCESS: 'refund:process',  // Add here too
} as const;

const ROLE_PERMISSIONS: Record<string, string[]> = {
  Admin: [
    // ... existing Admin permissions
    PERMISSIONS.REFUND_PROCESS,  // Add here too
  ],
};
```

### Step 5: Deploy Lambda

```bash
npx ampx sandbox
# or
npx ampx pipeline-deploy
```

### Step 6: Use in Code

```tsx
import { PERMISSIONS } from '@/types/permissions';

function RefundButton() {
  const { hasPermission } = useAuth();

  if (!hasPermission(PERMISSIONS.REFUND_PROCESS)) {
    return null;
  }

  return <Button onClick={processRefund}>Process Refund</Button>;
}
```

## Permission Inheritance

Roles inherit permissions from lower-privilege roles:

```
User (7 permissions)
  └─► Organizer (15 permissions = User + 8 more)
       └─► Admin (25 permissions = Organizer + 10 more)
            └─► SuperAdmin (28 permissions = Admin + 3 more)
```

This is implemented by spreading permissions in `ROLE_PERMISSIONS`:

```typescript
Organizer: [
  ...ROLE_PERMISSIONS.User,  // Inherits all User permissions
  PERMISSIONS.EVENT_CREATE,   // Plus Organizer-specific
  // ...
],
```

## Security Best Practices

### 1. Client-Side = UX Only

⚠️ **CRITICAL**: Client-side permission checks are for **UX/UI only**. They do NOT provide security.

- Attackers can bypass React components via DevTools
- Always validate permissions on the backend
- Never trust client-side checks for security decisions

### 2. Backend Validation (REQUIRED)

**AppSync GraphQL**:
```graphql
type Booking @model @auth(rules: [
  { allow: owner },
  { allow: groups, groups: ["Admin", "Organizer"], operations: [read] }
]) {
  id: ID!
  # ...
}
```

**API Gateway + Lambda**:
```typescript
export const handler = async (event: APIGatewayProxyEvent) => {
  // Extract permissions from token
  const permissions = event.requestContext.authorizer?.claims['custom:permissions'];

  if (!permissions || !permissions.includes('event:create')) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Forbidden' }),
    };
  }

  // Process request...
};
```

### 3. Keep Mappings Synchronized

The `ROLE_PERMISSIONS` mapping exists in TWO places:
1. `src/types/permissions.ts` (frontend)
2. `amplify/functions/pre-token-generation/handler.ts` (Lambda)

**THESE MUST BE IDENTICAL**. Any mismatch causes permission bugs.

**Best Practice**: In production, store permissions in DynamoDB or Parameter Store and read from both locations.

### 4. Token Size Limits

Cognito custom claims have a **2KB limit**. The Lambda logs token size:

```
Token custom claims size: 1247 bytes
```

If approaching 2KB:
- Use shorter permission names (e.g., `e:c` instead of `event:create`)
- Store permissions in DynamoDB and include only a permission hash in token
- Implement permission caching

### 5. KYC Gating

Some permissions require KYC approval:

```typescript
[PERMISSIONS.EVENT_CREATE]: {
  label: 'Create Events',
  requiresKYC: true,  // ← User must complete KYC first
},
```

Check KYC status before allowing sensitive operations:

```tsx
function CreateEventButton() {
  const { hasPermission, user } = useAuth();
  const hasKYC = user?.kycStatus === 'APPROVED';

  if (!hasPermission(PERMISSIONS.EVENT_CREATE) || !hasKYC) {
    return <RequireKYCMessage />;
  }

  return <Button>Create Event</Button>;
}
```

## Troubleshooting

### Issue: User has no permissions

**Symptoms**: `user.permissions` is empty array

**Causes**:
1. Pre Token Generation Lambda not deployed
2. Lambda not configured as Cognito trigger
3. User hasn't signed in since Lambda was deployed (old tokens)

**Solution**:
```bash
# 1. Verify Lambda exists
ls amplify/functions/pre-token-generation/

# 2. Check auth configuration
cat amplify/auth/resource.ts
# Should include: preTokenGeneration in triggers

# 3. Deploy Lambda
npx ampx sandbox

# 4. Force user to re-authenticate (gets new token with permissions)
# User signs out and signs back in
```

**Fallback**: Frontend derives permissions from roles if not in token:
```typescript
if (permissionsString) {
  permissions = permissionsString.split(' ');
} else {
  // Fallback: derive from roles
  permissions = getPermissionsForRoles(groups);
  console.log('Permissions derived from roles (Lambda not configured)');
}
```

### Issue: Permission denied but user should have access

**Symptoms**: PermissionGuard hides UI, route redirects to /unauthorized

**Debug Steps**:

1. **Check user's permissions**:
```tsx
function DebugPermissions() {
  const { user } = useAuth();
  console.log('User permissions:', user?.permissions);
  console.log('User groups:', user?.groups);
  return null;
}
```

2. **Check Lambda logs**:
```bash
# CloudWatch logs for pre-token-generation Lambda
aws logs tail /aws/lambda/preTokenGeneration --follow
```

3. **Verify ROLE_PERMISSIONS mapping**:
- Check `src/types/permissions.ts`
- Check `amplify/functions/pre-token-generation/handler.ts`
- Ensure both have the same permissions for the role

4. **Check token expiration**:
```tsx
const { getAccessToken } = useAuth();
const token = await getAccessToken();
// Decode JWT and check 'custom:permissions' claim
```

### Issue: Lambda not injecting permissions

**Symptoms**: ID token doesn't contain `custom:permissions` claim

**Causes**:
1. Lambda not configured as trigger in Amplify
2. Lambda throwing errors (check CloudWatch logs)
3. Cognito trigger not properly set up

**Solution**:

1. **Check Amplify configuration**:
```typescript
// amplify/auth/resource.ts
triggers: {
  postConfirmation,
  preTokenGeneration,  // ← Must be present
}
```

2. **Check Lambda CloudWatch logs**:
```bash
aws logs tail /aws/lambda/preTokenGeneration --follow
```

3. **Manually test Lambda** (if needed):
```bash
# Test event JSON
{
  "request": {
    "groupConfiguration": {
      "groupsToOverride": ["Admin"]
    }
  },
  "response": {}
}
```

4. **Redeploy**:
```bash
npx ampx sandbox --once
```

### Issue: Token approaching 2KB limit

**Symptoms**: Warning in Lambda logs: `Custom claims approaching 2KB limit`

**Solutions**:

1. **Use shorter permission names**:
```typescript
// Instead of:
EVENT_CREATE: 'event:create'

// Use:
EVENT_CREATE: 'e:c'
```

2. **Store permissions externally**:
```typescript
// In token: Just include a hash
'custom:permHash': 'abc123'

// In DynamoDB: Store full permissions
{
  userId: '123',
  permissionHash: 'abc123',
  permissions: ['event:create', 'event:edit', ...]
}

// Frontend: Fetch permissions after auth
```

3. **Remove unused permissions**: Audit and delete permissions that aren't used

## Migration from Role-Based to Permission-Based

Existing code using role checks can be migrated gradually:

### Before (Role-Based)
```tsx
function CreateEventButton() {
  const { isOrganizer } = useAuth();

  if (!isOrganizer) return null;

  return <Button>Create Event</Button>;
}
```

### After (Permission-Based)
```tsx
function CreateEventButton() {
  const { hasPermission } = useAuth();

  if (!hasPermission(PERMISSIONS.EVENT_CREATE)) return null;

  return <Button>Create Event</Button>;
}
```

**Benefits of Permission-Based**:
- More granular control (not all Organizers need all permissions)
- Easier to customize per-user (future: custom permission sets)
- Better audit trail (know exactly what actions user can perform)
- Decouples UI from roles (roles can change, permissions stay consistent)

## Production Considerations

### 1. Store Permissions in Database

Instead of hardcoding `ROLE_PERMISSIONS` in Lambda:

```typescript
// DynamoDB Table: RolePermissions
// PK: RoleName, SK: Permission

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

async function getPermissionsForRole(role: string): Promise<string[]> {
  const result = await dynamodb.send(new QueryCommand({
    TableName: 'RolePermissions',
    KeyConditionExpression: 'RoleName = :role',
    ExpressionAttributeValues: { ':role': role },
  }));

  return result.Items?.map(item => item.Permission) || [];
}
```

**Benefits**:
- Update permissions without redeploying Lambda
- Admin UI for permission management
- Audit trail for permission changes
- Role inheritance stored in DB

### 2. Permission Caching

Cache permissions in Lambda for performance:

```typescript
// Use Lambda's global scope for caching
let permissionCache: Map<string, string[]> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 300000; // 5 minutes

export const handler: PreTokenGenerationTriggerHandler = async (event) => {
  const now = Date.now();

  // Refresh cache if expired
  if (!permissionCache || (now - cacheTimestamp) > CACHE_TTL) {
    permissionCache = await loadPermissionsFromDynamoDB();
    cacheTimestamp = now;
  }

  // Use cached permissions
  const permissions = getPermissionsForGroups(event.request.groupConfiguration.groupsToOverride);
  // ...
};
```

### 3. Monitoring & Alerting

Set up CloudWatch alarms:

```typescript
// CloudWatch Metric: Permission Check Failures
export async function logPermissionDenial(userId: string, permission: string) {
  await cloudwatch.putMetricData({
    Namespace: 'RelexBooking/Permissions',
    MetricData: [{
      MetricName: 'PermissionDenials',
      Value: 1,
      Dimensions: [
        { Name: 'Permission', Value: permission },
        { Name: 'UserId', Value: userId },
      ],
    }],
  });
}
```

Alarm when permission denials spike (possible attack or misconfiguration).

### 4. Audit Logging

Log all permission checks:

```typescript
// Audit log entry
{
  timestamp: '2025-01-06T12:00:00Z',
  userId: 'user123',
  action: 'event:create',
  permission: 'event:create',
  hasPermission: true,
  userGroups: ['Organizer'],
  source: 'web-app',
  ip: '192.168.1.1',
}
```

Store in CloudWatch Logs or dedicated audit table.

## Summary

- **28 permissions** across 7 categories (Events, Bookings, Tickets, Users, KYC, Reports, Admin)
- **4 roles**: User → Organizer → Admin → SuperAdmin (with inheritance)
- **Pre Token Generation Lambda** injects permissions into ID token
- **useAuth hook** exposes permission checking methods
- **PermissionGuard** for conditional UI rendering
- **ProtectedRoute** for route-level guards
- **ALWAYS validate on backend** - client-side is UX only

For questions or issues, refer to:
- `SECURITY.md` - Security best practices
- `SYSTEM_MANAGEMENT.md` - Operational procedures
- `src/types/permissions.ts` - Permission definitions
- `amplify/functions/pre-token-generation/` - Lambda implementation
