import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
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
import { SignIn } from "./pages/auth/SignIn";
import { SignUp } from "./pages/auth/SignUp";
import { VerifyEmail } from "./pages/auth/VerifyEmail";

function Unauthorized() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">403</h1>
        <h2 className="text-2xl font-semibold text-foreground">Unauthorized</h2>
        <p className="text-muted-foreground">
          You don't have permission to access this page.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/" className="text-primary hover:underline">Go Home</a>
          <a href="/profile" className="text-primary hover:underline">View Profile</a>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
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
