import { useState, useEffect, createContext, useContext, useRef } from 'react';
import {
  signIn,
  signUp,
  signOut,
  confirmSignUp,
  resendSignUpCode,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
  updateUserAttribute,
  type SignInOutput,
  type SignUpOutput,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { type Permission, getPermissionsForRoles } from '@/types/permissions';

/**
 * Authentication & Authorization Hook - AWS Amplify + Cognito
 *
 * Security Architecture:
 * - Uses AWS Amplify with Amazon Cognito for managed authentication
 * - Tokens (access, ID, refresh) are managed by Amplify SDK (secure storage)
 * - Access tokens are short-lived (default: 1 hour)
 * - Refresh tokens are httpOnly cookies managed by AWS
 * - Token rotation and refresh handled automatically by Amplify
 * - User groups/roles come from Cognito token claims (cognito:groups)
 *
 * IMPORTANT Security Notes:
 * - Client-side auth checks are UX convenience only
 * - Backend must ALWAYS validate tokens and permissions
 * - Never trust client-side role/permission checks for security
 * - Use Amplify's GraphQL @auth directives for API protection
 * - Consider implementing session keepalive for QR scanning workflows
 *
 * Token Flow:
 * 1. Login: Cognito issues access token (stored by Amplify)
 * 2. API calls: Amplify automatically attaches Bearer token
 * 3. Refresh: Amplify automatically refreshes on 401/token expiry
 * 4. Logout: Tokens invalidated, session cleared
 */

export type UserRole = 'User' | 'Organizer' | 'Admin' | 'SuperAdmin' | 'Pending';

export interface AuthUser {
  username: string;
  userId: string;
  email?: string;
  name?: string;
  phoneNumber?: string;
  groups: UserRole[];
  permissions: Permission[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<SignInOutput>;
  signUp: (email: string, password: string, name: string) => Promise<SignUpOutput>;
  signOut: () => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  resendSignUpCode: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserAttributes: (attributes: { name?: string; phoneNumber?: string }) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  hasRole: (role: UserRole | ReadonlyArray<UserRole>) => boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  isOrganizer: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const accessTokenRef = useRef<string | null>(null);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      const attributes = await fetchUserAttributes();

      // Extract groups from access token
      const groups = (session.tokens?.accessToken?.payload['cognito:groups'] as string[]) || [];

      // Extract permissions from ID token (added by Pre Token Generation Lambda)
      // The Lambda will add permissions as a space-separated string in 'custom:permissions'
      const idTokenPayload = session.tokens?.idToken?.payload;
      let permissions: Permission[] = [];

      // Try to get permissions from ID token (added by Lambda)
      const permissionsString = idTokenPayload?.['custom:permissions'] as string | undefined;

      if (permissionsString && typeof permissionsString === 'string') {
        // Parse space-separated permissions string from token
        permissions = permissionsString.split(' ').filter(Boolean) as Permission[];
        console.log('Permissions loaded from ID token:', permissions.length);
      } else {
        // Fallback: Derive permissions from roles (for development/testing)
        // In production, permissions should come from the Lambda
        permissions = getPermissionsForRoles(groups);
        console.log('Permissions derived from roles (Lambda not configured):', permissions.length);
      }

      // Store access token in ref (memory only, not localStorage)
      accessTokenRef.current = session.tokens?.accessToken?.toString() || null;

      // Get user attributes
      const email = attributes.email || currentUser.signInDetails?.loginId;
      const name = attributes.preferred_username || attributes.email?.split('@')[0] || '';
      const phoneNumber = attributes.phone_number || '';

      setUser({
        username: currentUser.username,
        userId: currentUser.userId,
        email,
        name,
        phoneNumber,
        groups: groups as UserRole[],
        permissions,
      });
    } catch (error) {
      console.log('No authenticated user:', error);
      setUser(null);
      accessTokenRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    void loadUser();

    // Listen for auth events (sign-in, sign-out, token refresh)
    // This enables multi-tab sync and automatic re-hydration
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      const { event } = payload;

      console.log('Auth event:', event);

      switch (event) {
        case 'signedIn':
        case 'tokenRefresh':
          console.log('User signed in or token refreshed, reloading user...');
          void loadUser();
          break;
        case 'signedOut':
          console.log('User signed out');
          setUser(null);
          accessTokenRef.current = null;
          break;
        case 'tokenRefresh_failure':
          console.warn('Token refresh failed');
          setUser(null);
          accessTokenRef.current = null;
          break;
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn({ username: email, password });
    await loadUser();
    return result;
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    const result = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          preferred_username: name, // Store name as preferred_username
        },
      },
    });
    return result;
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  const handleConfirmSignUp = async (email: string, code: string) => {
    await confirmSignUp({ username: email, confirmationCode: code });
  };

  const handleResendSignUpCode = async (email: string) => {
    await resendSignUpCode({ username: email });
  };

  const handleUpdateUserAttributes = async (attributes: { name?: string; phoneNumber?: string }) => {
    const updates: Promise<unknown>[] = [];

    if (attributes.name !== undefined) {
      updates.push(updateUserAttribute({ userAttribute: { attributeKey: 'preferred_username', value: attributes.name } }));
    }

    if (attributes.phoneNumber !== undefined) {
      updates.push(updateUserAttribute({ userAttribute: { attributeKey: 'phone_number', value: attributes.phoneNumber } }));
    }

    await Promise.all(updates);
    await loadUser(); // Refresh user data
  };

  /**
   * Get current access token
   * Uses fetchAuthSession which automatically handles token refresh
   * Token is stored in memory (ref) to avoid localStorage exposure
   */
  const getAccessToken = async (): Promise<string | null> => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString() || null;
      accessTokenRef.current = token;
      return token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      accessTokenRef.current = null;
      return null;
    }
  };

  /**
   * Check if user has a specific role
   * SECURITY: Returns false if user is null, undefined, or groups are empty
   * Never defaults to true - fails secure
   */
  const hasRole = (role: UserRole | ReadonlyArray<UserRole>): boolean => {
    // CRITICAL: Fail secure - if no user, no permissions
    if (!user || !user.groups || user.groups.length === 0) {
      return false;
    }
    const roles = Array.isArray(role) ? role : [role];
    // Check if user has any of the required roles
    return roles.some(r => user.groups.includes(r));
  };

  /**
   * Check if user has a specific permission
   * SECURITY: Returns false if user is null or permissions are empty
   * Never defaults to true - fails secure
   */
  const hasPermission = (permission: Permission): boolean => {
    // CRITICAL: Fail secure - if no user or no permissions, deny access
    if (!user || !user.permissions || user.permissions.length === 0) {
      return false;
    }
    return user.permissions.includes(permission);
  };

  /**
   * Check if user has any of the specified permissions
   * SECURITY: Returns false if user is null or permissions are empty
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user || !user.permissions || user.permissions.length === 0) {
      return false;
    }
    return permissions.some(p => user.permissions.includes(p));
  };

  /**
   * Check if user has all of the specified permissions
   * SECURITY: Returns false if user is null or permissions are empty
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!user || !user.permissions || user.permissions.length === 0) {
      return false;
    }
    return permissions.every(p => user.permissions.includes(p));
  };

  // CRITICAL: These computed properties must be functions, not values
  // This ensures they're re-evaluated when user state changes
  // SECURITY: All return false if user is null/undefined or groups are empty
  const isOrganizer = user ? hasRole(['Organizer', 'Admin', 'SuperAdmin']) : false;
  const isAdmin = user ? hasRole(['Admin', 'SuperAdmin']) : false;
  const isSuperAdmin = user ? hasRole('SuperAdmin') : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        confirmSignUp: handleConfirmSignUp,
        resendSignUpCode: handleResendSignUpCode,
        refreshUser: loadUser,
        updateUserAttributes: handleUpdateUserAttributes,
        getAccessToken,
        hasRole,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isOrganizer,
        isAdmin,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// The hook lives alongside the provider so we disable the fast-refresh rule for this export.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
