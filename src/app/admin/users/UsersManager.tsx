"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  UserPlus,
  Upload,
  Download,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  X,
  AlertTriangle,
  GraduationCap,
  Users,
  Shield,
} from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";

export function UsersManager() {
  const [activeTab, setActiveTab] = useState<"STUDENT" | "FACULTY" | "ADMIN">("STUDENT");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Dialog states
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "password123",
    role: "STUDENT",
    phone: "",
    rollNo: "",
    branch: "CSE",
    semester: 3,
    section: "A",
    employeeId: "",
    qualification: "Ph.D.",
  });

  // CSV Import preview state
  const [csvPreviewRows, setCsvPreviewRows] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users || []);
      }
    } catch (e) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: activeTab }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("User created successfully!");
        setAddUserOpen(false);
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to create user");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editUser.id,
          name: editUser.name,
          phone: editUser.phone,
          branch: editUser.studentProfile?.branch || editUser.facultyProfile?.branch,
          semester: editUser.studentProfile?.semester,
          section: editUser.studentProfile?.section,
          qualification: editUser.facultyProfile?.qualification,
        }),
      });

      if (res.ok) {
        toast.success("User updated successfully!");
        setEditUser(null);
        fetchUsers();
      } else {
        toast.error("Failed to update user");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          isActive: !user.isActive,
        }),
      });

      if (res.ok) {
        toast.success(`User ${user.isActive ? "deactivated" : "reactivated"}`);
        fetchUsers();
      } else {
        toast.error("Failed to toggle status");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/users?id=${deleteId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("User deleted successfully!");
        setDeleteId(null);
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to delete user");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  // CSV parse handler
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = (results.data as any[]).map((row, index) => {
          const errors: string[] = [];
          if (!row.name || !row.name.trim()) errors.push("Missing name");
          if (!row.email || !row.email.includes("@")) errors.push("Invalid email");
          if (activeTab === "STUDENT" && (!row.rollNo || !row.rollNo.trim())) {
            errors.push("Missing roll number");
          }
          if (activeTab === "FACULTY" && (!row.employeeId || !row.employeeId.trim())) {
            errors.push("Missing employee ID");
          }

          return {
            id: index,
            ...row,
            role: activeTab,
            isValid: errors.length === 0,
            errors,
          };
        });

        setCsvPreviewRows(rows);
      },
      error: () => {
        toast.error("Failed to parse CSV file");
      },
    });
  };

  const handleConfirmImport = async () => {
    const validRows = csvPreviewRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    try {
      setImporting(true);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "BULK_IMPORT",
          users: validRows,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Import completed!");
        setImportOpen(false);
        setCsvPreviewRows([]);
        fetchUsers();
      } else {
        toast.error(data.error || "Import failed");
      }
    } catch (e) {
      toast.error("An error occurred during import");
    } finally {
      setImporting(false);
    }
  };

  const downloadCsvTemplate = () => {
    let csvContent = "";
    if (activeTab === "STUDENT") {
      csvContent = "name,email,rollNo,branch,semester,section,phone\nJohn Doe,john@college.edu,CSE099,CSE,3,A,+91 9876543210\nJane Smith,jane@college.edu,CSE100,CSE,3,A,+91 9876543211";
    } else if (activeTab === "FACULTY") {
      csvContent = "name,email,employeeId,branch,qualification,phone\nDr. Alan Turing,alan@college.edu,FAC099,CSE,Ph.D.,+91 9876500099\nProf. Grace Hopper,grace@college.edu,FAC100,CSE,Ph.D.,+91 9876500100";
    } else {
      csvContent = "name,email,phone\nAdmin Staff,staff@college.edu,+91 9876500000";
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `unilog_${activeTab.toLowerCase()}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered by tab and search
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (u.role !== activeTab) return false;
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      const nameMatch = u.name?.toLowerCase().includes(s);
      const emailMatch = u.email?.toLowerCase().includes(s);
      const rollMatch = u.studentProfile?.rollNo?.toLowerCase().includes(s);
      const empMatch = u.facultyProfile?.employeeId?.toLowerCase().includes(s);
      return nameMatch || emailMatch || rollMatch || empMatch;
    });
  }, [users, activeTab, search]);

  // Columns definition based on activeTab
  const columns: Column<any>[] = useMemo(() => {
    const base: Column<any>[] = [
      {
        header: "User",
        cell: (row) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full neu-raised flex items-center justify-center font-bold text-xs text-[#4F6AE8] shrink-0">
              {row.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-xs text-[#1E293B] dark:text-[#F1F5F9]">
                {row.name}
              </div>
              <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                {row.email}
              </div>
            </div>
          </div>
        ),
      },
    ];

    if (activeTab === "STUDENT") {
      base.push(
        {
          header: "Roll No",
          accessorKey: "studentProfile.rollNo",
          cell: (row) => (
            <span className="font-medium text-xs">
              {row.studentProfile?.rollNo || "—"}
            </span>
          ),
        },
        {
          header: "Class / Section",
          cell: (row) => (
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              {row.studentProfile
                ? `${row.studentProfile.branch} (Sem ${row.studentProfile.semester}-${row.studentProfile.section})`
                : "—"}
            </span>
          ),
        }
      );
    } else if (activeTab === "FACULTY") {
      base.push(
        {
          header: "Employee ID",
          cell: (row) => (
            <span className="font-medium text-xs">
              {row.facultyProfile?.employeeId || "—"}
            </span>
          ),
        },
        {
          header: "Branch & Qualification",
          cell: (row) => (
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              {row.facultyProfile
                ? `${row.facultyProfile.branch} (${row.facultyProfile.qualification || "Faculty"})`
                : "—"}
            </span>
          ),
        }
      );
    }

    base.push(
      {
        header: "Phone",
        cell: (row) => (
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {row.phone || "—"}
          </span>
        ),
      },
      {
        header: "Status",
        cell: (row) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(row);
            }}
            className="cursor-pointer"
            title="Click to toggle status"
          >
            <StatusBadge status={row.isActive ? "ACTIVE" : "ENDED"} />
          </button>
        ),
      },
      {
        header: "Actions",
        isNumeric: true,
        cell: (row) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setEditUser(row)}
              className="neu-button p-1.5 rounded-lg text-[#4F6AE8] hover:bg-[#4F6AE8]/10"
              title="Edit User"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeleteId(row.id)}
              className="neu-button p-1.5 rounded-lg text-[#E05C5C] hover:bg-[#E05C5C]/10"
              title="Delete User"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      }
    );

    return base;
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Directory"
        description="Manage enrolled students, academic faculty, and administrators"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={downloadCsvTemplate}
              className="neu-button rounded-xl px-3 py-2 text-xs font-medium text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5"
              title="Download CSV Template"
            >
              <Download className="w-4 h-4" />
              <span>Template</span>
            </button>
            <button
              onClick={() => {
                setCsvPreviewRows([]);
                setImportOpen(true);
              }}
              className="neu-button rounded-xl px-3 py-2 text-xs font-medium text-[#4F6AE8] flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={() => {
                setFormData({
                  name: "",
                  email: "",
                  password: "password123",
                  role: activeTab,
                  phone: "",
                  rollNo: "",
                  branch: "CSE",
                  semester: 3,
                  section: "A",
                  employeeId: "",
                  qualification: "Ph.D.",
                });
                setAddUserOpen(true);
              }}
              className="neu-button-primary rounded-xl px-4 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add {activeTab.toLowerCase()}</span>
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl neu-inset w-fit">
        <button
          onClick={() => setActiveTab("STUDENT")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === "STUDENT"
              ? "neu-raised text-[#4F6AE8] font-semibold bg-white dark:bg-slate-900"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#1E293B]"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Students ({users.filter((u) => u.role === "STUDENT").length})</span>
        </button>
        <button
          onClick={() => setActiveTab("FACULTY")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === "FACULTY"
              ? "neu-raised text-[#4F6AE8] font-semibold bg-white dark:bg-slate-900"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#1E293B]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Faculty ({users.filter((u) => u.role === "FACULTY").length})</span>
        </button>
        <button
          onClick={() => setActiveTab("ADMIN")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === "ADMIN"
              ? "neu-raised text-[#4F6AE8] font-semibold bg-white dark:bg-slate-900"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#1E293B]"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Admins ({users.filter((u) => u.role === "ADMIN").length})</span>
        </button>
      </div>

      {/* Search and Table */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={`Search ${activeTab.toLowerCase()} by name, email, roll number...`}
      />

      <DataTable
        columns={columns}
        data={filteredUsers}
        pageSize={10}
        emptyMessage={`No ${activeTab.toLowerCase()} records found`}
      />

      {/* Add User Dialog */}
      {addUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="neu-raised rounded-2xl p-6 sm:p-7 max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-slate-800 mb-4">
              <h3 className="text-base font-semibold">
                Add New {activeTab.toLowerCase()}
              </h3>
              <button
                onClick={() => setAddUserOpen(false)}
                className="neu-button p-1.5 rounded-lg text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                    placeholder="name@college.edu"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">
                    Initial Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                {activeTab === "STUDENT" && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">
                        Roll Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.rollNo}
                        onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                        placeholder="e.g. CSE015"
                        className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">
                        Branch
                      </label>
                      <input
                        type="text"
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">
                        Semester (1-8)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                        className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">
                        Section
                      </label>
                      <input
                        type="text"
                        value={formData.section}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  </>
                )}

                {activeTab === "FACULTY" && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">
                        Employee ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.employeeId}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        placeholder="e.g. FAC010"
                        className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">
                        Qualification
                      </label>
                      <input
                        type="text"
                        value={formData.qualification}
                        onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                        placeholder="Ph.D., M.Tech"
                        className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddUserOpen(false)}
                  className="neu-button px-4 py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neu-button-primary px-4 py-2 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="neu-raised rounded-2xl p-6 sm:p-7 max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-slate-800 mb-4">
              <h3 className="text-base font-semibold">Edit {editUser.name}</h3>
              <button
                onClick={() => setEditUser(null)}
                className="neu-button p-1.5 rounded-lg text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editUser.phone || ""}
                  onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                  className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="neu-button px-4 py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neu-button-primary px-4 py-2 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Dialog */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="neu-raised rounded-2xl p-6 sm:p-7 max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#4F6AE8]" />
                <h3 className="text-base font-semibold">
                  Import {activeTab.toLowerCase()} from CSV
                </h3>
              </div>
              <button
                onClick={() => setImportOpen(false)}
                className="neu-button p-1.5 rounded-lg text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4">
              <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-2">
                Select CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="w-full neu-input rounded-xl px-3 py-2 text-xs text-[#1E293B] dark:text-[#F1F5F9]"
              />
            </div>

            {/* Preview table */}
            {csvPreviewRows.length > 0 && (
              <div className="flex-1 overflow-y-auto neu-inset rounded-2xl p-3 my-2">
                <div className="flex items-center justify-between mb-2 text-xs font-semibold">
                  <span>
                    Parsed {csvPreviewRows.length} rows (
                    {csvPreviewRows.filter((r) => r.isValid).length} valid,{" "}
                    {csvPreviewRows.filter((r) => !r.isValid).length} invalid)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-black/10 dark:border-slate-800 text-[#64748B]">
                        <th className="p-1.5">Status</th>
                        <th className="p-1.5">Name</th>
                        <th className="p-1.5">Email</th>
                        <th className="p-1.5">ID / Roll</th>
                        <th className="p-1.5">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreviewRows.map((r, i) => (
                        <tr
                          key={i}
                          className={`border-b border-black/5 dark:border-slate-800 ${
                            r.isValid ? "bg-[#4CAF83]/5" : "bg-[#E05C5C]/10 text-[#E05C5C]"
                          }`}
                        >
                          <td className="p-1.5">
                            {r.isValid ? (
                              <CheckCircle2 className="w-4 h-4 text-[#4CAF83]" />
                            ) : (
                              <XCircle className="w-4 h-4 text-[#E05C5C]" />
                            )}
                          </td>
                          <td className="p-1.5 font-medium">{r.name || "—"}</td>
                          <td className="p-1.5">{r.email || "—"}</td>
                          <td className="p-1.5">{r.rollNo || r.employeeId || "—"}</td>
                          <td className="p-1.5">
                            {r.isValid ? "Ready to import" : r.errors.join(", ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-slate-800">
              <span className="text-xs text-[#64748B]">
                Invalid rows will be skipped automatically
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setImportOpen(false)}
                  className="neu-button px-4 py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={importing || csvPreviewRows.filter((r) => r.isValid).length === 0}
                  onClick={handleConfirmImport}
                  className="neu-button-primary px-4 py-2 rounded-xl text-xs font-medium cursor-pointer disabled:opacity-40"
                >
                  {importing ? "Importing..." : "Confirm Import"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete User Account"
        description="Are you sure you want to delete this user? This will remove all their profile associations and enrollment data permanently."
        confirmLabel="Delete User"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
