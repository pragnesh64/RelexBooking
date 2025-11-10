import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Plus, Loader2, Edit, Trash2, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateEventForm } from "@/components/forms/CreateEventForm";
import { EditEventForm } from "@/components/forms/EditEventForm";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDeleteEvent } from "@/hooks/useEvents";
import { getAmplifyClient } from "@/lib/amplifyClient";
import type { Event } from "@/types/graphql";

export function Organizer() {
  const { user, loading, isOrganizer, isAdmin, isSuperAdmin } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const { deleteEvent } = useDeleteEvent();

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

  // Fetch organizer's events
  const fetchEvents = useCallback(async () => {
    if (!user) return;

    setEventsLoading(true);
    try {
      const client = getAmplifyClient();
      if (!client) {
        console.error("Amplify client not configured");
        return;
      }

      // Fetch events created by this organizer
      const result = await client.models.Event.list({
        filter: isAdmin || isSuperAdmin
          ? undefined // Admins/SuperAdmins see all events
          : { organizerID: { eq: user.userId } }, // Organizers see only their events
      });

      const mappedEvents = result.data.map((event) => ({
        id: event.id,
        title: event.title ?? null,
        description: event.description ?? null,
        date: event.date ?? null,
        location: event.location ?? null,
        price: event.price ?? null,
        capacity: event.capacity ?? null,
        imageUrl: event.imageUrl ?? null,
        category: event.category ?? null,
        organizerID: event.organizerID,
        organizerName: event.organizerName ?? null,
        status: event.status ?? null,
        publishedAt: event.publishedAt ?? null,
        createdAt: event.createdAt ?? null,
        updatedAt: event.updatedAt ?? null,
      }));

      setEvents(mappedEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setEventsLoading(false);
    }
  }, [user, isAdmin, isSuperAdmin]);

  useEffect(() => {
    if (user && (isOrganizer || isAdmin || isSuperAdmin)) {
      void fetchEvents();
    }
  }, [user, isOrganizer, isAdmin, isSuperAdmin, fetchEvents]);

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteEvent(eventId);
      alert("Event deleted successfully!");
      void fetchEvents(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  const handleCreateSuccess = () => {
    void fetchEvents(); // Refresh the list after creating
  };

  const handleEditSuccess = () => {
    void fetchEvents(); // Refresh the list after editing
  };

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
            <CardTitle className="text-3xl">{events.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Upcoming Events</CardDescription>
            <CardTitle className="text-3xl">
              {events.filter(e => e.date && new Date(e.date) > new Date()).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-3xl">
              {events.filter(e => e.status === 'published').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Draft</CardDescription>
            <CardTitle className="text-3xl">
              {events.filter(e => e.status === 'draft').length}
            </CardTitle>
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
          {eventsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-background/60 p-6 text-sm text-muted-foreground text-center">
              No events created yet. Click "Create Event" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Event Image */}
                    {event.imageUrl && (
                      <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0">
                        <img
                          src={event.imageUrl}
                          alt={event.title || "Event"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Event Details */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {event.date ? new Date(event.date).toLocaleDateString() : "No date"}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location || "No location"}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {event.capacity} capacity
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              event.status === 'published'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {event.status || 'draft'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {event.price === 0 ? 'Free' : `$${event.price}`}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Event Modal */}
      <CreateEventForm
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Event Modal */}
      <EditEventForm
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        event={selectedEvent}
        onSuccess={handleEditSuccess}
      />
    </motion.section>
  );
}
