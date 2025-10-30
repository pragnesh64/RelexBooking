import { motion } from "framer-motion";
import { Ticket, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function Tickets() {
  const navigate = useNavigate();

  // TODO: Fetch confirmed bookings from Amplify
  // const { data: tickets, loading, error } = useTickets();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          My Tickets
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Access your confirmed event tickets
        </p>
      </header>

      {/* Tickets List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Example Ticket Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Event Name</CardTitle>
              <Ticket className="h-5 w-5 text-primary" />
            </div>
            <CardDescription>
              <Calendar className="h-3 w-3 inline mr-1" />
              Event Date
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* QR Code Preview */}
            <div className="w-full aspect-square rounded-lg border border-border bg-muted flex items-center justify-center">
              <Ticket className="h-16 w-16 text-muted-foreground" />
            </div>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/bookings/1")}
            >
              <Download className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="py-12 text-center">
          <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            You don't have any confirmed tickets yet.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/events")}
          >
            Browse Events
          </Button>
        </CardContent>
      </Card>
    </motion.section>
  );
}
