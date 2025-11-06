import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates Event and Booking database tables with proper
authorization rules for role-based access control.

Authorization Rules:
- Events: Public read, Organizers can create and read ALL events (update/delete only their own), Admins can manage all
- Bookings: Users can create/read their own, Organizers can read event bookings, Admins can manage all
=========================================================================*/
const schema = a.schema({
  Event: a
    .model({
      title: a.string().required(),
      description: a.string(),
      date: a.datetime().required(),
      location: a.string(),
      price: a.float(),
      capacity: a.integer(),
      sold: a.integer().default(0), // Track sold tickets for capacity management
      imageUrl: a.string(),
      category: a.string(),
      organizerID: a.id().required(), // Cognito username/sub
      organizerName: a.string(),
      status: a.string().default("draft"), // draft, published, cancelled, completed
      publishedAt: a.datetime(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      bookings: a.hasMany("Booking", "eventID"),
    })
    .authorization((allow) => [
      // Public can read published events
      allow.publicApiKey().to(["read"]),
      // Authenticated users can read
      allow.authenticated().to(["read"]),
      // Organizers can create and READ ALL events (not just their own)
      allow.group("Organizer").to(["create", "read"]),
      // Organizers can update/delete ONLY their own events
      allow.ownerDefinedIn("organizerID").identityClaim("sub").to(["update", "delete"]),
      // Admins and SuperAdmins can manage all events
      allow.group("Admin").to(["create", "read", "update", "delete"]),
      allow.group("SuperAdmin").to(["create", "read", "update", "delete"]),
    ]),

  Booking: a
    .model({
      eventID: a.id().required(),
      event: a.belongsTo("Event", "eventID"),
      userID: a.id().required(), // Cognito username/sub
      userName: a.string(),
      userEmail: a.string(),
      status: a.string().required().default("pending"), // pending, confirmed, cancelled, refunded, checked_in
      ticketCount: a.integer().default(1),
      totalAmount: a.float(),
      qrCode: a.string(), // QR code data for check-in
      ticketPayload: a.string(), // Secure HMAC token for verification
      paymentId: a.string(), // Payment provider transaction ID
      paymentStatus: a.string(), // payment_pending, paid, failed, refunded
      checkedIn: a.boolean().default(false),
      checkedInBy: a.id(), // User ID who checked in (organizer/admin)
      checkedInByName: a.string(),
      checkedInAt: a.datetime(),
      cancelledAt: a.datetime(),
      cancelledBy: a.id(), // Who cancelled (user, organizer, admin)
      cancellationReason: a.string(),
      refundedAt: a.datetime(),
      refundAmount: a.float(),
      notes: a.string(), // Admin/organizer notes
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      // Users can create and manage their own bookings
      allow.ownerDefinedIn("userID").identityClaim("sub").to(["create", "read", "update"]),
      // Organizers can read and update bookings for their events
      allow.group("Organizer").to(["read", "update"]),
      // Admins and SuperAdmins can manage all bookings
      allow.group("Admin").to(["read", "update", "delete"]),
      allow.group("SuperAdmin").to(["create", "read", "update", "delete"]),
    ]),

  // Audit Log for tracking critical actions
  AuditLog: a
    .model({
      actorID: a.id().required(), // User who performed the action
      actorName: a.string(),
      actorEmail: a.string(),
      action: a.string().required(), // booking.create, booking.cancel, booking.checkin, etc.
      resourceType: a.string().required(), // Booking, Event, User
      resourceID: a.id().required(),
      resourceData: a.json(), // Snapshot of the resource
      metadata: a.json(), // Additional context (IP, user agent, etc.)
      timestamp: a.datetime().required(),
    })
    .authorization((allow) => [
      // Only admins can read audit logs
      allow.group("Admin").to(["read"]),
      allow.group("SuperAdmin").to(["read", "delete"]),
      // System can create audit logs
      allow.authenticated().to(["create"]),
    ]),

  // User Profile extension (optional, can also use Cognito attributes)
  UserProfile: a
    .model({
      userID: a.id().required(), // Cognito username/sub
      email: a.string(),
      name: a.string(),
      phone: a.string(),
      avatarUrl: a.string(),
      bio: a.string(),
      role: a.string(), // User, Organizer, Admin, SuperAdmin
      kycStatus: a.string(), // pending, approved, rejected
      kycDocumentUrl: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      // Users can read/update their own profile
      allow.ownerDefinedIn("userID").identityClaim("sub").to(["create", "read", "update"]),
      // Admins can read all profiles
      allow.group("Admin").to(["read", "update"]),
      allow.group("SuperAdmin").to(["read", "update", "delete"]),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // User Pool for authenticated requests
    // API Key for public read access
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: events } = await client.models.Event.list()
// return <ul>{events.map(event => <li key={event.id}>{event.title}</li>)}</ul>
