import type { Schema } from "../../amplify/data/resource";

export type AmplifyEventModel = Schema["Event"]["type"];
export type AmplifyBookingModel = Schema["Booking"]["type"];
export type AmplifyUserProfileModel = Schema["UserProfile"]["type"];

export type Event = {
  id: string;
  title?: string | null;
  description?: string | null;
  date?: string | null;
  location?: string | null;
  price?: number | null;
  capacity?: number | null;
  imageUrl?: string | null;
  category?: string | null;
  organizerID: string;
  organizerName?: string | null;
  status?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type Booking = {
  id: string;
  eventID: string;
  userID: string;
  userName?: string | null;
  userEmail?: string | null;
  status: string;
  ticketCount?: number | null;
  totalAmount?: number | null;
  qrCode?: string | null;
  checkedIn?: boolean | null;
  checkedInAt?: string | null;
  cancelledAt?: string | null;
  refundedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  event?: Pick<Event, "id" | "title" | "date" | "location" | "organizerName" | "imageUrl"> | null;
};

export type UserProfile = {
  id: string;
  userID: string;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  role?: string | null;
  kycStatus?: string | null;
  kycDocumentUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateEventInput = Schema["Event"]["createType"];
export type UpdateEventInput = Schema["Event"]["updateType"];

export type CreateBookingInput = Schema["Booking"]["createType"];
export type UpdateBookingInput = Schema["Booking"]["updateType"];
