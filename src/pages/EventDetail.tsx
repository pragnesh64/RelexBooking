import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, DollarSign, Users, Tag, User, Clock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEvent } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { event, loading, error } = useEvent(id || "");
  const { user } = useAuth();

  const handleBookNow = () => {
    if (!user) {
      alert("Please sign in to book this event");
      navigate("/sign-in");
      return;
    }
    navigate(`/payment/${id}`);
  };

  // Loading state
  if (loading) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[60vh]"
      >
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </motion.section>
    );
  }

  // Error state
  if (error || !event) {
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
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="h-16 w-16 text-destructive" />
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Event Not Found</h2>
              <p className="text-muted-foreground">
                {error?.message || "The event you're looking for doesn't exist or has been removed."}
              </p>
            </div>
            <Button onClick={() => navigate("/events")}>
              Browse All Events
            </Button>
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  // Format date and time
  const eventDate = event.date ? new Date(event.date) : null;
  const formattedDate = eventDate ? eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : "Date not set";
  const formattedTime = eventDate ? eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }) : "Time not set";

  // Check if event is in the past
  const isPastEvent = eventDate && eventDate < new Date();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Image */}
          {event.imageUrl && (
            <Card className="overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title || "Event"}
                className="w-full h-[400px] object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/800x400?text=Event+Image";
                }}
              />
            </Card>
          )}

          {/* Event Details Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-3xl">{event.title}</CardTitle>
                  <CardDescription className="text-base">
                    {event.category && (
                      <Badge variant="secondary" className="mr-2">
                        <Tag className="h-3 w-3 mr-1" />
                        {event.category}
                      </Badge>
                    )}
                    {event.status && (
                      <Badge variant={event.status === 'published' ? 'default' : 'outline'}>
                        {event.status}
                      </Badge>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              {event.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">About This Event</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}

              <Separator />

              {/* Event Information Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Date & Time</p>
                    <p className="text-sm text-muted-foreground">{formattedDate}</p>
                    <p className="text-sm text-muted-foreground">{formattedTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {event.location || "Location not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Price</p>
                    <p className="text-sm text-muted-foreground">
                      {event.price === 0 ? "Free" : `$${event.price?.toFixed(2)}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Capacity</p>
                    <p className="text-sm text-muted-foreground">
                      {event.capacity} attendees
                    </p>
                  </div>
                </div>

                {event.organizerName && (
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <User className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Organized By</p>
                      <p className="text-sm text-muted-foreground">
                        {event.organizerName}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Published Date */}
              {event.publishedAt && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      Published on {new Date(event.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price Display */}
              <div className="text-center py-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Price per ticket</p>
                <p className="text-4xl font-bold">
                  {event.price === 0 ? "Free" : `$${event.price?.toFixed(2)}`}
                </p>
              </div>

              {/* Status Messages */}
              {isPastEvent && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                    This event has already occurred
                  </p>
                </div>
              )}

              {event.status !== 'published' && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                    This event is not yet published
                  </p>
                </div>
              )}

              {/* Book Now Button */}
              <Button
                onClick={handleBookNow}
                className="w-full"
                size="lg"
                disabled={isPastEvent || event.status !== 'published'}
              >
                {isPastEvent ? "Event Ended" : "Book Now"}
              </Button>

              {/* Additional Info */}
              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{event.category || "Uncategorized"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity:</span>
                  <span className="font-medium">{event.capacity} spots</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium capitalize">{event.status || "draft"}</span>
                </div>
              </div>

              {/* Event ID */}
              <Separator />
              <div className="text-xs text-muted-foreground text-center">
                Event ID: {event.id}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.section>
  );
}
