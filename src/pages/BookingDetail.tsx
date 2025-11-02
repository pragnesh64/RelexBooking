import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Ticket, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBooking } from "@/hooks/useBookings";
import { QRCodeDisplay } from "@/components/booking/QRCodeDisplay";

export function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { booking, loading, error } = useBooking(id || "");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardContent className="flex items-center gap-4 py-6">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Failed to load booking
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                {error?.message || "Booking not found"}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      confirmed: "default",
      cancelled: "destructive",
      refunded: "secondary",
    };
    return <Badge variant={variants[status] || "default"}>{status.toUpperCase()}</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Code */}
        {booking.status === "confirmed" && (
          <div>
            <QRCodeDisplay
              eventId={booking.eventID}
              userId={booking.userID}
              bookingId={booking.id}
              eventTitle={booking.event?.title || undefined}
            />
          </div>
        )}

        {/* Booking Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Booking Details</CardTitle>
                  <CardDescription className="mt-1">ID: {id?.slice(0, 8)}</CardDescription>
                </div>
                {getStatusBadge(booking.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Event Info */}
              {booking.event && (
                <div className="pb-4 border-b border-border">
                  <h4 className="font-semibold mb-3">Event Information</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Event:</span> {booking.event.title}
                    </p>
                    {booking.event.date && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{formatDate(booking.event.date)}</span>
                      </div>
                    )}
                    {booking.event.location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{booking.event.location}</span>
                      </div>
                    )}
                    {booking.event.organizerName && (
                      <p className="text-sm">
                        <span className="font-medium">Organizer:</span>{" "}
                        {booking.event.organizerName}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Ticket Info */}
              <div className="pb-4 border-b border-border">
                <h4 className="font-semibold mb-3">Ticket Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Quantity: {booking.ticketCount || 1} ticket(s)
                    </span>
                  </div>
                  {booking.totalAmount && (
                    <p className="text-sm">
                      <span className="font-medium">Total:</span> ${booking.totalAmount.toFixed(2)}
                    </p>
                  )}
                  {booking.checkedIn && (
                    <Badge variant="default" className="bg-green-600">
                      Checked In
                    </Badge>
                  )}
                  {booking.checkedInAt && (
                    <p className="text-xs text-muted-foreground">
                      Checked in: {formatDate(booking.checkedInAt)}
                    </p>
                  )}
                </div>
              </div>

              {/* Booking Meta */}
              <div>
                <h4 className="font-semibold mb-3">Booking Information</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Name:</span> {booking.userName || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {booking.userEmail || "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Booked: {formatDate(booking.createdAt || null)}
                  </p>
                  {booking.cancelledAt && (
                    <p className="text-xs text-muted-foreground">
                      Cancelled: {formatDate(booking.cancelledAt)}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              {booking.status === "confirmed" && !booking.checkedIn && (
                <Button variant="destructive" className="w-full" disabled>
                  Cancel Booking
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.section>
  );
}
