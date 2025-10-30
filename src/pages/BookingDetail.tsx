import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Ticket, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // TODO: Fetch booking data from Amplify
  // const { data: booking, loading, error } = useBooking(id);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
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
          <CardTitle>Booking Details</CardTitle>
          <CardDescription>Booking ID: {id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-64 h-64 rounded-lg border border-border bg-muted flex items-center justify-center">
              <Ticket className="h-24 w-24 text-muted-foreground" />
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Ticket
            </Button>
          </div>

          {/* Booking Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Event Date: TBD</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Location: TBD</span>
            </div>
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Status: Confirmed</span>
            </div>
          </div>

          {/* Cancel Button */}
          <Button variant="destructive" className="w-full">
            Cancel Booking
          </Button>
        </CardContent>
      </Card>
    </motion.section>
  );
}
