import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface GuestOnlyProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * GuestOnly route component
 * Prevents authenticated users from accessing guest-only pages (login, signup)
 * Redirects logged-in users to dashboard or specified route
 */
export function GuestOnly({ children, redirectTo = '/' }: GuestOnlyProps) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="py-12 px-8">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Checking authentication...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is logged in, redirect them away from guest pages
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
