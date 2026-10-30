"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  Building2,
  GraduationCap,
  Layers,
  BookOpen,
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

type AcademicTab = "DEPARTMENTS" | "PROGRAMS" | "SECTIONS" | "SUBJECTS" | "ASSIGNMENTS";

export function AcademicsManager() {
  const [activeTab, setActiveTab] = useState<AcademicTab>("DEPARTMENTS");
  const [data, setData] = useState<any>({
    departments: [],
    programs: [],
    sections: [],
    subjects: [],
    assignments: [],
    facultyList: [],
  });
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ entity: string; id: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchAcademics();
  }, []);

  const fetchAcademics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/academics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      toast.error("Failed to load academic data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let entity = "DEPARTMENT";
      if (activeTab === "PROGRAMS") entity = "PROGRAM";
      if (activeTab === "SECTIONS") entity = "SECTION";
      if (activeTab === "SUBJECTS") entity = "SUBJECT";
      if (activeTab === "ASSIGNMENTS") entity = "ASSIGNMENT";

      const res = await fetch("/api/admin/academics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity, ...formData }),
      });

      const resJson = await res.json();
      if (res.ok) {
        toast.success("Record created successfully!");
        setAddModalOpen(false);
        setFormData({});
        fetchAcademics();
      } else {
        toast.error(resJson.error || "Failed to create record");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      let entity = "DEPARTMENT";
      if (activeTab === "PROGRAMS") entity = "PROGRAM";
      if (activeTab === "SECTIONS") entity = "SECTION";
      if (activeTab === "SUBJECTS") entity = "SUBJECT";
      if (activeTab === "ASSIGNMENTS") entity = "ASSIGNMENT";

      const res = await fetch("/api/admin/academics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity, id: editItem.id, ...formData }),
      });

      const resJson = await res.json();
      if (res.ok) {
        toast.success("Record updated successfully!");
        setEditItem(null);
        setFormData({});
        fetchAcademics();
      } else {
        toast.error(resJson.error || "Failed to update record");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(
        `/api/admin/academics?entity=${deleteTarget.entity}&id=${deleteTarget.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("Record deleted successfully!");
        setDeleteTarget(null);
        fetchAcademics();
      } else {
        toast.error("Failed to delete record");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  // Build columns per tab
  const getColumns = (): Column<any>[] => {
    switch (activeTab) {
      case "DEPARTMENTS":
        return [
          { header: "Code", accessorKey: "code" },
          { header: "Department Name", accessorKey: "name" },
          {
            header: "Actions",
            isNumeric: true,
            cell: (row) => (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setFormData({ name: row.name, code: row.code });
                    setEditItem(row);
                  }}
                  className="neu-button p-1.5 rounded-lg text-[#4F6AE8]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget({ entity: "DEPARTMENT", id: row.id })}
                  className="neu-button p-1.5 rounded-lg text-[#E05C5C]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ),
          },
        ];
      case "PROGRAMS":
        return [
          { header: "Program Name", accessorKey: "name" },
          {
            header: "Department",
            cell: (row) => (
              <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {row.department?.name} ({row.department?.code})
              </span>
            ),
          },
          {
            header: "Actions",
            isNumeric: true,
            cell: (row) => (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setFormData({ name: row.name, departmentId: row.departmentId });
                    setEditItem(row);
                  }}
                  className="neu-button p-1.5 rounded-lg text-[#4F6AE8]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget({ entity: "PROGRAM", id: row.id })}
                  className="neu-button p-1.5 rounded-lg text-[#E05C5C]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ),
          },
        ];
      case "SECTIONS":
        return [
          { header: "Section Name", accessorKey: "name" },
          { header: "Semester", isNumeric: true, accessorKey: "semester" },
          { header: "Section Letter", accessorKey: "section" },
          {
            header: "Program",
            cell: (row) => (
              <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {row.program?.name}
              </span>
            ),
          },
          {
            header: "Enrolled Students",
            isNumeric: true,
            cell: (row) => row.enrollments?.length || 0,
          },
          {
            header: "Actions",
            isNumeric: true,
            cell: (row) => (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setFormData({
                      name: row.name,
                      semester: row.semester,
                      section: row.section,
                      programId: row.programId,
                    });
                    setEditItem(row);
                  }}
                  className="neu-button p-1.5 rounded-lg text-[#4F6AE8]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget({ entity: "SECTION", id: row.id })}
                  className="neu-button p-1.5 rounded-lg text-[#E05C5C]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ),
          },
        ];
      case "SUBJECTS":
        return [
          { header: "Subject Code", accessorKey: "code" },
          { header: "Subject Title", accessorKey: "name" },
          {
            header: "Department",
            cell: (row) => (
              <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {row.department?.name}
              </span>
            ),
          },
          {
            header: "Actions",
            isNumeric: true,
            cell: (row) => (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setFormData({
                      name: row.name,
                      code: row.code,
                      departmentId: row.departmentId,
                    });
                    setEditItem(row);
                  }}
                  className="neu-button p-1.5 rounded-lg text-[#4F6AE8]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget({ entity: "SUBJECT", id: row.id })}
                  className="neu-button p-1.5 rounded-lg text-[#E05C5C]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ),
          },
        ];
      case "ASSIGNMENTS":
        return [
          {
            header: "Faculty Member",
            cell: (row) => (
              <div className="flex items-center gap-2">
                <span className="font-semibold">{row.faculty?.user?.name}</span>
                <span className="text-[11px] text-[#64748B]">
                  ({row.faculty?.employeeId})
                </span>
              </div>
            ),
          },
          {
            header: "Assigned Subject",
            cell: (row) => (
              <span>
                {row.subject?.code} - {row.subject?.name}
              </span>
            ),
          },
          {
            header: "Class Section",
            cell: (row) => (
              <span className="px-2.5 py-0.5 rounded-full neu-pressed text-[#4F6AE8] text-[11px] font-bold">
                {row.classSection?.name}
              </span>
            ),
          },
          {
            header: "Actions",
            isNumeric: true,
            cell: (row) => (
              <div className="flex items-center justify-end">
                <button
                  onClick={() => setDeleteTarget({ entity: "ASSIGNMENT", id: row.id })}
                  className="neu-button p-1.5 rounded-lg text-[#E05C5C]"
                  title="Remove Assignment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ),
          },
        ];
      default:
        return [];
    }
  };

  const getActiveData = () => {
    switch (activeTab) {
      case "DEPARTMENTS":
        return data.departments || [];
      case "PROGRAMS":
        return data.programs || [];
      case "SECTIONS":
        return data.sections || [];
      case "SUBJECTS":
        return data.subjects || [];
      case "ASSIGNMENTS":
        return data.assignments || [];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Structure"
        description="Configure departments, programs, class sections, subjects, and faculty assignments"
        actions={
          <button
            onClick={() => {
              setFormData({});
              setAddModalOpen(true);
            }}
            className="neu-button-primary rounded-xl px-4 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add {activeTab.slice(0, -1).toLowerCase()}</span>
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl neu-inset overflow-x-auto">
        <button
          onClick={() => setActiveTab("DEPARTMENTS")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === "DEPARTMENTS"
              ? "neu-raised text-[#4F6AE8] font-semibold bg-white dark:bg-slate-900"
              : "text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Departments ({data.departments?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("PROGRAMS")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === "PROGRAMS"
              ? "neu-raised text-[#4F6AE8] font-semibold bg-white dark:bg-slate-900"
              : "text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Programs ({data.programs?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("SECTIONS")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === "SECTIONS"
              ? "neu-raised text-[#4F6AE8] font-semibold bg-white dark:bg-slate-900"
              : "text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Class Sections ({data.sections?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("SUBJECTS")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === "SUBJECTS"
              ? "neu-raised text-[#4F6AE8] font-semibold bg-white dark:bg-slate-900"
              : "text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Subjects ({data.subjects?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("ASSIGNMENTS")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === "ASSIGNMENTS"
              ? "neu-raised text-[#4F6AE8] font-semibold bg-white dark:bg-slate-900"
              : "text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Faculty Assignments ({data.assignments?.length || 0})</span>
        </button>
      </div>

      <DataTable
        columns={getColumns()}
        data={getActiveData()}
        pageSize={10}
        emptyMessage={`No ${activeTab.toLowerCase()} configured yet`}
      />

      {/* Add / Edit Dialog */}
      {(addModalOpen || editItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="neu-raised rounded-2xl p-6 sm:p-7 max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-slate-800 mb-4">
              <h3 className="text-base font-semibold">
                {editItem ? "Edit" : "Add"} {activeTab.slice(0, -1).toLowerCase()}
              </h3>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setEditItem(null);
                }}
                className="neu-button p-1.5 rounded-lg text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editItem ? handleUpdate : handleCreate} className="space-y-4">
              {activeTab === "DEPARTMENTS" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">
                      Department Code (e.g. CSE) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code || ""}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">
                      Department Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </>
              )}

              {activeTab === "PROGRAMS" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">
                      Program Name (e.g. B.Tech CSE) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">
                      Department *
                    </label>
                    <select
                      required
                      value={formData.departmentId || ""}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                      className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="">Select Department</option>
                      {data.departments?.map((d: any) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {activeTab === "SECTIONS" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">
                      Section Identifier (e.g. CSE-3A) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-[#64748B] mb-1">
                        Semester (1-8) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        required
                        value={formData.semester || 3}
                        onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                        className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#64748B] mb-1">
                        Section Letter (A/B/C) *
                      </label>
                      <input
                        type="text"
                        maxLength={2}
                        required
                        value={formData.section || "A"}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">
                      Program *
                    </label>
                    <select
                      required
                      value={formData.programId || ""}
                      onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                      className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="">Select Program</option>
                      {data.programs?.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {activeTab === "SUBJECTS" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">
                      Subject Code (e.g. CS301) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code || ""}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">
                      Subject Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">
                      Department *
                    </label>
                    <select
                      required
                      value={formData.departmentId || ""}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                      className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="">Select Department</option>
                      {data.departments?.map((d: any) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {activeTab === "ASSIGNMENTS" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">
                      Faculty Member *
                    </label>
                    <select
                      required
                      value={formData.facultyId || ""}
                      onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                      className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="">Select Faculty</option>
                      {data.facultyList?.map((f: any) => (
                        <option key={f.id} value={f.id}>
                          {f.user?.name} ({f.employeeId})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">
                      Subject *
                    </label>
                    <select
                      required
                      value={formData.subjectId || ""}
                      onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                      className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="">Select Subject</option>
                      {data.subjects?.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.code} - {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">
                      Class Section *
                    </label>
                    <select
                      required
                      value={formData.classSectionId || ""}
                      onChange={(e) => setFormData({ ...formData, classSectionId: e.target.value })}
                      className="w-full neu-input rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="">Select Class Section</option>
                      {data.sections?.map((sec: any) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.name} (Sem {sec.semester}-{sec.section})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditItem(null);
                  }}
                  className="neu-button px-4 py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neu-button-primary px-4 py-2 rounded-xl text-xs font-medium cursor-pointer"
                >
                  {editItem ? "Save Changes" : "Create Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Academic Record"
        description="Are you sure you want to delete this record? Associated schedules and assignments may also be affected."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
