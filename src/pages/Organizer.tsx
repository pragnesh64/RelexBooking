import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateEventForm } from "@/components/forms/CreateEventForm";
import { useState } from "react";

export function Organizer() {
  const [showCreateModal, setShowCreateModal] = useState(false);

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
