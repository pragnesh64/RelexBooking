import { useState, useEffect, useCallback } from "react";
import { getAmplifyClient } from "@/lib/amplifyClient";
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
