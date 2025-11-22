import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Bell,
  Menu,
  User,
  LogOut,
  Home,
  Calendar,
  Users,
  MessageSquare,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Badge } from "./ui/badge";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import { SettingsModal } from "./modals/SettingsModal";
import { NotificationsModal } from "./modals/NotificationsModal";
import notificationService from "../services/notificationService";

export function Navbar({ role: propRole }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Xác định role từ prop hoặc user context
  const role = propRole || user?.role || "guest";

  // Fetch unread notification count
  useEffect(() => {
    if (user && role !== "guest") {
      const fetchUnreadCount = async () => {
        try {
          const count = await notificationService.getUnreadCount();
          setUnreadNotifications(count || 0);
        } catch (error) {
          console.error("Error fetching unread count:", error);
        }
      };
      fetchUnreadCount();
      // Poll every 30 seconds for new notifications
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, role]);

  const guestLinks = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/events", label: "Sự kiện", icon: Calendar },
    { href: "/about", label: "Giới thiệu", icon: Users },
    { href: "/contact", label: "Liên hệ", icon: MessageSquare },
  ];

  const volunteerLinks = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/user/events", label: "Sự kiện", icon: Calendar },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/community", label: "Cộng đồng", icon: MessageSquare },
  ];

  const managerLinks = [
    { href: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/manager/events", label: "Quản lý sự kiện", icon: Calendar },
    { href: "/manager/community", label: "Cộng đồng", icon: MessageSquare },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Người dùng", icon: Users },
    { href: "/admin/events", label: "Sự kiện", icon: Calendar },
    { href: "/admin/reports", label: "Báo cáo", icon: Settings },
  ];

  const getLinks = () => {
    switch (role) {
      case "volunteer":
        return volunteerLinks;
      case "manager":
        return managerLinks;
      case "admin":
        return adminLinks;
      case "guest":
      case "public":
        return guestLinks;
      default:
        return guestLinks;
    }
  };

  const links = getLinks();

  const handleLogout = () => {
    logout();
    // Navigate sẽ được xử lý trong AuthContext
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Users className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">VolunteerHub</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />

          {role !== "guest" && (
            <>
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setNotificationsOpen(true)}
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>

              {/* User Menu - Settings Modal */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(true)}
              >
                <User className="h-5 w-5" />
              </Button>

              {/* Modals */}
              <SettingsModal
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
              />
              <NotificationsModal
                open={notificationsOpen}
                onOpenChange={setNotificationsOpen}
              />
            </>
          )}

          {role === "guest" && (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" asChild>
                <Link to="/login">Đăng nhập</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Đăng ký</Link>
              </Button>
            </div>
          )}

          {/* Mobile */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 py-4">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                        isActive
                          ? "bg-accent text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
                <div className="flex items-center justify-between px-3 py-2 border-t">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                {role === "guest" && (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full bg-transparent"
                    >
                      <Link to="/login">Đăng nhập</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link to="/register">Đăng ký</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
