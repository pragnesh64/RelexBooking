import { motion } from "framer-motion";
import { QRScanner } from "@/components/booking/QRScanner";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export function ScanTicket() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold mb-2">Ticket Scanner</h1>
        <p className="text-muted-foreground">
          Scan attendee tickets to check them in to your event
        </p>
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="flex items-start gap-4 py-6">
          <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Organizer Access
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              This tool is restricted to event organizers and administrators. Scan valid
              event tickets to check in attendees. Each ticket can only be checked in once.
            </p>
          </div>
        </CardContent>
      </Card>

      <QRScanner />
    </motion.section>
  );
}
