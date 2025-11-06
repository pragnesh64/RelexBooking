# 🔒 Complete Security Implementation Guide

## Overview

This document provides a comprehensive guide to the security architecture, testing procedures, and verification checklist for the RelexBooking application.

---

## ✅ What's Already Implemented

### 1. **Backend Authorization (Server-Side)**
- ✅ GraphQL `@auth` directives in `amplify/data/resource.ts`
- ✅ Role-based access control via Cognito groups
- ✅ Owner-based access control for resources
- ✅ Public read access for published events
- ✅ Admin-only access for AuditLog

### 2. **Frontend Authorization (Client-Side UX)**
- ✅ `ProtectedRoute` component for route-level protection
- ✅ `PermissionGuard` component for UI element protection
- ✅ `PermButton` component for permission-based buttons
- ✅ Component-level guards in Admin, Organizer, ScanTicket pages
- ✅ Sidebar navigation filtered by role
- ✅ Header dropdown filtered by role

### 3. **Authentication & Token Management**
- ✅ AWS Amplify Auth with Cognito
- ✅ Token refresh handled automatically
- ✅ Groups extracted from access token
- ✅ Permissions derived from roles (fallback) or ID token (Lambda)
- ✅ Session management with Hub listeners

### 4. **Security Functions**
- ✅ All permission functions fail secure (return false on error/null)
- ✅ Security logging for unauthorized access attempts
- ✅ Defense-in-depth architecture (route + component + backend)

---

## 🧪 Testing & Verification

### Quick Test Checklist (5 minutes)

Run these tests to verify security is working:

#### Test 1: User Cannot Access Admin Dashboard
```bash
# 1. Sign in as a User (not Admin/Organizer)
# 2. Try to navigate to /admin
# Expected: Redirected to /unauthorized
```

#### Test 2: User Cannot See Admin Links
```bash
# 1. Sign in as a User
# 2. Check sidebar navigation
# Expected: No "Admin" or "Organizer" links visible
# 3. Check header dropdown
# Expected: No "Admin Panel" link visible
```

#### Test 3: Direct URL Access Blocked
```bash
# 1. Sign in as a User
# 2. Manually type /admin in browser address bar
# Expected: Redirected to /unauthorized
# 3. Check browser console
# Expected: Security warning log about unauthorized access attempt
```

#### Test 4: API Authorization (Backend)
```bash
# Use the security test utilities:
# In browser console (while logged in as User):
import { runAllSecurityTests, printTestResults } from '@/utils/securityTests';
const results = await runAllSecurityTests();
printTestResults(results);
```

#### Test 5: Permission Functions Fail Secure
```bash
# Test with null user, empty groups, etc.
# All should return false (deny access)
```

---

## 📋 Complete Security Checklist

### Backend Security ✅

- [x] GraphQL schema has `@auth` directives for all models
- [x] Events: Public read, Organizers create/read, Admins manage all
- [x] Bookings: Users manage own, Organizers read event bookings, Admins manage all
- [x] AuditLog: Admin-only read
- [x] UserProfile: Users manage own, Admins read all

### Frontend Security ✅

- [x] All admin routes protected with `requireAdmin`
- [x] All organizer routes protected with `requireOrganizer`
- [x] Component-level guards in Admin, Organizer, ScanTicket pages
- [x] Sidebar navigation filtered by role
- [x] Header dropdown filtered by role
- [x] Permission functions fail secure (return false on error/null)
- [x] Security logging for unauthorized access attempts

### Token & Session Management ✅

- [x] Groups extracted from Cognito access token
- [x] Permissions derived from roles or ID token
- [x] Token refresh handled automatically
- [x] Session state synced across tabs via Hub listeners

### UI/UX Security ✅

- [x] Admin links completely removed from DOM (not just hidden)
- [x] Unauthorized access redirects to friendly 403 page
- [x] Security warnings logged to console
- [x] Permission-based buttons use `PermButton` component

---

## 🎯 What Each Role Should See

### User Role (Attendee)

**Visible in Sidebar:**
- ✅ Dashboard
- ✅ Events
- ✅ Bookings
- ✅ Tickets
- ✅ Profile
- ✅ Settings
- ✅ Notifications

**Hidden/Blocked:**
- ❌ Organizer Dashboard
- ❌ Scan Ticket
- ❌ Admin Dashboard
- ❌ Create Event (unless they request organizer access)

**Can Do:**
- ✅ Browse and view published events
- ✅ Create bookings for events
- ✅ View own bookings
- ✅ Download own tickets
- ✅ Cancel own bookings (within policy)
- ✅ Update own profile

**Cannot Do:**
- ❌ Create events
- ❌ Manage other users' bookings
- ❌ Access admin features
- ❌ Scan tickets
- ❌ View audit logs

### Organizer Role

**Visible in Sidebar:**
- ✅ Everything User can see
- ✅ Organizer Dashboard
- ✅ Scan Ticket

**Can Do:**
- ✅ Everything User can do
- ✅ Create and manage own events
- ✅ View bookings for own events
- ✅ Scan tickets for own events
- ✅ Check in attendees

**Cannot Do:**
- ❌ Access admin dashboard
- ❌ Manage other organizers' events
- ❌ View audit logs
- ❌ Manage users

### Admin Role

**Visible in Sidebar:**
- ✅ Everything Organizer can see
- ✅ Admin Dashboard

**Can Do:**
- ✅ Everything Organizer can do
- ✅ Manage all events (not just own)
- ✅ Manage all bookings
- ✅ View audit logs
- ✅ Manage users (promote, view profiles)
- ✅ Approve KYC requests

**Cannot Do:**
- ❌ SuperAdmin-only actions (if any)

### SuperAdmin Role

**Can Do:**
- ✅ Everything Admin can do
- ✅ Full system access
- ✅ Delete audit logs
- ✅ Manage all system settings

---

## 🔧 Using Security Components

### PermButton Component

```tsx
import { PermButton } from '@/components/auth/PermButton';
import { PERMISSIONS } from '@/types/permissions';

// Basic usage - hides if no permission
<PermButton 
  permission={PERMISSIONS.EVENT_CREATE}
  onClick={handleCreate}
>
  Create Event
</PermButton>

// With fallback
<PermButton 
  permission={PERMISSIONS.ADMIN_DASHBOARD}
  onClick={handleAdmin}
  fallback={<Button disabled>Request Access</Button>}
>
  Admin Panel
</PermButton>

// Show disabled instead of hiding
<PermButton 
  permission={PERMISSIONS.EVENT_DELETE}
  onClick={handleDelete}
  showDisabled
  disabledMessage="Only organizers can delete events"
>
  Delete Event
</PermButton>
```

### PermissionGuard Component

```tsx
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/types/permissions';

// Hide/show content based on permission
<PermissionGuard permission={PERMISSIONS.EVENT_EDIT}>
  <Button onClick={handleEdit}>Edit Event</Button>
</PermissionGuard>

// With fallback
<PermissionGuard 
  permission={PERMISSIONS.ADMIN_DASHBOARD}
  fallback={<p>Access denied</p>}
>
  <AdminDashboard />
</PermissionGuard>
```

### ProtectedRoute Component

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Role-based protection
<Route
  path="/admin"
  element={
    <ProtectedRoute requireAdmin>
      <Admin />
    </ProtectedRoute>
  }
/>

// Permission-based protection
<Route
  path="/scan-ticket"
  element={
    <ProtectedRoute requirePermission={PERMISSIONS.TICKET_SCAN}>
      <ScanTicket />
    </ProtectedRoute>
  }
/>
```

---

## 🚨 Security Best Practices

### 1. **Never Trust Client-Side Checks**
- Client-side checks are UX only
- Always validate permissions server-side
- Backend must enforce authorization

### 2. **Fail Secure**
- When in doubt, deny access
- Permission functions return `false` on error/null
- Never default to allowing access

### 3. **Defense in Depth**
- Multiple layers of protection:
  1. Route protection
  2. Component guards
  3. Backend authorization

### 4. **Log Security Events**
- Log unauthorized access attempts
- Monitor for suspicious activity
- Set up alerts for repeated failures

### 5. **Regular Audits**
- Test permission enforcement regularly
- Review Cognito group memberships
- Verify backend @auth rules are correct

---

## 📊 Monitoring & Alerts

### Security Logging

Unauthorized access attempts are logged with:
- User ID
- Email
- User groups
- Timestamp
- Attempted resource

**Example log:**
```
[SECURITY] Unauthorized access attempt to Admin page: {
  userId: "71b3adba-9071-7061-6da6-79ea12aae9e9",
  email: "user@example.com",
  groups: ["User"],
  timestamp: "2024-01-15T10:30:00.000Z"
}
```

### Recommended Alerts

1. **Multiple 403 errors** from same user in short time
2. **Unauthorized admin access attempts** (log and alert)
3. **Token validation failures** (potential token tampering)
4. **Group membership changes** (audit log)

---

## 🧪 Running Security Tests

### Automated Tests

```typescript
import { runAllSecurityTests, printTestResults } from '@/utils/securityTests';

// Run all tests
const results = await runAllSecurityTests();
printTestResults(results);
```

### Manual Testing

1. **Test as User:**
   - Sign in as User
   - Try to access `/admin` → Should redirect
   - Check sidebar → No admin links
   - Try to create event → Should be blocked

2. **Test as Organizer:**
   - Sign in as Organizer
   - Access `/organizer` → Should work
   - Access `/admin` → Should redirect
   - Create event → Should work

3. **Test as Admin:**
   - Sign in as Admin
   - Access `/admin` → Should work
   - All features should be accessible

---

## 🔄 Token Refresh & Session Management

### How It Works

1. **Initial Sign-In:**
   - Cognito issues access token, ID token, refresh token
   - Tokens stored securely by Amplify SDK
   - Groups extracted from access token

2. **Token Refresh:**
   - Amplify automatically refreshes tokens on expiry
   - Hub listener updates user state
   - UI re-renders with updated permissions

3. **Multi-Tab Sync:**
   - Hub listeners sync auth state across tabs
   - Sign-out in one tab logs out all tabs

---

## 📝 Next Steps (Optional Enhancements)

1. **Add CloudWatch Logging** for production security monitoring
2. **Implement Rate Limiting** on admin endpoints
3. **Add MFA Requirement** for SuperAdmin role
4. **Create Security Audit Dashboard** to view access attempts
5. **Add IP-Based Restrictions** for admin access (optional)
6. **Implement Pre Token Generation Lambda** for fine-grained permissions

---

## ✅ Summary

Your application now has:

- ✅ **3 layers of security** (route + component + backend)
- ✅ **Fail-secure permission functions**
- ✅ **Component-level guards** on all admin/organizer pages
- ✅ **Security logging** for audit trail
- ✅ **Backend enforcement** via GraphQL @auth rules
- ✅ **Comprehensive testing utilities**

**Normal Users can NO LONGER access admin dashboard or organizer features.**

---

## 🆘 Troubleshooting

### Issue: User can still see admin links

**Check:**
1. Is user actually in "User" group only? Check Cognito console
2. Is `isAdmin` computed correctly? Check `useAuth` hook
3. Is sidebar filtering working? Check `AppLayout` component

### Issue: User can access admin route directly

**Check:**
1. Is `ProtectedRoute` wrapping the route? Check `App.tsx`
2. Is component guard in place? Check `Admin.tsx`
3. Is backend blocking? Check GraphQL @auth rules

### Issue: Permission functions return true incorrectly

**Check:**
1. Are groups being extracted correctly? Check token payload
2. Is `hasRole` function checking groups array? Check `useAuth.tsx`
3. Is user state null/undefined? Check `loadUser` function

---

## 📚 Additional Resources

- [AWS Amplify Auth Documentation](https://docs.amplify.aws/react/build-a-backend/auth/)
- [GraphQL Authorization Guide](https://docs.amplify.aws/react/build-a-backend/data/authorization/)
- [Cognito Groups Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-user-groups.html)

