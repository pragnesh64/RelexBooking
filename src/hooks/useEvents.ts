import { useState, useEffect, useCallback } from "react";
import { getAmplifyClient } from "@/lib/amplifyClient";
import type {
  AmplifyEventModel,
  Event,
  CreateEventInput,
  UpdateEventInput,
} from "@/types/graphql";

const eventSelection = [
  "id",
  "title",
  "description",
  "date",
  "location",
  "price",
  "capacity",
  "imageUrl",
  "category",
  "organizerID",
  "organizerName",
  "status",
  "publishedAt",
  "createdAt",
  "updatedAt",
] as const;

type EventSelectionModel = Pick<
  AmplifyEventModel,
  | "id"
  | "title"
  | "description"
  | "date"
  | "location"
  | "price"
  | "capacity"
  | "imageUrl"
  | "category"
  | "organizerID"
  | "organizerName"
  | "status"
  | "publishedAt"
  | "createdAt"
  | "updatedAt"
> & { bookings?: unknown };

function mapEventFromModel(model: EventSelectionModel): Event {
  return {
    id: model.id,
    title: model.title ?? null,
    description: model.description ?? null,
    date: model.date ?? null,
    location: model.location ?? null,
    price: model.price ?? null,
    capacity: model.capacity ?? null,
    imageUrl: model.imageUrl ?? null,
    category: model.category ?? null,
    organizerID: model.organizerID,
    organizerName: model.organizerName ?? null,
    status: model.status ?? null,
    publishedAt: model.publishedAt ?? null,
    createdAt: model.createdAt ?? null,
    updatedAt: model.updatedAt ?? null,
  };
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const client = getAmplifyClient();
      if (!client) {
        throw new Error("Amplify client not configured");
      }

      const result = await client.models.Event.list({
        selectionSet: eventSelection,
      });
      setEvents(result.data.map((item) => mapEventFromModel(item)));
    } catch (err) {
      const eventError = err instanceof Error ? err : new Error("Failed to load events");
      setError(eventError);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}

export function useEvent(id: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);

      try {
        const client = getAmplifyClient();
        if (!client) {
          setError(new Error("Amplify client not configured"));
          setLoading(false);
          return;
        }

        const result = await client.models.Event.get(
          { id },
          { selectionSet: eventSelection },
        );
        setEvent(result.data ? mapEventFromModel(result.data) : null);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load event"));
        setLoading(false);
      }
    };

    if (id) {
      void fetchEvent();
    }
  }, [id]);

  return { event, loading, error };
}

export function useCreateEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createEvent = async (input: CreateEventInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const client = getAmplifyClient();
      if (!client) {
        throw new Error("Amplify client not configured");
      }

      const result = await client.models.Event.create(input, {
        selectionSet: eventSelection,
      });
      return result.data ? mapEventFromModel(result.data) : null;
    } catch (err) {
      const eventError = err instanceof Error ? err : new Error("Failed to create event");
      setError(eventError);
      throw eventError;
    } finally {
      setLoading(false);
    }
  };

  return { createEvent, loading, error };
}

export function useUpdateEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateEvent = async (input: UpdateEventInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const client = getAmplifyClient();
      if (!client) {
        throw new Error("Amplify client not configured");
      }

      const result = await client.models.Event.update(input, {
        selectionSet: eventSelection,
      });
      return result.data ? mapEventFromModel(result.data) : null;
    } catch (err) {
      const eventError = err instanceof Error ? err : new Error("Failed to update event");
      setError(eventError);
      throw eventError;
    } finally {
      setLoading(false);
    }
  };

  return { updateEvent, loading, error };
}

export function useDeleteEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteEvent = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const client = getAmplifyClient();
      if (!client) {
        throw new Error("Amplify client not configured");
      }

      await client.models.Event.delete({ id });
    } catch (err) {
      const eventError = err instanceof Error ? err : new Error("Failed to delete event");
      setError(eventError);
      throw eventError;
    } finally {
      setLoading(false);
    }
  };

  return { deleteEvent, loading, error };
}
