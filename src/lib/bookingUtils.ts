/**
 * Booking Utilities
 *
 * Provides functions for:
 * - QR code generation for tickets
 * - Secure ticket payload creation (HMAC)
 * - Booking status management
 * - Capacity checks
 * - Audit logging
 */

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

// Booking statuses
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  CHECKED_IN: 'checked_in',
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'payment_pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

/**
 * Generate a secure ticket payload (HMAC-based)
 * Format: bookingId.timestamp.signature
 */
export function generateTicketPayload(bookingId: string): string {
  const timestamp = Date.now().toString();
  const data = `${bookingId}|${timestamp}`;

  // In production, use crypto.subtle or a secure HMAC library
  // For now, use a simple hash (REPLACE IN PRODUCTION)
  const signature = btoa(data).slice(0, 32);

  return btoa(`${bookingId}.${timestamp}.${signature}`);
}

/**
 * Verify ticket payload
 * Returns bookingId if valid, null otherwise
 */
export function verifyTicketPayload(payload: string): string | null {
  try {
    const decoded = atob(payload);
    const [bookingId, timestamp, signature] = decoded.split('.');

    // Verify signature (simplified - use proper HMAC in production)
    const data = `${bookingId}|${timestamp}`;
    const expected = btoa(data).slice(0, 32);

    if (signature !== expected) {
      console.error('Invalid ticket signature');
      return null;
    }

    // Optional: check expiry
    const age = Date.now() - parseInt(timestamp);
    const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year
    if (age > maxAge) {
      console.error('Ticket expired');
      return null;
    }

    return bookingId;
  } catch (error) {
    console.error('Failed to verify ticket payload:', error);
    return null;
  }
}

/**
 * Generate QR code data URL
 * Uses qrcode library
 */
export async function generateQRCode(bookingId: string): Promise<string> {
  try {
    // Dynamic import to avoid SSR issues
    const QRCode = (await import('qrcode')).default;

    const payload = generateTicketPayload(bookingId);
    const qrDataUrl = await QRCode.toDataURL(payload, {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrDataUrl;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw new Error('QR code generation failed');
  }
}

/**
 * Check if event has available capacity
 */
export async function checkEventCapacity(
  eventId: string,
  requestedTickets: number
): Promise<{ available: boolean; remaining: number }> {
  try {
    const { data: event } = await client.models.Event.get({ id: eventId });

    if (!event) {
      throw new Error('Event not found');
    }

    // Type assertion to handle schema fields that may not be in deployed backend yet
    const eventData = event as any;
    const capacity = eventData.capacity || 0;
    // Note: sold field will be available after backend sync
    // For now, calculate remaining based on capacity only
    const sold = eventData.sold || 0;
    const remaining = capacity - sold;

    return {
      available: remaining >= requestedTickets,
      remaining,
    };
  } catch (error) {
    console.error('Failed to check event capacity:', error);
    throw error;
  }
}

/**
 * Create audit log entry
 */
export async function createAuditLog(params: {
  actorID: string;
  actorName?: string;
  actorEmail?: string;
  action: string;
  resourceType: 'Booking' | 'Event' | 'User';
  resourceID: string;
  resourceData?: any;
  metadata?: any;
}) {
  try {
    await client.models.AuditLog.create({
      ...params,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main flow
  }
}

/**
 * Calculate booking total
 */
export function calculateBookingTotal(
  ticketCount: number,
  pricePerTicket: number
): number {
  return ticketCount * pricePerTicket;
}

/**
 * Check if booking can be cancelled
 */
export function canCancelBooking(booking: {
  status: string;
  event?: { date?: string };
}): { allowed: boolean; reason?: string } {
  // Cannot cancel if already cancelled or refunded
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    return { allowed: false, reason: 'Booking is already cancelled' };
  }

  if (booking.status === BOOKING_STATUS.REFUNDED) {
    return { allowed: false, reason: 'Booking is already refunded' };
  }

  // Cannot cancel if already checked in
  if (booking.status === BOOKING_STATUS.CHECKED_IN) {
    return { allowed: false, reason: 'Cannot cancel after check-in' };
  }

  // Check if event has passed
  if (booking.event?.date) {
    const eventDate = new Date(booking.event.date);
    if (eventDate < new Date()) {
      return { allowed: false, reason: 'Event has already passed' };
    }
  }

  return { allowed: true };
}

/**
 * Check if booking can be checked in
 */
export function canCheckInBooking(booking: {
  status: string;
  checkedIn: boolean;
}): { allowed: boolean; reason?: string } {
  if (booking.checkedIn) {
    return { allowed: false, reason: 'Already checked in' };
  }

  if (booking.status !== BOOKING_STATUS.CONFIRMED) {
    return { allowed: false, reason: 'Booking must be confirmed' };
  }

  return { allowed: true };
}

/**
 * Format booking status for display
 */
export function formatBookingStatus(status: string): {
  label: string;
  color: 'default' | 'success' | 'warning' | 'destructive';
} {
  switch (status) {
    case BOOKING_STATUS.CONFIRMED:
      return { label: 'Confirmed', color: 'success' };
    case BOOKING_STATUS.CHECKED_IN:
      return { label: 'Checked In', color: 'success' };
    case BOOKING_STATUS.PENDING:
      return { label: 'Pending', color: 'warning' };
    case BOOKING_STATUS.CANCELLED:
      return { label: 'Cancelled', color: 'destructive' };
    case BOOKING_STATUS.REFUNDED:
      return { label: 'Refunded', color: 'default' };
    default:
      return { label: status, color: 'default' };
  }
}

/**
 * Get booking statistics
 */
export interface BookingStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  checkedIn: number;
  totalRevenue: number;
}

export function calculateBookingStats(bookings: Array<{
  status: string;
  totalAmount?: number | null;
}>): BookingStats {
  return bookings.reduce(
    (stats, booking) => ({
      total: stats.total + 1,
      confirmed: stats.confirmed + (booking.status === BOOKING_STATUS.CONFIRMED ? 1 : 0),
      pending: stats.pending + (booking.status === BOOKING_STATUS.PENDING ? 1 : 0),
      cancelled: stats.cancelled + (booking.status === BOOKING_STATUS.CANCELLED ? 1 : 0),
      checkedIn: stats.checkedIn + (booking.status === BOOKING_STATUS.CHECKED_IN ? 1 : 0),
      totalRevenue: stats.totalRevenue + (booking.totalAmount || 0),
    }),
    {
      total: 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      checkedIn: 0,
      totalRevenue: 0,
    }
  );
}
