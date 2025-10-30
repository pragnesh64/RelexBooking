export type AppRoute = {
  href: string;
  label: string;
};

export const APP_ROUTES: AppRoute[] = [
  { href: "/", label: "Dashboard" },
  { href: "/events", label: "Events" },
  { href: "/bookings", label: "Bookings" },
  { href: "/tickets", label: "Tickets" },
  { href: "/organizer", label: "Organizer" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
  { href: "/notifications", label: "Notifications" },
];

export const DEFAULT_ROUTE = APP_ROUTES[0]?.href ?? "/";
