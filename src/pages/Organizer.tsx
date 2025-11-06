import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateEventForm } from "@/components/forms/CreateEventForm";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function Organizer() {
  const { user, loading, isOrganizer, isAdmin, isSuperAdmin } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // CRITICAL SECURITY: Defense-in-depth permission check
  useEffect(() => {
    if (!loading && user && !isOrganizer && !isAdmin && !isSuperAdmin) {
      console.warn('[SECURITY] Unauthorized access attempt to Organizer page:', {
        userId: user.userId,
        email: user.email,
        groups: user.groups,
        timestamp: new Date().toISOString(),
      });
    }
  }, [loading, user, isOrganizer, isAdmin, isSuperAdmin]);

  // Show loading state while checking permissions
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // CRITICAL: Block unauthorized access
  if (!user || (!isOrganizer && !isAdmin && !isSuperAdmin)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // TODO: Fetch organizer events from Amplify
  // const { data: events, loading, error } = useOrganizerEvents();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Organizer Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage your events and view analytics
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Events</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Bookings</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Upcoming Events</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Revenue</CardDescription>
            <CardTitle className="text-3xl">$0</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
          <CardDescription>Manage and edit your events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border bg-background/60 p-6 text-sm text-muted-foreground text-center">
            No events created yet. Click "Create Event" to get started.
          </div>
        </CardContent>
      </Card>

      {/* Create Event Modal */}
      <CreateEventForm
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </motion.section>
  );
}
