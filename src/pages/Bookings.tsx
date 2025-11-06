import { Calendar, MapPin, Ticket, Download, X, CheckCircle2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBookings, useCancelBooking } from "@/hooks/useBookings";
import { formatBookingStatus, canCancelBooking } from "@/lib/bookingUtils";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function Bookings() {
  const navigate = useNavigate();
  const { bookings, loading, error, refetch } = useBookings();
  const { cancelBooking } = useCancelBooking();
  const [activeTab, setActiveTab] = useState("active");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Filter bookings by tab
  const filteredBookings = bookings.filter((booking) => {
    const now = new Date();
    const eventDate = booking.event?.date ? new Date(booking.event.date) : null;
    
    if (activeTab === "active") {
      return booking.status === "confirmed" && eventDate && eventDate > now;
    } else if (activeTab === "past") {
      return booking.status === "confirmed" && eventDate && eventDate <= now;
    } else if (activeTab === "cancelled") {
      return booking.status === "cancelled";
    }
    return true; // all
  });

  const handleCancelBooking = async (bookingId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const { allowed, reason } = canCancelBooking({
      status: booking.status,
      event: booking.event ? {
        date: booking.event.date ?? undefined,
      } : undefined,
    });
    if (!allowed) {
      alert(`Cannot cancel: ${reason}`);
      return;
    }

    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId, "Cancelled by user");
      alert("Booking cancelled successfully!");
      await refetch();
    } catch (error) {
      alert(`Cancellation failed: ${error instanceof Error ? error.message : "Failed to cancel booking"}`);
    } finally {
      setCancellingId(null);
    }
  };

  const handleDownloadTicket = (booking: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // For now, just navigate to booking detail where QR is shown
    navigate(`/bookings/${booking.id}`);
  };

  const getStatusBadge = (status: string) => {
    const { label, color } = formatBookingStatus(status);
    return <Badge variant={color}>{label}</Badge>;
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Bookings
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            View and manage your event bookings
          </p>
        </div>
      </header>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-destructive">Error loading bookings</p>
          </CardContent>
        </Card>
      ) : filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              {activeTab === "active"
                ? "You don't have any active bookings."
                : activeTab === "past"
                ? "No past events found."
                : activeTab === "cancelled"
                ? "No cancelled bookings."
                : "You don't have any bookings yet."}
            </p>
            {activeTab === "all" && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/events")}
              >
                Browse Events
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card
              key={booking.id}
              className="cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() => navigate(`/bookings/${booking.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="line-clamp-2 mb-2">
                      {booking.event?.title || "Event Name"}
                    </CardTitle>
                    <CardDescription className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span className="text-xs">
                          {booking.event?.date
                            ? new Date(booking.event.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Date TBD"}
                        </span>
                      </div>
                      {booking.event?.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="text-xs line-clamp-1">
                            {booking.event.location}
                          </span>
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Booking Info */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Booking ID: {booking.id.slice(0, 8).toUpperCase()}
                    </span>
                    <div className="flex items-center gap-3">
                      {booking.ticketCount && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{booking.ticketCount} {booking.ticketCount === 1 ? 'ticket' : 'tickets'}</span>
                        </div>
                      )}
                      {booking.totalAmount != null && (
                        <span className="font-semibold">
                          ${booking.totalAmount.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Check-in Status */}
                  {booking.checkedIn && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Checked in {booking.checkedInAt ? `on ${new Date(booking.checkedInAt).toLocaleDateString()}` : ''}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/bookings/${booking.id}`)}
                    >
                      View Details
                    </Button>
                    <div className="flex gap-2">
                      {booking.status === "confirmed" && booking.qrCode && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleDownloadTicket(booking, e)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Ticket
                        </Button>
                      )}
                      {canCancelBooking({
                        status: booking.status,
                        event: booking.event ? {
                          date: booking.event.date ?? undefined,
                        } : undefined,
                      }).allowed && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={cancellingId === booking.id}
                          onClick={(e) => handleCancelBooking(booking.id, e)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}