import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { QRScanner } from "@/components/booking/QRScanner";
import { StatsBar } from "@/components/booking/StatsBar";
import { ManualCheckIn, type ManualCheckInData } from "@/components/booking/ManualCheckIn";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAmplifyClient } from "@/lib/amplifyClient";
import type { Event, Booking } from "@/types/graphql";

export function ScanTicket() {
  const { user, loading, isOrganizer, isAdmin, isSuperAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [scanStats, setScanStats] = useState({ total: 0, checkedIn: 0 });
  const [manualCheckInLoading, setManualCheckInLoading] = useState(false);

  // CRITICAL SECURITY: Defense-in-depth permission check
  useEffect(() => {
    if (!loading && user && !isOrganizer && !isAdmin && !isSuperAdmin) {
      console.warn('[SECURITY] Unauthorized access attempt to ScanTicket page:', {
        userId: user.userId,
        email: user.email,
        groups: user.groups,
        timestamp: new Date().toISOString(),
      });
    }
  }, [loading, user, isOrganizer, isAdmin, isSuperAdmin]);

  // Load user's events and stats
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;

      try {
        const client = getAmplifyClient();
        if (!client) return;

        // Fetch events for organizer or all events for admin
        const { data: eventsData } = await client.models.Event.list({
          filter: isAdmin || isSuperAdmin ? undefined : { organizerID: { eq: user.userId } },
        });

        const eventsList = (eventsData as unknown as Event[]) || [];

        // Only show published or ongoing events
        const activeEvents = eventsList.filter(
          (e) => e.status === 'published' || e.status === 'completed'
        );

        setEvents(activeEvents);

        // Auto-select first event
        if (activeEvents.length > 0) {
          setSelectedEvent(activeEvents[0]);
          await fetchEventStats(activeEvents[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    if (user) {
      void fetchEvents();
    }
  }, [user, isAdmin, isSuperAdmin]);

  // Fetch stats for selected event
  const fetchEventStats = async (eventId: string) => {
    try {
      const client = getAmplifyClient();
      if (!client) return;

      const { data: bookings } = await client.models.Booking.list({
        filter: { eventID: { eq: eventId } },
      });

      const total = bookings?.length || 0;
      const checkedIn = bookings?.filter((b) => b.checkedIn === true).length || 0;

      setScanStats({ total, checkedIn });
    } catch (error) {
      console.error('Failed to fetch event stats:', error);
    }
  };

  // Handle successful scan
  const handleScanSuccess = async () => {
    // Refresh stats
    if (selectedEvent) {
      await fetchEventStats(selectedEvent.id);
    }
  };

  // Handle manual check-in
  const handleManualCheckIn = async (data: ManualCheckInData) => {
    setManualCheckInLoading(true);

    try {
      const client = getAmplifyClient();
      if (!client) throw new Error('Amplify client not configured');

      // Find booking by ID, email, or name
      let booking: Booking | null = null;

      if (data.bookingId) {
        const result = await client.models.Booking.get({ id: data.bookingId });
        booking = result.data as unknown as Booking;
      } else if (data.userEmail) {
        const { data: bookings } = await client.models.Booking.list({
          filter: {
            userEmail: { eq: data.userEmail },
            eventID: selectedEvent ? { eq: selectedEvent.id } : undefined,
          },
        });
        booking = (bookings?.[0] as unknown as Booking) || null;
      } else if (data.userName) {
        const { data: bookings } = await client.models.Booking.list({
          filter: {
            userName: { contains: data.userName },
            eventID: selectedEvent ? { eq: selectedEvent.id } : undefined,
          },
        });
        booking = (bookings?.[0] as unknown as Booking) || null;
      }

      if (!booking) {
        throw new Error('No booking found matching your search');
      }

      if (booking.checkedIn) {
        throw new Error('This booking is already checked in');
      }

      if (booking.status !== 'confirmed') {
        throw new Error(`Cannot check in - booking status is ${booking.status}`);
      }

      // Update booking
      const checkedInBy = user?.userId || 'unknown';
      const checkedInByName = user?.name || user?.email || 'Staff';

      await client.models.Booking.update({
        id: booking.id,
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
        checkedInBy,
        checkedInByName,
        status: 'checked_in',
      });

      alert(`Successfully checked in ${booking.userName}`);

      // Refresh stats
      if (selectedEvent) {
        await fetchEventStats(selectedEvent.id);
      }
    } catch (error) {
      console.error('Manual check-in failed:', error);
      throw error;
    } finally {
      setManualCheckInLoading(false);
    }
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

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">🎟️ Event Ticket Scanner</h1>
        <p className="text-muted-foreground">
          Scan attendee QR codes or manually check in attendees for your events
        </p>
      </div>

      {/* Security Notice */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="flex items-start gap-4 py-6">
          <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Organizer/Admin Access
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              This scanner validates tickets using HMAC cryptographic signatures.
              Each ticket can only be checked in once. All check-ins are logged with your user ID.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Event Selector */}
      {loadingEvents ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="flex items-start gap-4 py-6">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                No Events Available
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                You don't have any published events yet. Create and publish an event to use the scanner.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Event Selection Dropdown */}
          {events.length > 1 && (
            <div className="flex items-center gap-3">
              <label className="font-medium text-sm">Select Event:</label>
              <select
                value={selectedEvent?.id || ''}
                onChange={(e) => {
                  const event = events.find((ev) => ev.id === e.target.value);
                  if (event) {
                    setSelectedEvent(event);
                    void fetchEventStats(event.id);
                  }
                }}
                className="flex-1 max-w-md px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} - {new Date(event.date || '').toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Stats Bar */}
          {selectedEvent && (
            <StatsBar
              eventTitle={selectedEvent.title || 'Unknown Event'}
              totalCapacity={selectedEvent.capacity || scanStats.total}
              checkedInCount={scanStats.checkedIn}
              eventDate={selectedEvent.date || undefined}
            />
          )}

          {/* Main Scanner */}
          <QRScanner
            eventId={selectedEvent?.id}
            onSuccessCallback={handleScanSuccess}
            showFullscreenButton={true}
            showCameraSwitchButton={true}
          />

          {/* Manual Check-In */}
          <ManualCheckIn
            onSubmit={handleManualCheckIn}
            eventId={selectedEvent?.id}
            loading={manualCheckInLoading}
          />
        </>
      )}
    </motion.section>
  );
}
