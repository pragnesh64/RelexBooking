import { useState, useEffect, useRef } from "react";
import { Search, Bell, User, Menu, X, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type HeaderProps = {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
};

export function Header({ onMenuToggle, isMobileMenuOpen }: HeaderProps) {
  const navigate = useNavigate();
  const { user, signOut, isOrganizer, isAdmin } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
    setShowProfileDropdown(false);
    navigate("/signin");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        {onMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        )}

        {/* Logo - hidden on mobile when sidebar is visible */}
        {/* <div className="hidden md:flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">RB</span>
          </div>
          <span className="text-base font-semibold text-foreground">
            {title}
          </span>
        </div> */}
      </div>

      {/* Search bar */}
      <div className="hidden lg:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search events, bookings..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive"></span>
          </Button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-border bg-card p-3 shadow-lg z-50">
              <div className="text-sm font-semibold mb-2">Notifications</div>
              <div className="text-sm text-muted-foreground">
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            aria-label="Profile menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground">
              <User className="h-4 w-4" />
            </div>
          </Button>

          {showProfileDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-card p-1 shadow-lg z-50">
              {/* User Info */}
              {user && (
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user.email || user.username}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.groups.map((group) => (
                      <Badge key={group} variant="outline" className="text-xs">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                type="button"
                onClick={() => {
                  setShowProfileDropdown(false);
                  navigate("/profile");
                }}
                className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfileDropdown(false);
                  navigate("/settings");
                }}
                className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
              >
                Settings
              </button>
              {(isOrganizer || isAdmin) && (
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    navigate("/admin");
                  }}
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                >
                  Admin Panel
                </button>
              )}
              <div className="my-1 h-px bg-border" />
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full rounded-md px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}