"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  FileSpreadsheet,
  CheckSquare,
  Megaphone,
  History,
  Settings,
  User,
  BookOpen,
  PlayCircle,
  Bell,
  Sun,
  Moon,
  LogOut,
  Calendar,
  Award,
  FileText,
  Clock,
  Menu,
  X,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  user: {
    name: string;
    email: string;
    role: "ADMIN" | "FACULTY" | "STUDENT";
  };
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      // Ignore background fetch errors
    }
  };

  const markNotificationAsRead = async (id?: string) => {
    try {
      if (id) {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, readAt: new Date() } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markAll: true }),
        });
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, readAt: new Date() }))
        );
        setUnreadCount(0);
      }
    } catch (e) {
      // ignore
    }
  };

  // Define nav links based on user role
  const getNavLinks = () => {
    switch (user.role) {
      case "ADMIN":
        return [
          { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
          { label: "Users", href: "/admin/users", icon: Users },
          { label: "Academics", href: "/admin/academics", icon: Building2 },
          { label: "Timetable", href: "/admin/timetable", icon: CalendarDays },
          { label: "Reports", href: "/admin/reports", icon: FileSpreadsheet },
          { label: "Corrections", href: "/admin/corrections", icon: CheckSquare },
          { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
          { label: "Audit Logs", href: "/admin/audit", icon: History },
          { label: "Settings", href: "/admin/settings", icon: Settings },
          { label: "Profile", href: "/profile", icon: User },
        ];
      case "FACULTY":
        return [
          { label: "Dashboard", href: "/faculty", icon: LayoutDashboard },
          { label: "My Classes", href: "/faculty/classes", icon: BookOpen },
          { label: "Start Session", href: "/faculty/session/new", icon: PlayCircle },
          { label: "Reports", href: "/faculty/reports", icon: FileSpreadsheet },
          { label: "Corrections", href: "/faculty/corrections", icon: CheckSquare },
          { label: "Notifications", href: "/faculty/notifications", icon: Bell },
          { label: "Profile", href: "/profile", icon: User },
        ];
      case "STUDENT":
        return [
          { label: "Dashboard", href: "/student", icon: LayoutDashboard },
          { label: "My Attendance", href: "/student/attendance", icon: CheckCircle },
          { label: "Calendar", href: "/student/calendar", icon: Calendar },
          { label: "Timetable", href: "/student/timetable", icon: Clock },
          { label: "CIE Marks", href: "/student/cie", icon: Award },
          { label: "Requests", href: "/student/requests", icon: FileText },
          { label: "Notifications", href: "/student/notifications", icon: Bell },
          { label: "Profile", href: "/profile", icon: User },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 p-5 shrink-0 select-none bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">UNILOG</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Attendance System</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin" || item.href === "/faculty" || item.href === "/student"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold border border-blue-100 dark:border-blue-900/40"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 border border-transparent"
                )}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card at Bottom */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div className="truncate mr-2">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{user.name}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                {user.role.toLowerCase()}
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign Out"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          {/* Mobile hamburger & brand */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">UNILOG</span>
            </div>
          </div>

          {/* Desktop Search / Breadcrumb spacer */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="capitalize font-medium text-blue-600 dark:text-blue-400">{user.role.toLowerCase()} Portal</span>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 capitalize font-medium">
              {pathname.split("/").filter(Boolean).pop() || "Dashboard"}
            </span>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-3 relative">
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popup Card */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/60 dark:border-blue-800/60">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markNotificationAsRead()}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 py-1">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={cn(
                            "py-2.5 px-2 rounded-xl transition-colors cursor-pointer text-xs",
                            !n.readAt ? "bg-blue-50/50 dark:bg-blue-950/30 font-medium" : "opacity-80 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-slate-900 dark:text-slate-100 font-semibold truncate mr-2">
                              {n.title}
                            </span>
                            {!n.readAt && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {n.body}
                          </p>
                          <span className="text-[9px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                    <Link
                      href={user.role === "STUDENT" ? "/student/notifications" : "/faculty/notifications"}
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User chip */}
            <div className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center font-bold text-xs text-blue-600 dark:text-blue-400">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold leading-tight text-slate-900 dark:text-slate-100">{user.name}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider inline-block">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile slide-out nav */}
        {mobileMenuOpen && (
          <div className="md:hidden p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (Quick access) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-2 px-3">
        {navLinks.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-1.5 rounded-xl text-[10px]",
                isActive ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-600 dark:text-slate-400"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
