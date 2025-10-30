import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Ticket,
  Settings,
  User,
  Bell,
  Sparkles,
} from "lucide-react";

type NavigationItem = {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Dashboard: LayoutDashboard,
  Events: Calendar,
  Bookings: BookOpen,
  Tickets: Ticket,
  Organizer: Sparkles,
  Profile: User,
  Settings: Settings,
  Notifications: Bell,
};

type SidebarProps = {
  items: NavigationItem[];
  activeHref?: string;
  onNavigate?: (href: string) => void;
  isMobileOpen?: boolean;
};

export function Sidebar({
  items,
  activeHref,
  onNavigate,
  isMobileOpen = false,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity"
          onClick={() => onNavigate?.(activeHref || "")}
        />
      )}

      {/* Sidebar - fixed on desktop, overlay on mobile */}
      <aside
        className={`w-64 border-r border-border bg-background flex flex-col fixed inset-y-0 left-0 z-50 md:z-auto transition-transform ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto p-4">
          {/* Logo section */}
          <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-base font-bold">RB</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                RelexBooking
              </div>
              <div className="text-xs text-muted-foreground">
                Event Management
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col gap-1">
            {items.map((item) => {
              const isActive =
                (item.href === "/" && activeHref === "/") ||
                (item.href !== "/" && activeHref?.startsWith(item.href));
              const Icon = iconMap[item.label] || LayoutDashboard;

              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => onNavigate?.(item.href)}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="mt-auto border-t border-border pt-4">
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-xs font-medium text-foreground mb-1">
                Need help?
              </div>
              <div className="text-xs text-muted-foreground">
                Contact support
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}