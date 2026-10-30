"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTheme } from "next-themes";
import {
  Sliders,
  Calendar,
  Save,
  Plus,
  Trash2,
  Sun,
  Moon,
  Laptop,
  X,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

export function SettingsManager() {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [savingPolicy, setSavingPolicy] = useState(false);

  // Policy Form
  const [policy, setPolicy] = useState({
    minPercentage: 75,
    lateAfterMinutes: 10,
    editWindowMinutes: 30,
    gracePeriodDays: 0,
  });

  // Holidays
  const [holidays, setHolidays] = useState<any[]>([]);
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const json = await res.json();
        if (json.policy) setPolicy(json.policy);
        if (json.holidays) setHolidays(json.holidays);
      }
    } catch (e) {
      toast.error("Failed to load system settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingPolicy(true);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policy),
      });

      if (res.ok) {
        toast.success("Attendance policy updated and active immediately!");
      } else {
        toast.error("Failed to update policy");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayDate || !newHolidayName) return;

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_HOLIDAY",
          date: newHolidayDate,
          name: newHolidayName,
        }),
      });

      if (res.ok) {
        toast.success("Holiday added to academic calendar");
        setHolidayModalOpen(false);
        setNewHolidayName("");
        setNewHolidayDate("");
        fetchSettings();
      } else {
        toast.error("Failed to add holiday");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_HOLIDAY",
          holidayId: id,
        }),
      });

      if (res.ok) {
        toast.success("Holiday removed");
        fetchSettings();
      } else {
        toast.error("Failed to delete holiday");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Institutional Settings & Policies"
        description="Configure attendance thresholds, faculty edit windows, holiday calendar, and visual theme"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Policy Form */}
        <div className="neu-raised rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5 dark:border-slate-800">
            <Sliders className="w-5 h-5 text-[#4F6AE8]" />
            <h3 className="text-sm font-semibold">Attendance Threshold Rules</h3>
          </div>

          <form onSubmit={handleSavePolicy} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1">
                Minimum Attendance Threshold (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                step="0.5"
                required
                value={policy.minPercentage}
                onChange={(e) =>
                  setPolicy({ ...policy, minPercentage: parseFloat(e.target.value) })
                }
                className="w-full neu-input rounded-xl px-3 py-2 text-xs font-semibold"
              />
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Students below this percentage will be flagged as At-Risk
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1">
                Marked Late After (Minutes)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                required
                value={policy.lateAfterMinutes}
                onChange={(e) =>
                  setPolicy({ ...policy, lateAfterMinutes: parseInt(e.target.value, 10) })
                }
                className="w-full neu-input rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1">
                Faculty Edit Window (Minutes after session end)
              </label>
              <input
                type="number"
                min="5"
                max="1440"
                required
                value={policy.editWindowMinutes}
                onChange={(e) =>
                  setPolicy({ ...policy, editWindowMinutes: parseInt(e.target.value, 10) })
                }
                className="w-full neu-input rounded-xl px-3 py-2 text-xs"
              />
              <p className="text-[11px] text-[#94A3B8] mt-1">
                After this window, session edits require administrator override
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1">
                Grace Period Days
              </label>
              <input
                type="number"
                min="0"
                max="30"
                required
                value={policy.gracePeriodDays}
                onChange={(e) =>
                  setPolicy({ ...policy, gracePeriodDays: parseInt(e.target.value, 10) })
                }
                className="w-full neu-input rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPolicy}
                className="w-full neu-button-primary py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingPolicy ? "Saving Policy..." : "Save Policy Configuration"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Visual Theme & Holidays */}
        <div className="space-y-6">
          {/* Visual Theme Selection */}
          <div className="neu-raised rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold">Visual Interface Theme</h3>
            <p className="text-xs text-[#64748B]">
              Persist your preferred neumorphic palette
            </p>
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <button
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all cursor-pointer ${
                  theme === "light"
                    ? "neu-inset text-[#4F6AE8] font-bold"
                    : "neu-flat text-[#64748B]"
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="text-xs">Light</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all cursor-pointer ${
                  theme === "dark"
                    ? "neu-inset text-[#4F6AE8] font-bold"
                    : "neu-flat text-[#64748B]"
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="text-xs">Dark</span>
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all cursor-pointer ${
                  theme === "system"
                    ? "neu-inset text-[#4F6AE8] font-bold"
                    : "neu-flat text-[#64748B]"
                }`}
              >
                <Laptop className="w-5 h-5" />
                <span className="text-xs">System</span>
              </button>
            </div>
          </div>

          {/* Holiday Calendar */}
          <div className="neu-raised rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#4F6AE8]" />
                <h3 className="text-sm font-semibold">Academic Holidays</h3>
              </div>
              <button
                onClick={() => setHolidayModalOpen(true)}
                className="neu-button px-3 py-1.5 rounded-xl text-xs text-[#4F6AE8] font-medium flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Holiday</span>
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2">
              {holidays.length === 0 ? (
                <p className="text-xs text-[#64748B] py-4 text-center">
                  No holidays configured
                </p>
              ) : (
                holidays.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-2xl neu-inset flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#1E293B] dark:text-[#F1F5F9]">
                        {h.name}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {new Date(h.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteHoliday(h.id)}
                      className="neu-button p-1.5 rounded-lg text-[#E05C5C] hover:bg-[#E05C5C]/10 cursor-pointer"
                      title="Remove Holiday"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Holiday Dialog */}
      {holidayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="neu-raised rounded-2xl p-6 max-w-sm w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-semibold">Add Academic Holiday</h3>
              <button
                onClick={() => setHolidayModalOpen(false)}
                className="neu-button p-1.5 rounded-lg text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddHoliday} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">
                  Holiday Name *
                </label>
                <input
                  type="text"
                  required
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                  placeholder="e.g. Republic Day"
                  className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                  className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setHolidayModalOpen(false)}
                  className="neu-button px-4 py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neu-button-primary px-4 py-2 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
