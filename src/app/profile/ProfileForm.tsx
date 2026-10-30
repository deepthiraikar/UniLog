"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { User, Mail, Phone, Building, Award, Calendar, Hash, Save, Shield } from "lucide-react";
import { toast } from "sonner";

export function ProfileForm() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState("");
  const [qualification, setQualification] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        setUserData(u);
        setName(u.name || "");
        setPhone(u.phone || "");
        if (u.facultyProfile) {
          setBranch(u.facultyProfile.branch || "");
          setQualification(u.facultyProfile.qualification || "");
        }
      }
    } catch (e) {
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          branch,
          qualification,
        }),
      });

      if (res.ok) {
        toast.success("Profile saved successfully!");
        fetchProfile();
      } else {
        toast.error("Failed to update profile");
      }
    } catch (e) {
      toast.error("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <div className="h-8 w-48 rounded-xl neu-raised bg-black/5 dark:bg-white/5 animate-pulse" />
        <div className="h-64 rounded-2xl neu-raised bg-black/5 dark:bg-white/5 animate-pulse" />
      </div>
    );
  }

  const role = userData?.role;
  const isFaculty = role === "FACULTY";
  const isStudent = role === "STUDENT";
  const sp = userData?.studentProfile;
  const fp = userData?.facultyProfile;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Personal Profile"
        description="View institutional records and update personal contact information"
      />

      <div className="neu-raised rounded-2xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Card Profile Summary */}
          <div className="flex items-center gap-4 pb-6 border-b border-black/5 dark:border-slate-800">
            <div className="w-16 h-16 rounded-2xl neu-inset flex items-center justify-center text-[#4F6AE8] text-2xl font-bold">
              {userData?.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{userData?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2.5 py-0.5 rounded-full neu-pressed text-[#4F6AE8] font-bold uppercase">
                  {role}
                </span>
                <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  {userData?.email}
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5 ml-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full neu-input rounded-xl pl-10 pr-4 py-2 text-xs text-[#1E293B] dark:text-[#F1F5F9]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5 ml-1">
                Institutional Email (Read Only)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="email"
                  disabled
                  value={userData?.email || ""}
                  className="w-full neu-inset rounded-xl pl-10 pr-4 py-2 text-xs text-[#64748B] dark:text-[#94A3B8] opacity-75 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5 ml-1">
                Phone Contact Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98000 00000"
                  className="w-full neu-input rounded-xl pl-10 pr-4 py-2 text-xs text-[#1E293B] dark:text-[#F1F5F9]"
                />
              </div>
            </div>

            {/* Student specific fields */}
            {isStudent && sp && (
              <>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5 ml-1">
                    Roll Number (Read Only)
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-3 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type="text"
                      disabled
                      value={sp.rollNo}
                      className="w-full neu-inset rounded-xl pl-10 pr-4 py-2 text-xs text-[#64748B] dark:text-[#94A3B8] opacity-75 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5 ml-1">
                    Branch / Section (Read Only)
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-3 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type="text"
                      disabled
                      value={`${sp.branch} - Semester ${sp.semester} (${sp.section})`}
                      className="w-full neu-inset rounded-xl pl-10 pr-4 py-2 text-xs text-[#64748B] dark:text-[#94A3B8] opacity-75 cursor-not-allowed"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Faculty specific fields */}
            {isFaculty && fp && (
              <>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5 ml-1">
                    Employee ID (Read Only)
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-3 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type="text"
                      disabled
                      value={fp.employeeId}
                      className="w-full neu-inset rounded-xl pl-10 pr-4 py-2 text-xs text-[#64748B] dark:text-[#94A3B8] opacity-75 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5 ml-1">
                    Academic Branch
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-3 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full neu-input rounded-xl pl-10 pr-4 py-2 text-xs text-[#1E293B] dark:text-[#F1F5F9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5 ml-1">
                    Academic Qualifications
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3.5 top-3 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type="text"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g. Ph.D., M.Tech"
                      className="w-full neu-input rounded-xl pl-10 pr-4 py-2 text-xs text-[#1E293B] dark:text-[#F1F5F9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5 ml-1">
                    Joining Date (Read Only)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type="text"
                      disabled
                      value={fp.joiningDate ? new Date(fp.joiningDate).toLocaleDateString() : "N/A"}
                      className="w-full neu-inset rounded-xl pl-10 pr-4 py-2 text-xs text-[#64748B] dark:text-[#94A3B8] opacity-75 cursor-not-allowed"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="neu-button-primary rounded-xl px-5 py-2.5 text-xs font-medium flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
