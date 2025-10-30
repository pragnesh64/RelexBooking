import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // TODO: Fetch event data from Amplify
  // const { data: event, loading, error } = useEvent(id);

  const handleBookNow = () => {
    navigate(`/payment/${id}`);
  };

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
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Event ID: {id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Event Image */}
          <div className="aspect-video w-full rounded-lg bg-muted" />

          {/* Event Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Date: TBD</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Location: TBD</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Price: TBD</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground">
            Event description will be displayed here.
          </p>

          {/* Book Button */}
          <Button onClick={handleBookNow} className="w-full" size="lg">
            Book Now
          </Button>
        </CardContent>
      </Card>
    </motion.section>
  );
}
