import { useState, useEffect } from 'react';
import { generateBookingQRCode } from '@/lib/qrcode';

/**
 * Hook to generate and manage QR code for a booking
 * Returns both the QR code image and the secure ticket payload
 */
export function useQRCode(eventId: string, userId: string, bookingId: string) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [ticketPayload, setTicketPayload] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (!eventId || !userId || !bookingId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // New secure system returns both QR image and signed payload
        const result = await generateBookingQRCode(eventId, userId, bookingId);
        setQrCodeDataUrl(result.qrCodeDataUrl);
        setTicketPayload(result.ticketPayload);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to generate QR code'));
        setQrCodeDataUrl(null);
        setTicketPayload(null);
      } finally {
        setLoading(false);
      }
    };

    void generateQR();
  }, [eventId, userId, bookingId]);

  return { qrCodeDataUrl, ticketPayload, loading, error };
}

/**
 * Hook to download QR code as image
 */
export function useQRCodeDownload() {
  const downloadQRCode = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { downloadQRCode };
}
