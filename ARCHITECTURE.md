# 🏗️ RelexBooking - Complete Architecture Documentation

## 📋 Table of Contents
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Authentication & Authorization](#authentication--authorization)
- [Routing](#routing)
- [Pages Overview](#pages-overview)
- [Data Models](#data-models)
- [CRUD Operations](#crud-operations)
- [Deployment Status](#deployment-status)
- [Next Steps](#next-steps)

---

## 🧩 Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend Framework** | React | 18.2.0 | UI library |
| **Build Tool** | Vite | 5.4.10 | Fast development & builds |
| **Routing** | React Router | 7.9.5 | Client-side routing |
| **Styling** | Tailwind CSS | 4.1.16 | Utility-first CSS |
| **UI Components** | shadcn/ui + Lucide Icons | Latest | Modern, accessible components |
| **Animations** | Framer Motion | 12.23.24 | Smooth transitions |
| **Backend** | AWS Amplify Gen 2 | 6.6.6 | Serverless backend |
| **API** | GraphQL (AppSync) | - | Data fetching & mutations |
| **Database** | DynamoDB | - | Event & booking storage |
| **Storage** | S3 | - | Event images & QR codes |
| **Auth** | AWS Cognito | - | User authentication & authorization |
| **CDK** | AWS CDK | 2.138.0 | Infrastructure as Code |

---

## 📁 Project Structure

```
RelexBooking/
├── amplify/
│   ├── auth/
│   │   └── resource.ts        # Cognito User Pool with roles
│   ├── data/
│   │   └── resource.ts        # GraphQL schema & authorization
│   └── backend.ts             # Backend configuration
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx  # Route protection with roles
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx      # Main layout wrapper
│   │   │   ├── Header.tsx         # Top bar with auth menu
│   │   │   ├── Sidebar.tsx        # Side navigation
│   │   │   ├── ThemeToggle.tsx    # Dark/light mode
│   │   │   └── index.ts           # Layout exports
│   │   └── ui/
│   │       ├── badge.tsx          # shadcn/ui Badge
│   │       ├── button.tsx         # shadcn/ui Button
│   │       ├── card.tsx           # shadcn/ui Card
│   │       ├── input.tsx          # shadcn/ui Input
│   │       └── tabs.tsx           # shadcn/ui Tabs
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── SignIn.tsx         # Sign in page
│   │   │   ├── SignUp.tsx         # Sign up with email verification
│   │   │   └── VerifyEmail.tsx    # Email verification code entry
│   │   ├── Dashboard.tsx          # Home with stats & recommendations
│   │   ├── Events.tsx             # Browse all events
│   │   ├── EventDetail.tsx        # Single event details
│   │   ├── Bookings.tsx           # User bookings list
│   │   ├── BookingDetail.tsx      # Single booking with QR
│   │   ├── Tickets.tsx            # Confirmed tickets only
│   │   ├── Organizer.tsx          # Organizer dashboard (protected)
│   │   ├── Profile.tsx            # User profile management
│   │   ├── Settings.tsx           # App settings
│   │   ├── Notifications.tsx      # Notification center
│   │   └── Payment.tsx            # Payment checkout
│   ├── hooks/
│   │   ├── useAuth.tsx            # Auth context & hooks
│   │   ├── useEvents.ts           # Event CRUD operations
│   │   ├── useBookings.ts         # Booking CRUD operations
│   │   └── useTheme.tsx           # Theme management
│   ├── lib/
│   │   ├── utils.ts               # Utility functions (cn, etc.)
│   │   └── amplifyClient.ts       # Amplify configuration
│   ├── types/
│   │   └── graphql.ts             # TypeScript types for GraphQL
│   ├── routes/
│   │   └── AppRoutes.tsx          # Route definitions & constants
│   ├── App.tsx                    # Main app with routing
│   └── main.tsx                   # Entry point
├── package.json
└── vite.config.ts
```

---

## 🔐 Authentication & Authorization

### User Roles
The application supports role-based access control (RBAC) with the following roles:

| Role | Description | Access Level |
|------|-------------|--------------|
| **User** | Default role | Browse events, create bookings, manage own profile |
| **Organizer** | Event creators | All User permissions + Create/manage events |
| **Admin** | Site administrators | All Organizer permissions + Manage all events/bookings |
| **SuperAdmin** | System administrators | Full access to all resources |
| **Pending** | Unverified users | Limited access until verification |

### Authentication Flow

```typescript
// useAuth hook provides authentication context
import { useAuth } from '@/hooks/useAuth';

function Component() {
  const {
    user,              // Current user object
    loading,           // Auth loading state
    isAuthenticated,   // Boolean authentication status
    signIn,            // Sign in function
    signUp,            // Sign up function
    signOut,           // Sign out function
    confirmSignUp,     // Email verification
    hasRole,           // Check user role
    isOrganizer,       // Helper for organizer check
    isAdmin,           // Helper for admin check
  } = useAuth();
}
```

### Protected Routes
Routes are protected using the `ProtectedRoute` component:

```typescript
// Regular protected route (requires authentication)
<Route
  path="/"
  element={
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  }
/>

// Role-protected route (requires Organizer, Admin, or SuperAdmin)
<Route
  path="/organizer"
  element={
    <ProtectedRoute requireOrganizer>
      <Organizer />
    </ProtectedRoute>
  }
/>
```

### Authorization Rules (Database Level)

**Events:**
- Public/Authenticated: Read published events
- Organizers: Create/update/delete their own events
- Admins/SuperAdmins: Manage all events

**Bookings:**
- Users: Create/read their own bookings
- Organizers: Read bookings for their events
- Admins/SuperAdmins: Manage all bookings

**UserProfiles:**
- Users: Create/read/update their own profile
- Admins: Read and update all profiles
- SuperAdmins: Full access including delete

---

## 🧭 Routing

### Route Structure

| Route | Component | Protection | Description |
|-------|-----------|------------|-------------|
| `/signin` | SignIn | Public | Sign in page |
| `/signup` | SignUp | Public | Sign up page |
| `/verify-email` | VerifyEmail | Public | Email verification |
| `/unauthorized` | Unauthorized | Public | 403 error page |
| `/` | Dashboard | Protected | Home page with overview |
| `/events` | Events | Protected | Browse all events |
| `/events/:id` | EventDetail | Protected | View single event |
| `/bookings` | Bookings | Protected | User's booking history |
| `/bookings/:id` | BookingDetail | Protected | Booking details with QR |
| `/tickets` | Tickets | Protected | Confirmed tickets only |
| `/organizer` | Organizer | **Organizer Role** | Organizer dashboard |
| `/profile` | Profile | Protected | User profile management |
| `/settings` | Settings | Protected | App settings |
| `/notifications` | Notifications | Protected | Notification center |
| `/payment/:eventId` | Payment | Protected | Payment checkout |

### Navigation Flow

```
Authentication Flow:
SignUp → VerifyEmail → SignIn → Dashboard

User Flow:
Dashboard ��� Events → EventDetail → Payment → BookingDetail
    ↓
Bookings → BookingDetail (with QR code)
    ↓
Tickets (confirmed only)

Organizer Flow:
Dashboard → Organizer → Create/Manage Events
    ↓
View Event Bookings → Manage Attendees
```

---

## 📱 Pages Overview

### Authentication Pages

#### 1. **SignIn** (`/signin`)
- Email/password authentication
- Link to sign up
- Forgot password flow
- Redirects to dashboard on success

#### 2. **SignUp** (`/signup`)
- Email, password, name registration
- Password strength validation
- Email verification required
- Redirects to verify-email page

#### 3. **VerifyEmail** (`/verify-email`)
- Enter 6-digit verification code
- Resend code functionality
- Auto-redirect to sign in on success

### Main Application Pages

#### 4. **Dashboard** (`/`)
- **Stats Cards**:
  - Total bookings
  - Confirmed tickets
  - Upcoming events
  - Total events available
- **Recent Bookings**: Last 5 bookings with status
- **Upcoming Events**: Confirmed bookings with countdown timer
- **Recommended Events**: Personalized event suggestions
- **Quick Actions**: Browse Events, Create Event, Scan Ticket
- **Dynamic Greeting**: Time-based greeting message

#### 5. **Events** (`/events`)
- Grid view of all published events
- Search functionality
- Filter by category/date/location
- Event cards showing:
  - Title, location, date
  - Price badge
  - Organizer info
- Click to view event details

#### 6. **EventDetail** (`/events/:id`)
- Full event information display
- Event image/banner
- Description, date, location
- Capacity and availability
- Price information
- "Book Now" button → `/payment/:eventId`
- Organizer information

#### 7. **Bookings** (`/bookings`)
- List of user's bookings
- Tabbed interface:
  - All bookings
  - Pending
  - Confirmed
  - Cancelled
- Status badges (color-coded)
- Event details summary
- Click to view full booking

#### 8. **BookingDetail** (`/bookings/:id`)
- QR code display for check-in
- Booking status
- Event details
- Ticket information
- Total amount paid
- Download/share ticket
- Cancel booking option (if allowed)

#### 9. **Tickets** (`/tickets`)
- Grid of confirmed tickets only
- Quick access QR codes
- Event thumbnails
- Download all tickets
- Filter by upcoming/past

#### 10. **Organizer** (`/organizer`) 🔒 *Role Protected*
- **Create Event Form**:
  - Title, description, date/time
  - Location, capacity, price
  - Category selection
  - Image upload
  - Publish/draft options
- **My Events List**:
  - All events created by organizer
  - Edit/delete functionality
  - View bookings per event
  - Event analytics
- **Dashboard Analytics**:
  - Total events created
  - Total bookings received
  - Revenue statistics
  - Upcoming events

#### 11. **Profile** (`/profile`)
- **Personal Information**:
  - Name, email, phone
  - Profile picture upload
  - Bio/description
- **Account Settings**:
  - Change password
  - Email preferences
- **Role Information**: Display current role(s)
- **Update Profile**: Save changes functionality

#### 12. **Settings** (`/settings`)
- **Appearance**:
  - Theme toggle (light/dark/system)
  - Color scheme preferences
- **Notifications**:
  - Email notifications toggle
  - Push notifications preferences
  - Booking updates
  - Event reminders
- **Privacy**:
  - Data visibility settings
  - Account deletion

#### 13. **Notifications** (`/notifications`)
- Real-time notification center
- Notification types:
  - Booking confirmations
  - Event reminders
  - Booking cancellations
  - Event updates
  - System announcements
- Mark as read functionality
- Filter by type/date
- Clear all notifications

#### 14. **Payment** (`/payment/:eventId`)
- Event summary card
- Ticket quantity selector with capacity validation
- Dynamic price calculation (base + service fee)
- Payment form (demo mode, ready for Stripe integration)
- Total amount display
- Real-time booking creation on payment success
- Auto-generated QR code for ticket
- Success screen with redirect to ticket

#### 15. **ScanTicket** (`/scan-ticket`) 🔒 *Organizer+ Only*
- **QR Scanner Interface**:
  - Camera access with permission handling
  - Real-time QR code scanning
  - Auto-validation against database
  - Check-in status update
- **Validation Results**:
  - Success: Shows attendee details and marks as checked in
  - Failure: Shows error reason (invalid, already used, etc.)
  - Scan history tracking

#### 16. **Admin Dashboard** (`/admin`) 🔒 *Admin Only*
- **Overview Tab**:
  - Total users, events, revenue metrics
  - Recent activity feed
  - System health indicators
  - Pending KYC count
- **User Management Tab**:
  - Searchable user table
  - Role badges and status indicators
  - User promotion controls
  - Account status management
- **KYC Verification Tab**:
  - List of pending organizer applications
  - Document preview
  - Approve/Reject workflow
  - Auto-promotion to Organizer on approval

---

## 📊 Data Models

### Complete Schema (from `amplify/data/resource.ts`)

#### Event Model
```typescript
{
  id: string;                    // Auto-generated
  title: string;                 // Required
  description?: string;
  date: datetime;                // Required
  location?: string;
  price?: float;
  capacity?: integer;
  imageUrl?: string;
  category?: string;
  organizerID: string;           // Required, Cognito sub
  organizerName?: string;
  status: string;                // draft | published | cancelled | completed
  publishedAt?: datetime;
  createdAt: datetime;
  updatedAt: datetime;
  bookings: Booking[];           // hasMany relationship
}
```

#### Booking Model
```typescript
{
  id: string;                    // Auto-generated
  eventID: string;               // Required, foreign key
  event: Event;                  // belongsTo relationship
  userID: string;                // Required, Cognito sub
  userName?: string;
  userEmail?: string;
  status: string;                // pending | confirmed | cancelled | refunded
  ticketCount: integer;          // Default: 1
  totalAmount?: float;
  qrCode?: string;
  checkedIn: boolean;            // Default: false
  checkedInAt?: datetime;
  cancelledAt?: datetime;
  refundedAt?: datetime;
  createdAt: datetime;
  updatedAt: datetime;
}
```

#### UserProfile Model
```typescript
{
  id: string;                    // Auto-generated
  userID: string;                // Required, Cognito sub
  email?: string;
  name?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  role?: string;                 // User | Organizer | Admin | SuperAdmin
  kycStatus?: string;            // pending | approved | rejected
  kycDocumentUrl?: string;
  createdAt: datetime;
  updatedAt: datetime;
}
```

### Authorization Modes
- **Primary**: User Pool (Cognito)
- **Secondary**: API Key (for public read access)
- API Key expires in 30 days

---

## 🔄 CRUD Operations

### Events CRUD

**Hooks Available:**
```typescript
import { useEvents } from '@/hooks/useEvents';

// Fetch all events
const { events, loading, error } = useEvents();

// Fetch single event
const { event, loading, error } = useEvent(id);

// Create event (Organizer+ only)
const { createEvent, loading } = useCreateEvent();
await createEvent({
  title: "Event Name",
  description: "Description",
  date: "2024-12-31T20:00:00Z",
  location: "Venue",
  price: 50.00,
  capacity: 100,
  organizerID: user.userId,
});

// Update event (Owner/Admin only)
const { updateEvent, loading } = useUpdateEvent();
await updateEvent(eventId, { title: "New Title" });

// Delete event (Owner/Admin only)
const { deleteEvent, loading } = useDeleteEvent();
await deleteEvent(eventId);
```

### Bookings CRUD

**Hooks Available:**
```typescript
import { useBookings } from '@/hooks/useBookings';

// Fetch user's bookings
const { bookings, loading, error } = useBookings();

// Fetch single booking
const { booking, loading, error } = useBooking(id);

// Create booking
const { createBooking, loading } = useCreateBooking();
await createBooking({
  eventID: eventId,
  userID: user.userId,
  ticketCount: 2,
  totalAmount: 100.00,
  status: "pending",
});

// Update booking status
const { updateBooking, loading } = useUpdateBooking();
await updateBooking(bookingId, { status: "confirmed" });

// Cancel booking
await updateBooking(bookingId, {
  status: "cancelled",
  cancelledAt: new Date().toISOString()
});
```

### GraphQL Client Usage

```typescript
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

// List with filters
const { data } = await client.models.Event.list({
  filter: {
    status: { eq: 'published' },
    date: { gt: new Date().toISOString() }
  }
});

// Get by ID
const { data } = await client.models.Event.get({ id: eventId });

// Create
const { data } = await client.models.Event.create({
  title: "New Event",
  date: "2024-12-31T20:00:00Z",
  organizerID: userId,
});

// Update
const { data } = await client.models.Event.update({
  id: eventId,
  title: "Updated Title"
});

// Delete
await client.models.Event.delete({ id: eventId });
```

---

## 🚀 Deployment Status

### Backend (AWS Amplify)

**✅ Deployed Resources:**
- **Authentication**: Cognito User Pool with role groups (User, Organizer, Admin, SuperAdmin)
- **API**: AppSync GraphQL API with authorization rules
- **Database**: DynamoDB tables (Event, Booking, UserProfile)
- **Storage**: S3 bucket with access policies for event images and KYC documents
- **Functions**: Lambda functions (PostConfirmation trigger)
- **Infrastructure**: CloudFormation stack managed by Amplify Gen 2

**Configuration Files:**
- `amplify/auth/resource.ts` - Cognito user pool and authentication
- `amplify/data/resource.ts` - GraphQL schema with authorization
- `amplify/storage/resource.ts` - S3 bucket configuration and access policies
- `amplify/functions/post-confirmation/` - Auto-create UserProfile on signup
- `amplify/backend.ts` - Backend orchestration

**Deployment Commands:**
```bash
# Start local sandbox (recommended for development)
npx ampx sandbox

# Deploy to cloud (production)
npx ampx deploy --branch main

# Generate Amplify configuration
npx ampx generate outputs
```

### Frontend

**Development:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm run preview
```

**Hosting Options:**
- AWS Amplify Hosting (recommended)
- Vercel
- Netlify
- S3 + CloudFront

---

## ✅ Current Implementation Status

### ✅ Completed Features
- [x] Full authentication system (Sign In/Up/Verify)
- [x] Role-based access control (User/Organizer/Admin/SuperAdmin)
- [x] Protected routes with role checks
- [x] Dashboard with stats and recommendations
- [x] Event browsing and detailed view
- [x] Booking system with status tracking
- [x] Ticket management with QR codes
- [x] Organizer dashboard for event management
- [x] User profile management
- [x] Settings page with theme toggle
- [x] Notifications center
- [x] Payment flow (UI ready)
- [x] Responsive design (mobile/tablet/desktop)
- [x] Dark/Light theme support
- [x] Loading states and error handling

### ✅ Recently Completed Features
- [x] **QR code generation for bookings** - Auto-generated on booking confirmation
- [x] **QR code scanner** - Check-in functionality for Organizers/Admin
- [x] **S3 file storage** - Upload event images and KYC documents
- [x] **File upload utility** - Complete upload component with validation
- [x] **Admin Dashboard** - Comprehensive user management and KYC approval
- [x] **Role-based navigation** - Dynamic sidebar based on user permissions
- [x] **Booking detail page with QR** - Display QR codes on confirmed tickets
- [x] **Payment flow with booking creation** - Integrated booking + QR generation

### 🚧 In Progress / TODO
- [ ] Payment gateway integration (Stripe/PayPal) - *Payment page ready, needs API integration*
- [ ] Integrate KYC form submission - *Admin approval UI ready*
- [ ] Real-time updates via subscriptions
- [ ] Email notifications (SES)
- [ ] PDF ticket generation and download
- [ ] Advanced search and filters for events
- [ ] Event analytics dashboard for Organizers
- [ ] Booking cancellation logic with refunds
- [ ] Event capacity enforcement
- [ ] Waiting list functionality
- [ ] Lambda function for role promotion via Cognito Groups

---

## 🔧 Development Guide

### Setup
```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Start Amplify sandbox
npx ampx sandbox

# Start development server
npm run dev
```

### Environment Variables
Create `.env` file in root:
```env
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=your-pool-id
VITE_AWS_APP_CLIENT_ID=your-client-id
VITE_AWS_APPSYNC_URL=your-appsync-url
```

### Key Scripts
```json
{
  "dev": "vite",                    // Start dev server
  "build": "tsc && vite build",     // Production build
  "preview": "vite preview",        // Preview build
  "lint": "eslint ."               // Run linter
}
```

### Component Development
- Use shadcn/ui components from `@/components/ui`
- Follow Tailwind CSS utility-first approach
- Implement loading states for all async operations
- Handle errors gracefully with user-friendly messages
- Make components responsive by default

### Testing Strategy
```bash
# Unit tests (TODO)
npm run test

# E2E tests (TODO)
npm run test:e2e
```

---

## 📚 Additional Resources

### Documentation
- [AWS Amplify Gen 2 Docs](https://docs.amplify.aws/gen2/)
- [React Router v7](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

### Related Files
- [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md) - Deployment checklist
- [HOW_TO_CHECK_DATABASE.md](./HOW_TO_CHECK_DATABASE.md) - Database access guide
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Community guidelines

---

## 🎯 Architecture Highlights

### Strengths
- **Type-Safe**: Full TypeScript implementation
- **Scalable**: Serverless architecture scales automatically
- **Secure**: Row-level security with Cognito + AppSync
- **Modern Stack**: Latest React, Vite, Tailwind CSS
- **Developer Experience**: Fast HMR, clear error messages
- **Accessible**: shadcn/ui components are WCAG compliant
- **Maintainable**: Clean separation of concerns

### Design Patterns
- **Custom Hooks**: Reusable logic (useAuth, useEvents, useBookings)
- **Context API**: Global state management (Auth, Theme)
- **Compound Components**: Layout structure (AppLayout, Header, Sidebar)
- **Protected Routes**: HOC pattern for route protection
- **Error Boundaries**: Graceful error handling (TODO)

---

---

## 🎯 New Features Implemented (Latest Update)

### 1. QR Code Ticket System
**Files:**
- `src/lib/qrcode.ts` - QR generation and validation utilities
- `src/hooks/useQRCode.ts` - React hook for QR management
- `src/components/booking/QRCodeDisplay.tsx` - Ticket display component
- `src/components/booking/QRScanner.tsx` - Check-in scanner component

**Features:**
- Auto-generate QR codes on booking confirmation
- Format: `EVENTID-USERID-BOOKINGID-TIMESTAMP`
- Validation against database before check-in
- One-time use enforcement
- Download QR as PNG image

### 2. S3 File Upload System
**Files:**
- `amplify/storage/resource.ts` - S3 bucket configuration
- `src/lib/storage.ts` - Upload utilities for images and documents
- `src/components/upload/FileUpload.tsx` - Reusable upload component

**Features:**
- Event image uploads (public, 5MB limit)
- KYC document uploads (private, 10MB limit)
- Upload progress tracking
- File type validation
- Auto-generated file names with timestamps

### 3. Admin Dashboard
**Files:**
- `src/pages/Admin.tsx` - Complete admin interface
- `src/pages/ScanTicket.tsx` - QR scanner page

**Features:**
- User management with search
- Role promotion system (User → Organizer)
- KYC approval workflow
- System metrics and analytics
- Recent activity feed

### 4. Enhanced Payment Flow
**Updates:**
- `src/pages/Payment.tsx` - Full booking creation on payment
- `src/pages/BookingDetail.tsx` - Display QR codes and ticket info
- Real booking creation with QR generation
- Ticket quantity selection
- Dynamic pricing calculation

### 5. Role-Based Navigation
**Updates:**
- `src/components/layout/AppLayout.tsx` - Dynamic route filtering
- `src/components/layout/Sidebar.tsx` - Role-based icons
- Show "Scan Ticket" for Organizers+
- Show "Admin" for Admins+

---

## 📦 New Dependencies Added

```json
{
  "dependencies": {
    "qrcode": "^1.5.3",
    "qrcode.react": "^3.1.0",
    "html5-qrcode": "^2.3.8"
  },
  "devDependencies": {
    "@types/qrcode": "^1.5.5"
  }
}
```

---

## 🔧 Next Implementation Steps

### Immediate Priority (Ready to Build)
1. **KYC Submission Form** - Frontend form for users to upload documents and request Organizer role
2. **Role Promotion Lambda** - Backend function to add users to Cognito Groups
3. **Event Image Upload** - Integrate FileUpload component into Organizer event creation
4. **Stripe Integration** - Replace mock payment with real Stripe Elements

### Medium Priority
1. **Email Notifications** - SES integration for booking confirmations and reminders
2. **Event Analytics** - Charts and insights for Organizers
3. **Booking Cancellation** - Cancel with refund logic
4. **Real-time Subscriptions** - GraphQL subscriptions for live updates

### Long-term Enhancements
1. **PDF Ticket Generation** - Generate downloadable PDF tickets
2. **Event Capacity** - Enforce max attendees and waiting list
3. **Advanced Filters** - Search events by date, category, location, price
4. **Multi-language** - i18n support

---

**Built with ❤️ using React + Vite + Tailwind CSS + shadcn/ui + AWS Amplify Gen 2**

Last Updated: November 2025 (Major Feature Release)
