import { Calendar, MapPin, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBookings } from "@/hooks/useBookings";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function Bookings() {
  const navigate = useNavigate();
  const { bookings, loading, error } = useBookings();
  const [activeTab, setActiveTab] = useState("active");

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="success">Confirmed</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Booking ID: {booking.id.slice(0, 8).toUpperCase()}
                  </span>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}