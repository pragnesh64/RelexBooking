import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEvent } from "@/hooks/useEvents";
import { useCreateBooking } from "@/hooks/useBookings";
import { generateBookingQRCode } from "@/lib/qrcode";

export function Payment() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { event, loading: eventLoading } = useEvent(eventId || "");
  const { createBooking } = useCreateBooking();

  const [ticketCount, setTicketCount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId || !user) {
      navigate("/events");
    }
  }, [eventId, user, navigate]);

  const calculateTotal = () => {
    const basePrice = event?.price || 0;
    const serviceFee = basePrice * 0.1; // 10% service fee
    return {
      basePrice: basePrice * ticketCount,
      serviceFee: serviceFee * ticketCount,
      total: (basePrice + serviceFee) * ticketCount,
    };
  };

  const handlePayment = async () => {
    if (!eventId || !user || !event) {
      setError("Missing required information");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Process payment via Stripe or payment gateway
      // For now, simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create booking in database
      const { total } = calculateTotal();
      const booking = await createBooking({
        eventID: eventId,
        userID: user.userId,
        userName: user.name || user.username,
        userEmail: user.email || "",
        status: "confirmed",
        ticketCount,
        totalAmount: total,
        checkedIn: false,
      });

      if (!booking) {
        throw new Error("Failed to create booking");
      }

      // Generate QR code with HMAC security
      // Note: In a production system, you would:
      // 1. Upload the QR code image to S3 and get a permanent URL
      // 2. Store both the S3 URL and the signed ticketPayload in the booking
      // For now, we skip the update step as the booking hook should handle this
      await generateBookingQRCode(eventId, user.userId, booking.id);

      setIsSuccess(true);

      setTimeout(() => {
        navigate(`/bookings/${booking.id}`);
      }, 3000);
    } catch (err) {
      console.error("Payment failed:", err);
      setError(err instanceof Error ? err.message : "Payment processing failed");
      setIsProcessing(false);
    }
  };

  if (eventLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardContent className="flex items-center gap-4 py-6">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Event not found</h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                The event you're trying to book doesn't exist.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  if (isSuccess) {
    return (
      <motion.section
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-[60vh]"
      >
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold text-foreground">Payment Successful!</h2>
            <p className="text-sm text-muted-foreground text-center">
              Your booking has been confirmed. Your ticket QR code is ready!
            </p>
            <p className="text-xs text-gray-500">Redirecting to your ticket...</p>
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  const pricing = calculateTotal();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
          <CardDescription>Complete your booking for {event.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold">{event.title}</h4>
            {event.date && (
              <p className="text-sm text-muted-foreground">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
            {event.location && (
              <p className="text-sm text-muted-foreground">{event.location}</p>
            )}
          </div>

          {/* Ticket Quantity */}
          <div>
            <label className="text-sm font-medium mb-2 block">Number of Tickets</label>
            <Input
              type="number"
              min="1"
              max={event.capacity || 10}
              value={ticketCount}
              onChange={(e) => setTicketCount(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Card Number</label>
              <Input placeholder="1234 5678 9012 3456" type="text" disabled={isProcessing} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Expiry Date</label>
                <Input placeholder="MM/YY" type="text" disabled={isProcessing} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">CVV</label>
                <Input placeholder="123" type="text" disabled={isProcessing} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Cardholder Name</label>
              <Input
                placeholder="John Doe"
                type="text"
                defaultValue={user?.name}
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Payment Summary */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Event Price ({ticketCount} ticket{ticketCount > 1 ? "s" : ""})
              </span>
              <span className="font-medium">${pricing.basePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service Fee (10%)</span>
              <span className="font-medium">${pricing.serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span>Total</span>
              <span>${pricing.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Pay Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay ${pricing.total.toFixed(2)}
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            This is a demo payment. No actual charges will be made.
          </p>
        </CardContent>
      </Card>
    </motion.section>
  );
}
