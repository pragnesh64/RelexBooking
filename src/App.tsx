import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { GuestOnly } from "./components/auth/GuestOnly";
import { AppLayout } from "./components/layout";
import { Dashboard } from "./pages/Dashboard";
import { Events } from "./pages/Events";
import { EventDetail } from "./pages/EventDetail";
import { Bookings } from "./pages/Bookings";
import { BookingDetail } from "./pages/BookingDetail";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { Organizer } from "./pages/Organizer";
import { Tickets } from "./pages/Tickets";
import { Notifications } from "./pages/Notifications";
import { Payment } from "./pages/Payment";
import { ScanTicket } from "./pages/ScanTicket";
import { Admin } from "./pages/Admin";
import { SignIn } from "./pages/auth/SignIn";
import { SignUp } from "./pages/auth/SignUp";
import { VerifyEmail } from "./pages/auth/VerifyEmail";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Shield, Home, User, AlertTriangle } from "lucide-react";
import { Button } from "./components/ui/button";

function Unauthorized() {
  const location = useLocation();
  const state = location.state as { from?: { pathname?: string }; requiredRole?: string } | null;
  const attemptedPath = state?.from?.pathname;
  const requiredRole = state?.requiredRole;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Shield className="h-16 w-16 text-muted-foreground" />
              <AlertTriangle className="h-8 w-8 text-destructive absolute -bottom-1 -right-1" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">403</CardTitle>
            <p className="text-xl font-semibold mt-2">Access Denied</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You don't have permission to access this resource.
            </p>
            {requiredRole && (
              <p className="text-sm text-destructive font-medium">
                Required role: {requiredRole}
              </p>
            )}
            {attemptedPath && (
              <p className="text-xs text-muted-foreground">
                Attempted to access: <code className="bg-muted px-2 py-1 rounded">{attemptedPath}</code>
              </p>
            )}
          </div>

          <div className="pt-4 space-y-2">
            <Button asChild className="w-full">
              <a href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href="/profile">
                <User className="mr-2 h-4 w-4" />
                View Profile
              </a>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-4">
            If you believe this is an error, please contact your administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Guest-Only Auth Routes - redirect logged-in users away */}
          <Route path="/signin" element={<GuestOnly><SignIn /></GuestOnly>} />
          <Route path="/signup" element={<GuestOnly><SignUp /></GuestOnly>} />
          <Route path="/verify-email" element={<GuestOnly><VerifyEmail /></GuestOnly>} />

          {/* Public error page */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected App Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Navigate to="/" replace />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="tickets" element={<Tickets />} />
            
            {/* Organizer Routes - Protected */}
            <Route
              path="organizer"
              element={
                <ProtectedRoute requireOrganizer>
                  <Organizer />
                </ProtectedRoute>
              }
            />
            <Route
              path="scan-ticket"
              element={
                <ProtectedRoute requireOrganizer>
                  <ScanTicket />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Protected */}
            <Route
              path="admin"
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              }
            />

            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="payment/:eventId" element={<Payment />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
