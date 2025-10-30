# 🔐 RelexBooking Authentication & Authorization Implementation

## ✅ What's Been Implemented

### 1. **Backend Configuration**

#### GraphQL Schema (`amplify/data/resource.ts`)
- ✅ Event model with @auth rules:
  - Public read access
  - Organizers can create/update/delete their own events
  - Admins/SuperAdmins can manage all events
- ✅ Booking model with @auth rules:
  - Users can create/read/update their own bookings
  - Organizers can read bookings for their events
  - Admins/SuperAdmins can manage all bookings
- ✅ UserProfile model for extended user data

#### Auth Configuration (`amplify/auth/resource.ts`)
- ✅ Email-based authentication
- ✅ Required user attributes (email, name)
- ✅ Optional phone number
- ✅ Account recovery via email

#### Post Confirmation Lambda (`amplify/functions/post-confirmation/`)
- ✅ Automatically assigns new users to "Pending" group
- ✅ Configurable via `DEFAULT_GROUP` environment variable
- ✅ Attached to Cognito Post Confirmation trigger

### 2. **Frontend Components**

#### Auth Hook (`src/hooks/useAuth.tsx`)
- ✅ `AuthProvider` context for global auth state
- ✅ `useAuth` hook with:
  - `signIn`, `signUp`, `signOut`
  - `confirmSignUp`, `resendSignUpCode`
  - `user`, `loading`, `isAuthenticated`
  - `hasRole()`, `isOrganizer`, `isAdmin`, `isSuperAdmin`

#### Protected Route Component (`src/components/auth/ProtectedRoute.tsx`)
- ✅ Route protection based on authentication
- ✅ Role-based access control
- ✅ `requireOrganizer`, `requireAdmin`, `requireSuperAdmin` props
- ✅ Loading states

#### Auth Pages
- ✅ `SignIn` (`src/pages/auth/SignIn.tsx`) - Email/password sign in
- ✅ `SignUp` (`src/pages/auth/SignUp.tsx`) - User registration
- ✅ `VerifyEmail` (`src/pages/auth/VerifyEmail.tsx`) - Email verification

#### Updated Components
- ✅ `Header` - Shows user info, groups, sign out button
- ✅ `App.tsx` - Integrated auth routes and protected routes
- ✅ `main.tsx` - Wrapped with AuthProvider

## 🚀 Next Steps to Complete Setup

### 1. Install Dependencies
```bash
cd amplify/functions/post-confirmation
npm install @aws-sdk/client-cognito-identity-provider
```

### 2. Create Cognito Groups in AWS Console
1. Go to AWS Console → Cognito → User Pools → Your Pool
2. Navigate to "Groups" tab
3. Create groups:
   - **User** (default for approved users)
   - **Organizer** (can create/manage events)
   - **Admin** (can moderate events, manage users)
   - **SuperAdmin** (full access)
   - **Pending** (new signups awaiting approval)

### 3. Deploy Backend
```bash
# Deploy Amplify backend
npx ampx sandbox

# Or for production
npx ampx pipeline-deploy --branch main
```

### 4. Grant Lambda Permissions
The Post Confirmation Lambda needs IAM permissions to add users to groups. This should be handled automatically by Amplify, but verify:
- Lambda execution role has `cognito-idp:AdminAddUserToGroup` permission

### 5. Test Authentication Flow
1. Sign up a new user → Should receive verification code
2. Verify email → User added to "Pending" group
3. Admin approves user → Move to "User" or "Organizer" group
4. Sign in → Access based on group membership

## 📋 Admin Panel TODO

Create an Admin Panel component (`src/pages/admin/AdminPanel.tsx`) to:
- List users by group (Pending, User, Organizer, Admin)
- Approve/reject pending users
- Promote users to Organizer/Admin
- Revoke access (remove from groups)

This would require:
- Lambda function with admin Cognito APIs
- Or AWS SDK in frontend with admin credentials (not recommended)
- Best: Backend Lambda with IAM role that can manage Cognito groups

## 🔒 Security Best Practices Implemented

✅ Server-side authorization via AppSync @auth rules
✅ Client-side route protection (UX only, not security)
✅ Role-based access control using Cognito groups
✅ JWT tokens with group claims
✅ Protected routes require authentication
✅ Organizer routes require specific roles

## 🎯 Role-Based Access Summary

| Role | Can Do |
|------|--------|
| **User** | Browse events, create bookings, view own bookings |
| **Organizer** | Everything User can + create/manage own events, view event bookings |
| **Admin** | Everything Organizer can + moderate all events, manage all bookings |
| **SuperAdmin** | Everything Admin can + manage users, promote to Admin |
| **Pending** | Cannot access app (requires admin approval) |

## 📝 Usage Examples

### Check if user is organizer:
```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { isOrganizer } = useAuth();
  
  if (isOrganizer) {
    return <CreateEventButton />;
  }
}
```

### Protect a route:
```tsx
<Route
  path="/organizer"
  element={
    <ProtectedRoute requireOrganizer>
      <Organizer />
    </ProtectedRoute>
  }
/>
```

### Check specific role:
```tsx
const { hasRole } = useAuth();
if (hasRole('SuperAdmin')) {
  // Show admin features
}
```

## 🐛 Troubleshooting

### Users not getting assigned to groups
- Check Lambda logs in CloudWatch
- Verify Lambda has correct IAM permissions
- Check Lambda environment variables

### Auth errors on frontend
- Verify Amplify is configured: `Amplify.configure(outputs)`
- Check `amplify_outputs.json` has correct auth config
- Verify user pool exists and is deployed

### GraphQL authorization errors
- Check @auth rules in schema match intended access
- Verify user groups are correctly set in Cognito
- Check JWT token includes `cognito:groups` claim

