# 🏗️ RelexBooking - Complete Architecture Documentation

## 📋 Table of Contents
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Routing](#routing)
- [Pages Overview](#pages-overview)
- [Data Models](#data-models)
- [CRUD Operations](#crud-operations)
- [Next Steps](#next-steps)

---

## 🧩 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 18 + Vite | Fast development & builds |
| **Routing** | React Router v6 | Client-side routing |
| **Styling** | Tailwind CSS v4 | Utility-first CSS |
| **UI Components** | shadcn/ui | Modern, accessible components |
| **Animations** | Framer Motion | Smooth transitions |
| **Backend** | AWS Amplify | Serverless backend |
| **API** | GraphQL (AppSync) | Data fetching & mutations |
| **Database** | DynamoDB | Event & booking storage |
| **Storage** | S3 | Event images & QR codes |
| **Auth** | Cognito | User authentication |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx      # Main layout with Sidebar & Header
│   │   ├── Header.tsx         # Top navigation bar
│   │   ├── Sidebar.tsx        # Side navigation menu
│   │   └── ThemeToggle.tsx    # Dark/light mode toggle
│   ├── ui/
│   │   ├── button.tsx         # shadcn/ui Button
│   │   ├── card.tsx           # shadcn/ui Card
│   │   └── input.tsx          # shadcn/ui Input
│   └── theme-provider.tsx     # Theme context provider
├── pages/
│   ├── Dashboard.tsx          # Home page with stats
│   ├── Events.tsx             # Browse all events
│   ├── EventDetail.tsx        # Single event view
│   ├── Bookings.tsx           # User bookings list
│   ├── BookingDetail.tsx      # Single booking with QR
│   ├── Tickets.tsx            # Confirmed tickets only
│   ├── Organizer.tsx          # Organizer dashboard
│   ├── Profile.tsx            # User profile
│   ├── Settings.tsx           # App settings
│   ├── Notifications.tsx      # Notification center
│   └── Payment.tsx            # Payment checkout
├── hooks/
│   ├── useEvents.ts           # Event CRUD hooks
│   ├── useBookings.ts         # Booking CRUD hooks
│   └── useTheme.ts            # Theme management
├── lib/
│   ├── utils.ts               # Utility functions (cn)
│   └── amplifyClient.ts       # Amplify client setup
├── types/
│   └── graphql.ts             # TypeScript types
├── routes/
│   └── AppRoutes.tsx          # Route definitions
├── App.tsx                    # Main app component
└── main.tsx                   # Entry point
```

---

## 🧭 Routing

### Route Structure

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Home page with overview |
| `/events` | Events | Browse all events |
| `/events/:id` | EventDetail | View single event |
| `/bookings` | Bookings | User's booking history |
| `/bookings/:id` | BookingDetail | Booking details with QR |
| `/tickets` | Tickets | Confirmed tickets only |
| `/organizer` | Organizer | Organizer dashboard |
| `/profile` | Profile | User profile management |
| `/settings` | Settings | App settings |
| `/notifications` | Notifications | Notification center |
| `/payment/:eventId` | Payment | Payment checkout |

### Navigation Flow

```
Dashboard → Events → EventDetail → Payment → BookingDetail
                ↓
            Organizer → Create Event
                ↓
            Bookings → BookingDetail
                ↓
            Tickets (confirmed only)
```

---

## 📱 Pages Overview

### 1. **Dashboard** (`/`)
- **Purpose**: Overview of user activity
- **Features**:
  - Recent bookings summary
  - Upcoming events
  - Analytics cards (total bookings, spent, active tickets)
  - Quick action buttons

### 2. **Events** (`/events`)
- **Purpose**: Browse and search events
- **Features**:
  - Event grid with cards
  - Search functionality
  - Filter by category/date/location
  - "Book Now" button → navigates to payment

### 3. **EventDetail** (`/events/:id`)
- **Purpose**: View detailed event information
- **Features**:
  - Full event details
  - Image gallery
  - Booking button → `/payment/:eventId`

### 4. **Bookings** (`/bookings`)
- **Purpose**: View booking history
- **Features**:
  - List of all bookings
  - Filter by status (pending, confirmed, cancelled)
  - Click to view details

### 5. **BookingDetail** (`/bookings/:id`)
- **Purpose**: View booking with QR code
- **Features**:
  - QR code display
  - Download ticket
  - Cancel booking option

### 6. **Tickets** (`/tickets`)
- **Purpose**: Access confirmed tickets only
- **Features**:
  - Grid of ticket cards
  - QR code preview
  - Download functionality

### 7. **Organizer** (`/organizer`)
- **Purpose**: Manage events (organizer view)
- **Features**:
  - Create new event
  - Edit/delete events
  - View analytics
  - Manage attendees

### 8. **Profile** (`/profile`)
- **Purpose**: Manage user account
- **Features**:
  - Update name, email, phone
  - Change password
  - Profile picture upload

### 9. **Settings** (`/settings`)
- **Purpose**: App preferences
- **Features**:
  - Theme toggle (light/dark/system)
  - Notification preferences
  - Privacy settings

### 10. **Notifications** (`/notifications`)
- **Purpose**: View system notifications
- **Features**:
  - Booking confirmations
  - Event reminders
  - Status updates

### 11. **Payment** (`/payment/:eventId`)
- **Purpose**: Checkout flow
- **Features**:
  - Payment form
  - Booking summary
  - Success confirmation

---

## 📊 Data Models

### Event Type
```typescript
type Event = {
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
```

### Booking Type
```typescript
type Booking = {
  id: string;
  eventID: string;
  userID: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  qrCode?: string;
  event?: Event;
};
```

### User Type
```typescript
type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "organizer" | "admin";
  createdAt?: string;
};
```

---

## 🔄 CRUD Operations

### Events CRUD

**Hooks Available:**
- `useEvents()` - Fetch all events
- `useEvent(id)` - Fetch single event
- `useCreateEvent()` - Create new event
- `useUpdateEvent()` - Update event
- `useDeleteEvent()` - Delete event

**Example Usage:**
```typescript
import { useEvents, useCreateEvent } from "@/hooks/useEvents";

function EventsPage() {
  const { events, loading, error } = useEvents();
  const { createEvent, loading: creating } = useCreateEvent();
  
  const handleCreate = async (data) => {
    await createEvent(data);
  };
}
```

### Bookings CRUD

**Hooks Available:**
- `useBookings()` - Fetch all bookings
- `useBooking(id)` - Fetch single booking
- `useCreateBooking()` - Create new booking
- `useUpdateBooking()` - Update booking status

**Example Usage:**
```typescript
import { useBookings, useCreateBooking } from "@/hooks/useBookings";

function BookingsPage() {
  const { bookings, loading, error } = useBookings();
  const { createBooking } = useCreateBooking();
  
  const handleBook = async (eventId) => {
    await createBooking({ eventID: eventId, userID: userId });
  };
}
```

---

## ✅ Next Steps

### 1. **Connect to Amplify Backend**
   - Update GraphQL schema in `amplify/data/resource.ts`
   - Uncomment CRUD operations in hooks
   - Test with real data

### 2. **Add Authentication**
   - Integrate Cognito authentication
   - Add protected routes
   - User role management

### 3. **Implement File Uploads**
   - S3 integration for event images
   - QR code generation for bookings

### 4. **Add Payment Integration**
   - Stripe integration
   - Payment processing
   - Booking confirmation flow

### 5. **Real-time Updates**
   - AppSync subscriptions
   - Live booking updates
   - Notification system

### 6. **Additional Features**
   - Email notifications (SES)
   - PDF ticket generation
   - Advanced search/filters
   - Event analytics

---

## 🚀 Running the App

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📝 Notes

- All CRUD hooks are set up with TODO comments for Amplify integration
- Components use shadcn/ui for consistent styling
- Theme system supports light/dark/system modes
- Routing uses React Router v6 with nested routes
- All pages include loading states and error handling
- Responsive design for mobile, tablet, and desktop

---

**Built with ❤️ using React + Vite + Tailwind + shadcn/ui + AWS Amplify**
