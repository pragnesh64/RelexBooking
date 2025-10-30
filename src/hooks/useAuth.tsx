import { useState, useEffect, createContext, useContext } from 'react';
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

export type UserRole = 'User' | 'Organizer' | 'Admin' | 'SuperAdmin' | 'Pending';

export interface AuthUser {
  username: string;
  userId: string;
  email?: string;
  name?: string;
  phoneNumber?: string;
  groups: UserRole[];
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
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isOrganizer: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      const attributes = await fetchUserAttributes();
      
      // Extract groups from token
      const groups = (session.tokens?.accessToken?.payload['cognito:groups'] as string[]) || [];
      
      // Get user attributes
      const email = attributes.email || currentUser.signInDetails?.loginId;
      const name = attributes.name || '';
      const phoneNumber = attributes.phone_number || '';
      
      setUser({
        username: currentUser.username,
        userId: currentUser.userId,
        email,
        name,
        phoneNumber,
        groups: groups as UserRole[],
      });
    } catch (error) {
      console.log('No authenticated user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
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
          name,
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
      updates.push(updateUserAttribute({ userAttribute: { attributeKey: 'name', value: attributes.name } }));
    }
    
    if (attributes.phoneNumber !== undefined) {
      updates.push(updateUserAttribute({ userAttribute: { attributeKey: 'phone_number', value: attributes.phoneNumber } }));
    }
    
    await Promise.all(updates);
    await loadUser(); // Refresh user data
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.some(r => user.groups.includes(r));
  };

  const isOrganizer = hasRole(['Organizer', 'Admin', 'SuperAdmin']);
  const isAdmin = hasRole(['Admin', 'SuperAdmin']);
  const isSuperAdmin = hasRole('SuperAdmin');

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
        hasRole,
        isOrganizer,
        isAdmin,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
