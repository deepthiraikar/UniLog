"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Megaphone, Plus, Clock, Users, X, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"ALL" | "FACULTY" | "STUDENTS">("ALL");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/announcements");
      if (res.ok) {
        const json = await res.json();
        setAnnouncements(json.announcements || []);
      }
    } catch (e) {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, audience }),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success(`Announcement broadcast to ${json.notifiedCount} recipients!`);
        setDialogOpen(false);
        setTitle("");
        setBody("");
        fetchAnnouncements();
      } else {
        toast.error(json.error || "Failed to create announcement");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Announcement deleted successfully");
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      } else {
        toast.error("Failed to delete announcement");
      }
    } catch (e) {
      toast.error("An error occurred while deleting");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="College Announcements"
        description="Broadcast circulars, notices, and critical attendance alerts across the institution"
        actions={
          <button
            onClick={() => setDialogOpen(true)}
            className="neu-button-primary rounded-xl px-4 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.length === 0 ? (
          <div className="col-span-full neu-raised rounded-2xl p-10 text-center text-xs text-[#64748B]">
            No announcements broadcast yet
          </div>
        ) : (
          announcements.map((a) => (
            <div
              key={a.id}
              className="neu-raised rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full neu-pressed text-[#4F6AE8] font-bold">
                    AUDIENCE: {a.audience}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-[#1E293B] dark:text-[#F1F5F9] mb-2">
                  {a.title}
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                  {a.body}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/5 dark:border-slate-800 flex items-center justify-between text-[11px] text-[#64748B]">
                <span>Logged by Administration</span>
                <div className="flex items-center gap-3">
                  <span className="text-[#4CAF83] font-medium">Broadcast Sent</span>
                  <button
                    onClick={(e) => handleDelete(a.id, e)}
                    className="p-1 rounded-lg text-[#94A3B8] hover:text-[#E05C5C] hover:bg-[#E05C5C]/10 transition-colors cursor-pointer"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Announcement Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="neu-raised rounded-2xl p-6 sm:p-7 max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#4F6AE8]" />
                <h3 className="text-base font-semibold">Publish New Announcement</h3>
              </div>
              <button
                onClick={() => setDialogOpen(false)}
                className="neu-button p-1.5 rounded-lg text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">
                  Target Audience *
                </label>
                <select
                  value={audience}
                  onChange={(e: any) => setAudience(e.target.value)}
                  className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                >
                  <option value="ALL">All College Users (Students & Faculty)</option>
                  <option value="STUDENTS">Students Only</option>
                  <option value="FACULTY">Faculty Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule Update or Attendance Notice"
                  className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">
                  Announcement Message / Body *
                </label>
                <textarea
                  rows={4}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Enter full details of the circular..."
                  className="w-full neu-input rounded-2xl p-3 text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="neu-button px-4 py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="neu-button-primary px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Broadcasting..." : "Publish Announcement"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
