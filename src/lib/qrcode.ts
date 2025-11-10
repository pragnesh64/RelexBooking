import QRCode from 'qrcode';
import { generateTicketPayload } from './ticketSecurity';

/**
 * Generate secure QR code with HMAC signature
 *
 * @param eventId - Event identifier
 * @param userId - User identifier (Cognito sub)
 * @param bookingId - Booking identifier
 * @returns Object with QR code data URL and ticket payload
 */
export async function generateBookingQRCode(
  eventId: string,
  userId: string,
  bookingId: string
): Promise<{
  qrCodeDataUrl: string;
  ticketPayload: string;
}> {
  try {
    // Generate secure HMAC-signed payload
    const ticketPayload = await generateTicketPayload(bookingId, eventId, userId);

    // Generate QR code from the secure payload
    const qrCodeDataUrl = await QRCode.toDataURL(ticketPayload, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return {
      qrCodeDataUrl,
      ticketPayload,
    };
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw new Error('QR code generation failed');
  }
}

/**
 * Generate QR code from existing ticket payload
 * (Used when regenerating QR for existing bookings)
 */
export async function generateQRCodeFromPayload(
  ticketPayload: string
): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(ticketPayload, {
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
    console.error('Failed to generate QR code from payload:', error);
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
 * Now uses the secure HMAC validation system
 */
export async function validateBookingQRCode(
  qrData: string,
  booking: {
    id: string;
    eventID: string;
    userID: string;
    status: string;
    checkedIn: boolean | null;
    userName?: string | null;
    userEmail?: string | null;
    ticketCount?: number | null;
    event?: {
      title?: string | null;
    } | null;
  }
): Promise<{
  valid: boolean;
  reason?: string;
  bookingDetails?: {
    id: string;
    userName: string;
    userEmail: string;
    ticketCount: number;
    eventTitle: string;
  };
}> {
  // Import validation from ticketSecurity
  const { validateTicket, parseQRCode } = await import('./ticketSecurity');

  // Parse QR code (supports both secure and legacy formats)
  const parsed = parseQRCode(qrData);

  if (!parsed) {
    return { valid: false, reason: 'Invalid QR code format' };
  }

  // If secure format, use HMAC validation
  if (parsed.type === 'secure') {
    return await validateTicket(qrData, booking);
  }

  // Legacy format validation (backward compatibility)
  const legacy = parsed.legacy!;

  if (legacy.bookingId !== booking.id) {
    return { valid: false, reason: 'Booking ID mismatch' };
  }

  if (legacy.eventId !== booking.eventID) {
    return { valid: false, reason: 'Event ID mismatch' };
  }

  if (legacy.userId !== booking.userID) {
    return { valid: false, reason: 'User ID mismatch' };
  }

  if (booking.status !== 'confirmed' && booking.status !== 'checked_in') {
    return { valid: false, reason: 'Booking not confirmed' };
  }

  if (booking.checkedIn) {
    return { valid: false, reason: 'Already checked in' };
  }

  return {
    valid: true,
    bookingDetails: {
      id: booking.id,
      userName: booking.userName || 'Unknown',
      userEmail: booking.userEmail || '',
      ticketCount: booking.ticketCount || 1,
      eventTitle: booking.event?.title || 'Unknown Event',
    },
  };
}
