import { useQRCode, useQRCodeDownload } from '@/hooks/useQRCode';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';

interface QRCodeDisplayProps {
  eventId: string;
  userId: string;
  bookingId: string;
  eventTitle?: string;
}

export function QRCodeDisplay({ eventId, userId, bookingId, eventTitle }: QRCodeDisplayProps) {
  const { qrCodeDataUrl, loading, error } = useQRCode(eventId, userId, bookingId);
  const { downloadQRCode } = useQRCodeDownload();

  const handleDownload = () => {
    if (qrCodeDataUrl) {
      const filename = `ticket-${bookingId}`;
      downloadQRCode(qrCodeDataUrl, filename);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Generating QR code...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
        <p className="text-red-800 dark:text-red-400">Failed to generate QR code</p>
      </Card>
    );
  }

  if (!qrCodeDataUrl) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Your Event Ticket</h3>
          {eventTitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{eventTitle}</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <img
            src={qrCodeDataUrl}
            alt="Booking QR Code"
            className="w-64 h-64"
          />
        </div>

        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Show this QR code at the event entrance
          </p>
          <p className="text-xs font-mono text-gray-400 dark:text-gray-600">
            ID: {bookingId.slice(0, 8)}
          </p>
        </div>

        <Button onClick={handleDownload} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download Ticket
        </Button>
      </div>
    </Card>
  );
}
