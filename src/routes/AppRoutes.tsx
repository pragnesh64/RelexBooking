export type AppRoute = {
  href: string;
  label: string;
};

export const APP_ROUTES: AppRoute[] = [
  { href: "/", label: "Dashboard" },
  { href: "/events", label: "Events" },
  { href: "/bookings", label: "Bookings" },
  { href: "/tickets", label: "Tickets" },
  // Note: "Organizer" is added conditionally in AppLayout based on role
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
  { href: "/notifications", label: "Notifications" },
];

export const DEFAULT_ROUTE = APP_ROUTES[0]?.href ?? "/";
