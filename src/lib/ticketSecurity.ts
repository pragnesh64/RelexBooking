/**
 * Professional QR Ticket Security System with HMAC
 *
 * This module provides cryptographic signing and verification for event tickets
 * to prevent tampering, forgery, and unauthorized access.
 *
 * Security Features:
 * - HMAC-SHA256 signing to prevent QR code tampering
 * - Timestamp-based expiration validation
 * - Event-specific validation
 * - Check-in status tracking
 * - Secure payload encoding
 */

/**
 * Ticket payload structure
 */
export interface TicketPayload {
  bid: string;      // Booking ID
  eid: string;      // Event ID
  uid: string;      // User ID
  ts: number;       // Timestamp (milliseconds since epoch)
  sig: string;      // HMAC signature
}

/**
 * Validation result with detailed feedback
 */
export interface ValidationResult {
  valid: boolean;
  reason?: string;
  payload?: TicketPayload;
  bookingDetails?: {
    id: string;
    userName: string;
    userEmail: string;
    ticketCount: number;
    eventTitle: string;
    checkedInAt?: string;
  };
}

/**
 * Secret key for HMAC signing
 *
 * IMPORTANT: In production, this should be:
 * 1. Stored in AWS Secrets Manager or Systems Manager Parameter Store
 * 2. Rotated regularly (e.g., every 90 days)
 * 3. Never committed to version control
 * 4. Different for each environment (dev/staging/prod)
 *
 * For now, using a placeholder. Replace with environment variable:
 * const SECRET_KEY = process.env.VITE_TICKET_SECRET_KEY || 'fallback-dev-key';
 */
const SECRET_KEY = import.meta.env.VITE_TICKET_SECRET_KEY || 'relexbooking-ticket-hmac-secret-2025-change-in-production';

/**
 * Generate HMAC signature for ticket payload
 */
async function generateHMAC(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SECRET_KEY);
  const messageData = encoder.encode(data);

  // Import the secret key for HMAC
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Sign the message
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Verify HMAC signature
 */
async function verifyHMAC(data: string, signature: string): Promise<boolean> {
  const computedSignature = await generateHMAC(data);
  return computedSignature === signature;
}

/**
 * Generate secure ticket payload for a booking
 *
 * @param bookingId - Unique booking identifier
 * @param eventId - Event identifier
 * @param userId - User identifier (Cognito sub)
 * @returns Signed ticket payload as JSON string
 */
export async function generateTicketPayload(
  bookingId: string,
  eventId: string,
  userId: string
): Promise<string> {
  const timestamp = Date.now();

  // Create payload without signature
  const payloadData = `${bookingId}|${eventId}|${userId}|${timestamp}`;

  // Generate HMAC signature
  const signature = await generateHMAC(payloadData);

  // Create complete payload
  const payload: TicketPayload = {
    bid: bookingId,
    eid: eventId,
    uid: userId,
    ts: timestamp,
    sig: signature,
  };

  // Return as JSON string for storage
  return JSON.stringify(payload);
}

/**
 * Verify ticket payload signature
 *
 * @param payloadString - JSON string of ticket payload
 * @returns True if signature is valid, false otherwise
 */
export async function verifyTicketPayload(payloadString: string): Promise<{
  valid: boolean;
  payload?: TicketPayload;
  reason?: string;
}> {
  try {
    // Parse payload
    const payload: TicketPayload = JSON.parse(payloadString);

    // Validate structure
    if (!payload.bid || !payload.eid || !payload.uid || !payload.ts || !payload.sig) {
      return { valid: false, reason: 'Invalid payload structure' };
    }

    // Reconstruct data string
    const payloadData = `${payload.bid}|${payload.eid}|${payload.uid}|${payload.ts}`;

    // Verify signature
    const isValidSignature = await verifyHMAC(payloadData, payload.sig);

    if (!isValidSignature) {
      return { valid: false, reason: 'Invalid signature - ticket may be tampered' };
    }

    // Optional: Check if ticket is too old (e.g., 30 days)
    const MAX_TICKET_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
    const age = Date.now() - payload.ts;
    if (age > MAX_TICKET_AGE_MS) {
      return { valid: false, reason: 'Ticket expired - too old' };
    }

    return { valid: true, payload };
  } catch (error) {
    console.error('Failed to verify ticket payload:', error);
    return { valid: false, reason: 'Malformed ticket payload' };
  }
}

/**
 * Validate complete ticket against booking record
 *
 * @param payloadString - Ticket payload from QR code
 * @param booking - Booking record from database
 * @returns Validation result with reason if invalid
 */
export async function validateTicket(
  payloadString: string,
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
): Promise<ValidationResult> {
  // Step 1: Verify cryptographic signature
  const verification = await verifyTicketPayload(payloadString);

  if (!verification.valid) {
    return {
      valid: false,
      reason: verification.reason || 'Invalid ticket signature',
    };
  }

  const payload = verification.payload!;

  // Step 2: Validate booking ID match
  if (payload.bid !== booking.id) {
    return {
      valid: false,
      reason: 'Booking ID mismatch - ticket does not match this booking',
    };
  }

  // Step 3: Validate event ID match
  if (payload.eid !== booking.eventID) {
    return {
      valid: false,
      reason: 'Event ID mismatch - ticket is for a different event',
    };
  }

  // Step 4: Validate user ID match
  if (payload.uid !== booking.userID) {
    return {
      valid: false,
      reason: 'User ID mismatch - ticket belongs to a different user',
    };
  }

  // Step 5: Check booking status
  if (booking.status !== 'confirmed' && booking.status !== 'checked_in') {
    return {
      valid: false,
      reason: `Booking not valid - status is ${booking.status}`,
    };
  }

  // Step 6: Check if already checked in
  if (booking.checkedIn === true) {
    return {
      valid: false,
      reason: 'Already checked in - ticket has been used',
    };
  }

  // All checks passed - ticket is valid
  return {
    valid: true,
    payload,
    bookingDetails: {
      id: booking.id,
      userName: booking.userName || 'Unknown',
      userEmail: booking.userEmail || '',
      ticketCount: booking.ticketCount || 1,
      eventTitle: booking.event?.title || 'Unknown Event',
    },
  };
}

/**
 * Parse QR code data (backward compatible)
 *
 * Supports both:
 * 1. New format: JSON payload with signature
 * 2. Legacy format: EVENTID-USERID-BOOKINGID-TIMESTAMP
 */
export function parseQRCode(qrData: string): {
  type: 'secure' | 'legacy';
  payload?: TicketPayload;
  legacy?: {
    eventId: string;
    userId: string;
    bookingId: string;
    timestamp: number;
  };
} | null {
  try {
    // Try parsing as JSON (new format)
    const payload: TicketPayload = JSON.parse(qrData);
    if (payload.bid && payload.eid && payload.sig) {
      return { type: 'secure', payload };
    }
  } catch {
    // Not JSON, try legacy format
    const parts = qrData.split('-');
    if (parts.length === 4) {
      return {
        type: 'legacy',
        legacy: {
          eventId: parts[0],
          userId: parts[1],
          bookingId: parts[2],
          timestamp: parseInt(parts[3], 10),
        },
      };
    }
  }

  return null;
}

/**
 * Security audit: Log ticket validation attempts
 *
 * This can be used to create an audit trail for security monitoring
 */
export function createAuditLog(
  action: 'scan' | 'validate' | 'checkin',
  result: 'success' | 'failure',
  details: {
    bookingId?: string;
    eventId?: string;
    userId?: string;
    scannerId: string; // Organizer/Admin who scanned
    reason?: string;
  }
): {
  timestamp: string;
  action: string;
  result: string;
  details: typeof details;
} {
  return {
    timestamp: new Date().toISOString(),
    action,
    result,
    details,
  };
}
