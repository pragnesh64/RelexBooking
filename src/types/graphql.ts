// GraphQL types for RelexBooking
export type Event = {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  price: number;
  image?: string;
  organizerID: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Booking = {
  id: string;
  eventID: string;
  userID: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  qrCode?: string;
  event?: Event;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "organizer" | "admin";
  createdAt?: string;
};

export type CreateEventInput = {
  title: string;
  description?: string;
  date: string;
  location: string;
  price: number;
  image?: string;
};

export type CreateBookingInput = {
  eventID: string;
  userID: string;
  status?: "pending" | "confirmed";
};

export type UpdateEventInput = Partial<CreateEventInput> & {
  id: string;
};

export type UpdateBookingInput = {
  id: string;
  status?: Booking["status"];
};
