import QRCode from 'qrcode';

/**
 * Generate QR code data URL from booking information
 * Format: EVENTID-USERID-BOOKINGID-TIMESTAMP
 */
export async function generateBookingQRCode(
  eventId: string,
  userId: string,
  bookingId: string
): Promise<string> {
  const timestamp = Date.now();
  const qrData = `${eventId}-${userId}-${bookingId}-${timestamp}`;

  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw new Error('QR code generation failed');
  }
}

/**
 * Parse QR code data back into components
 */
export function parseBookingQRCode(qrData: string): {
  eventId: string;
  userId: string;
  bookingId: string;
  timestamp: number;
} | null {
  try {
    const parts = qrData.split('-');
    if (parts.length !== 4) {
      return null;
    }

    return {
      eventId: parts[0],
      userId: parts[1],
      bookingId: parts[2],
      timestamp: parseInt(parts[3], 10),
    };
  } catch (error) {
    console.error('Failed to parse QR code:', error);
    return null;
  }
}

/**
 * Validate booking QR code against database booking
 */
export function validateBookingQRCode(
  qrData: string,
  booking: {
    id: string;
    eventID: string;
    userID: string;
    status: string;
    checkedIn: boolean | null;
  }
): {
  valid: boolean;
  reason?: string;
} {
  const parsed = parseBookingQRCode(qrData);

  if (!parsed) {
    return { valid: false, reason: 'Invalid QR code format' };
  }

  if (parsed.bookingId !== booking.id) {
    return { valid: false, reason: 'Booking ID mismatch' };
  }

  if (parsed.eventId !== booking.eventID) {
    return { valid: false, reason: 'Event ID mismatch' };
  }

  if (parsed.userId !== booking.userID) {
    return { valid: false, reason: 'User ID mismatch' };
  }

  if (booking.status !== 'confirmed') {
    return { valid: false, reason: 'Booking not confirmed' };
  }

  if (booking.checkedIn) {
    return { valid: false, reason: 'Already checked in' };
  }

  return { valid: true };
}
