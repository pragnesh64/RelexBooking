# 🔒 Security Quick Reference

## Components Available

### 1. `PermButton` - Permission-Based Button
**Location:** `src/components/auth/PermButton.tsx`

**Usage:**
```tsx
import { PermButton } from '@/components/auth/PermButton';
import { PERMISSIONS } from '@/types/permissions';

// Hides button if no permission
<PermButton permission={PERMISSIONS.EVENT_CREATE} onClick={handleCreate}>
  Create Event
</PermButton>

// Shows disabled button instead
<PermButton 
  permission={PERMISSIONS.ADMIN_DASHBOARD}
  showDisabled
  disabledMessage="Request admin access"
  onClick={handleAdmin}
>
  Admin Panel
</PermButton>
```

### 2. `PermissionGuard` - Conditional UI Rendering
**Location:** `src/components/auth/PermissionGuard.tsx`

**Usage:**
```tsx
import { PermissionGuard } from '@/components/auth/PermissionGuard';

<PermissionGuard permission={PERMISSIONS.EVENT_EDIT}>
  <Button>Edit Event</Button>
</PermissionGuard>
```

### 3. `ProtectedRoute` - Route Protection
**Location:** `src/components/auth/ProtectedRoute.tsx`

**Usage:**
```tsx
<Route
  path="/admin"
  element={
    <ProtectedRoute requireAdmin>
      <Admin />
    </ProtectedRoute>
  }
/>
```

### 4. `useAuth` Hook - Permission Checks
**Location:** `src/hooks/useAuth.tsx`

**Usage:**
```tsx
const { hasPermission, isAdmin, isOrganizer } = useAuth();

if (hasPermission(PERMISSIONS.EVENT_CREATE)) {
  // Show create button
}
```

---

## Quick Test Commands

### Test Security (Browser Console)
```javascript
// Import test utilities
import { runAllSecurityTests, printTestResults } from '@/utils/securityTests';

// Run all tests
const results = await runAllSecurityTests();
printTestResults(results);
```

### Manual Test Checklist
1. ✅ Sign in as User → Try `/admin` → Should redirect
2. ✅ Sign in as User → Check sidebar → No admin links
3. ✅ Sign in as Organizer → Try `/admin` → Should redirect
4. ✅ Sign in as Admin → Try `/admin` → Should work

---

## What Each Role Sees

| Feature | User | Organizer | Admin |
|---------|------|-----------|-------|
| Browse Events | ✅ | ✅ | ✅ |
| Create Bookings | ✅ | ✅ | ✅ |
| Create Events | ❌ | ✅ | ✅ |
| Organizer Dashboard | ❌ | ✅ | ✅ |
| Admin Dashboard | ❌ | ❌ | ✅ |
| Scan Tickets | ❌ | ✅ | ✅ |

---

## Security Architecture

```
┌─────────────────────────────────────┐
│  1. Route Protection (ProtectedRoute)│
│     - First line of defense         │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  2. Component Guards (Admin.tsx)     │
│     - Second line of defense         │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  3. Backend @auth (GraphQL)          │
│     - Final enforcement              │
└─────────────────────────────────────┘
```

---

## Common Issues & Fixes

### Issue: User can see admin links
**Fix:** Check `AppLayout.tsx` - sidebar filtering by role

### Issue: User can access admin route
**Fix:** Check `App.tsx` - route has `requireAdmin` prop

### Issue: Permission check returns true incorrectly
**Fix:** Check `useAuth.tsx` - `hasRole` function fails secure

---

## Files to Check

- `src/hooks/useAuth.tsx` - Permission logic
- `src/components/auth/ProtectedRoute.tsx` - Route guards
- `src/components/auth/PermButton.tsx` - Button component
- `src/pages/Admin.tsx` - Component guard example
- `amplify/data/resource.ts` - Backend @auth rules

---

For complete documentation, see `SECURITY_COMPLETE.md`

