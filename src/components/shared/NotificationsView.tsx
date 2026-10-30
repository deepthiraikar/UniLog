"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Bell, Check, CheckCheck, Clock, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function NotificationsView() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id?: string) => {
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
        toast.success("All notifications marked as read");
      }
    } catch (e) {
      toast.error("Error updating notifications");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "SUCCESS":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Notifications & Circulars"
        description="Important institutional alerts, timetable updates, and attendance warnings"
        actions={
          unreadCount > 0 ? (
            <button
              onClick={() => markAsRead()}
              className="rounded-xl px-3.5 py-1.5 text-xs font-medium border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All as Read</span>
            </button>
          ) : undefined
        }
      />

      <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => {
            const isUnread = !n.readAt;

            return (
              <div
                key={n.id}
                onClick={() => isUnread && markAsRead(n.id)}
                className={cn(
                  "py-4 flex items-start gap-4 transition-colors cursor-pointer",
                  isUnread ? "bg-blue-50/50 dark:bg-blue-950/20 rounded-xl p-4 my-1 border border-blue-100 dark:border-blue-900/30" : "opacity-85 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                )}
              >
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {n.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      </span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {n.body}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
