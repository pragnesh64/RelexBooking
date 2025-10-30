import { motion } from "framer-motion";
import { Bell, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function Notifications() {
  // TODO: Fetch notifications from Amplify/Pinpoint
  // const { data: notifications, loading, error } = useNotifications();

  const notifications = [
    {
      id: "1",
      type: "success",
      title: "Booking Confirmed",
      message: "Your booking for Event XYZ has been confirmed.",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      type: "info",
      title: "Event Reminder",
      message: "Your event is coming up in 3 days.",
      timestamp: "5 hours ago",
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <header className="flex items-center gap-2">
        <Bell className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Notifications
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Stay updated with your bookings and events
          </p>
        </div>
      </header>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                No notifications yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="flex items-start gap-4 p-4">
                {getIcon(notification.type)}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {notification.timestamp}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </motion.section>
  );
}
