import { useState, useEffect, useCallback } from "react";
import { getAmplifyClient } from "@/lib/amplifyClient";
import { useAuth } from "@/hooks/useAuth";
import {
  generateQRCode,
  checkEventCapacity,
  createAuditLog,
  BOOKING_STATUS,
} from "@/lib/bookingUtils";
import type {
  AmplifyBookingModel,
  Booking,
  CreateBookingInput,
  UpdateBookingInput,
} from "@/types/graphql";

const bookingSelection = [
  "id",
  "eventID",
  "userID",
  "userName",
  "userEmail",
  "status",
  "ticketCount",
  "totalAmount",
  "qrCode",
  "checkedIn",
  "checkedInAt",
  "cancelledAt",
  "refundedAt",
  "createdAt",
  "updatedAt",
  "event.id",
  "event.title",
  "event.date",
  "event.location",
  "event.organizerName",
  "event.imageUrl",
  "event.price",
  "event.capacity",
] as const;

type AmplifyBookingWithMaybeEvent = Omit<AmplifyBookingModel, "event"> & {
  event?: unknown;
};

function mapBookingFromModel(model: AmplifyBookingWithMaybeEvent): Booking {
  const rawEvent = model.event as unknown;

  let event: Booking["event"] = null;
  if (rawEvent && typeof rawEvent !== "function") {
    const eventData = rawEvent as {
      id?: string | null;
      title?: string | null;
      date?: string | null;
      location?: string | null;
      organizerName?: string | null;
      imageUrl?: string | null;
    };

    event = {
      id: eventData.id ?? model.eventID,
      title: eventData.title ?? null,
      date: eventData.date ?? null,
      location: eventData.location ?? null,
      organizerName: eventData.organizerName ?? null,
      imageUrl: eventData.imageUrl ?? null,
    };
  }

  return {
    id: model.id,
    eventID: model.eventID,
    userID: model.userID,
    userName: model.userName ?? null,
    userEmail: model.userEmail ?? null,
    status: model.status,
    ticketCount: model.ticketCount ?? null,
    totalAmount: model.totalAmount ?? null,
    qrCode: model.qrCode ?? null,
    checkedIn: model.checkedIn ?? null,
    checkedInAt: model.checkedInAt ?? null,
    cancelledAt: model.cancelledAt ?? null,
    refundedAt: model.refundedAt ?? null,
    createdAt: model.createdAt ?? null,
    updatedAt: model.updatedAt ?? null,
    event,
  };
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const client = getAmplifyClient();
      if (!client) {
        throw new Error("Amplify client not configured");
      }

      const result = await client.models.Booking.list({
        selectionSet: bookingSelection,
      });
      setBookings(result.data.map((item) => mapBookingFromModel(item)));
    } catch (err) {
      const bookingError = err instanceof Error ? err : new Error("Failed to load bookings");
      setError(bookingError);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, error, refetch: fetchBookings };
}

export function useBooking(id: string) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      setError(null);

      try {
        const client = getAmplifyClient();
        if (!client) {
          setError(new Error("Amplify client not configured"));
          setLoading(false);
          return;
        }

        const result = await client.models.Booking.get(
          { id },
          { selectionSet: bookingSelection },
        );
        setBooking(result.data ? mapBookingFromModel(result.data) : null);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load booking"));
        setLoading(false);
      }
    };

    if (id) {
      void fetchBooking();
    }
  }, [id]);

  return { booking, loading, error };
}

export function useCreateBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createBooking = async (input: CreateBookingInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const client = getAmplifyClient();
      if (!client) {
        throw new Error("Amplify client not configured");
      }

      const result = await client.models.Booking.create(input, {
        selectionSet: bookingSelection,
      });
      return result.data ? mapBookingFromModel(result.data) : null;
    } catch (err) {
      const bookingError = err instanceof Error ? err : new Error("Failed to create booking");
      setError(bookingError);
      throw bookingError;
    } finally {
      setLoading(false);
    }
  };

  return { createBooking, loading, error };
}

export function useUpdateBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateBooking = async (input: UpdateBookingInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const client = getAmplifyClient();
      if (!client) {
        throw new Error("Amplify client not configured");
      }

      const result = await client.models.Booking.update(input, {
        selectionSet: bookingSelection,
      });
      return result.data ? mapBookingFromModel(result.data) : null;
    } catch (err) {
      const bookingError = err instanceof Error ? err : new Error("Failed to update booking");
      setError(bookingError);
      throw bookingError;
    } finally {
      setLoading(false);
    }
  };

  return { updateBooking, loading, error };
}

/**
 * Hook for cancelling a booking
 */
export function useCancelBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const cancelBooking = async (bookingId: string, reason?: string) => {
    setLoading(true);
    setError(null);

    try {
      const client = getAmplifyClient();
      if (!client || !user) {
        throw new Error("Not authenticated");
      }

      const result = await client.models.Booking.update({
        id: bookingId,
        status: BOOKING_STATUS.CANCELLED,
        cancelledAt: new Date().toISOString(),
      });

      // Create audit log
      await createAuditLog({
        actorID: user.userId,
        actorName: user.name || undefined,
        actorEmail: user.email || undefined,
        action: 'booking.cancel',
        resourceType: 'Booking',
        resourceID: bookingId,
        metadata: { reason },
      });

      return result.data ? mapBookingFromModel(result.data) : null;
    } catch (err) {
      const bookingError = err instanceof Error ? err : new Error("Failed to cancel booking");
      setError(bookingError);
      throw bookingError;
    } finally {
      setLoading(false);
    }
  };

  return { cancelBooking, loading, error };
}

/**
 * Hook for checking in a booking
 */
export function useCheckInBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const checkInBooking = async (bookingId: string) => {
    setLoading(true);
    setError(null);

    try {
      const client = getAmplifyClient();
      if (!client || !user) {
        throw new Error("Not authenticated");
      }

      const result = await client.models.Booking.update({
        id: bookingId,
        status: BOOKING_STATUS.CHECKED_IN,
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
      });

      // Create audit log
      await createAuditLog({
        actorID: user.userId,
        actorName: user.name || undefined,
        actorEmail: user.email || undefined,
        action: 'booking.checkin',
        resourceType: 'Booking',
        resourceID: bookingId,
      });

      return result.data ? mapBookingFromModel(result.data) : null;
    } catch (err) {
      const bookingError = err instanceof Error ? err : new Error("Failed to check in booking");
      setError(bookingError);
      throw bookingError;
    } finally {
      setLoading(false);
    }
  };

  return { checkInBooking, loading, error };
}

/**
 * Hook for generating ticket (QR code + payload)
 */
export function useGenerateTicket() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateTicket = async (bookingId: string) => {
    setLoading(true);
    setError(null);

    try {
      const client = getAmplifyClient();
      if (!client) {
        throw new Error("Amplify client not configured");
      }

      // Generate QR code
      const qrCode = await generateQRCode(bookingId);

      // Update booking with ticket data
      const result = await client.models.Booking.update({
        id: bookingId,
        qrCode,
      });

      return result.data ? mapBookingFromModel(result.data) : null;
    } catch (err) {
      const bookingError = err instanceof Error ? err : new Error("Failed to generate ticket");
      setError(bookingError);
      throw bookingError;
    } finally {
      setLoading(false);
    }
  };

  return { generateTicket, loading, error };
}

/**
 * Hook for creating a booking with capacity check
 */
export function useCreateBookingWithCapacityCheck() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const createBookingWithCheck = async (input: {
    eventID: string;
    ticketCount: number;
    totalAmount: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const client = getAmplifyClient();
      if (!client || !user) {
        throw new Error("Not authenticated");
      }

      // Check capacity
      const { available, remaining } = await checkEventCapacity(
        input.eventID,
        input.ticketCount
      );

      if (!available) {
        throw new Error(`Only ${remaining} tickets remaining`);
      }

      // Create booking
      const result = await client.models.Booking.create({
        eventID: input.eventID,
        userID: user.userId,
        userName: user.name || "Unknown",
        userEmail: user.email || "Unknown",
        ticketCount: input.ticketCount,
        totalAmount: input.totalAmount,
        status: BOOKING_STATUS.PENDING,
      }, {
        selectionSet: bookingSelection,
      });

      if (!result.data) {
        throw new Error("Failed to create booking");
      }

      // Update event sold count (if sold field exists in backend)
      // Note: sold field will be available after backend sync
      // For now, capacity is managed via booking count
      try {
        const { data: event } = await client.models.Event.get({ id: input.eventID });
        if (event && 'sold' in event) {
          await client.models.Event.update({
            id: input.eventID,
            sold: ((event as any).sold || 0) + input.ticketCount,
          });
        }
      } catch (err) {
        // Ignore if sold field doesn't exist yet
        console.warn('Could not update event sold count:', err);
      }

      // Generate ticket
      const bookingId = result.data.id;
      const qrCode = await generateQRCode(bookingId);

      // Update with ticket data
      const updatedResult = await client.models.Booking.update({
        id: bookingId,
        qrCode,
      });

      // Create audit log
      await createAuditLog({
        actorID: user.userId,
        actorName: user.name || undefined,
        actorEmail: user.email || undefined,
        action: 'booking.create',
        resourceType: 'Booking',
        resourceID: bookingId,
        resourceData: input,
      });

      return updatedResult.data ? mapBookingFromModel(updatedResult.data) : null;
    } catch (err) {
      const bookingError = err instanceof Error ? err : new Error("Failed to create booking");
      setError(bookingError);
      throw bookingError;
    } finally {
      setLoading(false);
    }
  };

  return { createBooking: createBookingWithCheck, loading, error };
}

/**
 * Hook for fetching bookings for an organizer's events
 */
export function useOrganizerBookings(eventId?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchOrganizerBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const client = getAmplifyClient();
      if (!client || !user) {
        throw new Error("Not authenticated");
      }

      let result;
      if (eventId) {
        // Fetch bookings for specific event
        result = await client.models.Booking.list({
          filter: { eventID: { eq: eventId } },
          selectionSet: bookingSelection,
        });
      } else {
        // Fetch all bookings for organizer's events
        // First get organizer's events
        const eventsResult = await client.models.Event.list({
          filter: { organizerID: { eq: user.userId } },
        });

        const eventIds = eventsResult.data.map(e => e.id);

        if (eventIds.length === 0) {
          setBookings([]);
          setLoading(false);
          return;
        }

        // Then fetch bookings for those events
        result = await client.models.Booking.list({
          filter: {
            or: eventIds.map(id => ({ eventID: { eq: id } })),
          },
          selectionSet: bookingSelection,
        });
      }

      setBookings(result.data.map(item => mapBookingFromModel(item)));
    } catch (err) {
      const bookingError = err instanceof Error ? err : new Error("Failed to load organizer bookings");
      setError(bookingError);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [eventId, user]);

  useEffect(() => {
    void fetchOrganizerBookings();
  }, [fetchOrganizerBookings]);

  return { bookings, loading, error, refetch: fetchOrganizerBookings };
}
