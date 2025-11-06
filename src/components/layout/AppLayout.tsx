import { useState, useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { APP_ROUTES } from "@/routes/AppRoutes";
import { useAuth } from "@/hooks/useAuth";

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOrganizer, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigate = (href: string) => {
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Filter routes based on user role
  const visibleRoutes = useMemo(() => {
    let routes = [...APP_ROUTES];

    // Add organizer-only routes
    if (isOrganizer) {
      // Insert "Organizer" before "Profile" (to maintain logical order)
      const profileIndex = routes.findIndex(r => r.href === "/profile");
      if (profileIndex !== -1) {
        routes.splice(profileIndex, 0, { href: "/organizer", label: "Organizer" });
      } else {
        routes.push({ href: "/organizer", label: "Organizer" });
      }
      routes.push({ href: "/scan-ticket", label: "Scan Ticket" });
    }

    // Add admin-only routes
    if (isAdmin) {
      routes.push({ href: "/admin", label: "Admin" });
    }

    return routes;
  }, [isOrganizer, isAdmin]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        items={visibleRoutes}
        activeHref={location.pathname}
        onNavigate={handleNavigate}
        isMobileOpen={isMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0 md:ml-64">
        <Header
          onMenuToggle={handleMenuToggle}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}