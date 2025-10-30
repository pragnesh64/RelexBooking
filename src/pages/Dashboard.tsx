import { Calendar, BookOpen, Ticket, TrendingUp, ArrowRight, Plus, Sparkles, Clock, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBookings } from "@/hooks/useBookings";
import { useEvents } from "@/hooks/useEvents";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export function Dashboard() {
  const navigate = useNavigate();
  const { bookings, loading: bookingsLoading } = useBookings();
  const { events, loading: eventsLoading } = useEvents();

  const isLoading = bookingsLoading || eventsLoading;
  
  // Calculate stats
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
  const recentBookings = bookings.slice(0, 5);
  
  // Get upcoming bookings with countdown
  const upcomingBookings = bookings
    .filter(b => b.status === "confirmed" && b.event?.date && new Date(b.event.date) > new Date())
    .slice(0, 3);
  
  // Get recommended events (upcoming events, exclude already booked)
  const bookedEventIds = bookings.map(b => b.event?.id).filter(Boolean);
  const recommendedEvents = events
    .filter(e => new Date(e.date) > new Date() && !bookedEventIds.includes(e.id))
    .slice(0, 3);
  
  // Countdown timer component
  const CountdownTimer = ({ date }: { date: string }) => {
    const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
      const updateTimer = () => {
        const now = new Date().getTime();
        const eventDate = new Date(date).getTime();
        const distance = eventDate - now;
        
        if (distance < 0) {
          setTimeLeft("Event started");
      return;
    }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m`);
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 60000); // Update every minute
      return () => clearInterval(interval);
    }, [date]);
    
    return <span className="text-xs font-medium text-muted-foreground">{timeLeft}</span>;
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <section className="space-y-4">
      {/* Hero Section with Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">
            {getGreeting()}! 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Here's an overview of your events and bookings.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/events")} size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Browse Events
          </Button>
          <Button onClick={() => navigate("/organizer")} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium uppercase">
                Total Bookings
              </CardDescription>
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mt-2">
              {isLoading ? (
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              ) : (
                totalBookings
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium uppercase">
                Confirmed Tickets
              </CardDescription>
              <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Ticket className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mt-2">
              {isLoading ? (
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              ) : (
                confirmedBookings
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Ready to use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium uppercase">
                Upcoming Events
              </CardDescription>
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mt-2">
              {isLoading ? (
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              ) : (
                upcomingEvents
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Available now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium uppercase">
                Total Events
              </CardDescription>
              <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mt-2">
              {isLoading ? (
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              ) : (
                events.length
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Published</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-0.5">
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
            <CardDescription className="text-xs">Your latest event bookings</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/bookings")}
          >
            View All
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading bookings...</p>
              </div>
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="py-12 text-center">
              <div className="h-14 w-14 rounded-lg bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                You don't have any bookings yet.
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Browse events to get started
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/events")}
                size="sm"
              >
                Browse Events
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/bookings/${booking.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Ticket className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {booking.event?.title || "Event Name"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.event?.date
                          ? new Date(booking.event.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Date TBD"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-semibold capitalize ${
                        booking.status === "confirmed"
                          ? "bg-green-500/10 text-green-500"
                          : booking.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {booking.status}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Bookings with Countdown */}
      {upcomingBookings.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-0.5">
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
              <CardDescription className="text-xs">Your confirmed bookings</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/bookings")}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/bookings/${booking.id}`)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {booking.event?.title || "Event Name"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {booking.event?.date && (
                          <CountdownTimer date={booking.event.date} />
                        )}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Events */}
      {recommendedEvents.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-0.5">
              <CardTitle className="text-lg">Recommended Events</CardTitle>
              <CardDescription className="text-xs">Discover events you might like</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/events")}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedEvents.map((event) => (
                <Card
                  key={event.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="aspect-video w-full rounded-lg bg-muted mb-3" />
                    <CardTitle className="text-base line-clamp-2">{event.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-1 mt-1">
                      {event.location || "Location TBD"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {event.date
                            ? new Date(event.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "TBD"}
                        </span>
                      </div>
                      <Badge variant={event.price === 0 ? "success" : "default"}>
                        {event.price === 0 ? "Free" : `$${event.price}`}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate("/events")}
        >
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <CardTitle className="text-base">Browse Events</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Discover upcoming events and book your tickets
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate("/organizer")}
        >
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">Create Event</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Start organizing and manage your own events
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate("/tickets")}
        >
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <QrCode className="h-5 w-5 text-green-500" />
              </div>
              <CardTitle className="text-base">Scan Ticket</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Scan QR code to access your tickets
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}