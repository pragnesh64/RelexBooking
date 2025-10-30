import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function Payment() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    // TODO: Process payment via Stripe or payment gateway
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      // TODO: Create booking in Amplify
      // await createBooking({ eventID: eventId, userID: userId });
      
      setTimeout(() => {
        navigate("/bookings");
      }, 2000);
    }, 2000);
  };

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
            <h2 className="text-2xl font-bold text-foreground">
              Payment Successful!
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              Your booking has been confirmed. Redirecting to your bookings...
            </p>
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
          <CardDescription>Complete your booking for Event ID: {eventId}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Card Number
              </label>
              <Input placeholder="1234 5678 9012 3456" type="text" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Expiry Date
                </label>
                <Input placeholder="MM/YY" type="text" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">CVV</label>
                <Input placeholder="123" type="text" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Cardholder Name
              </label>
              <Input placeholder="John Doe" type="text" />
            </div>
          </div>

          {/* Payment Summary */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Event Price</span>
              <span className="font-medium">$0.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service Fee</span>
              <span className="font-medium">$0.00</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span>Total</span>
              <span>$0.00</span>
            </div>
          </div>

          {/* Pay Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {isProcessing ? "Processing..." : "Pay Now"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            This is a demo payment. No actual charges will be made.
          </p>
        </CardContent>
      </Card>
    </motion.section>
  );
}
