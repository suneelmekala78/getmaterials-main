"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, FilePenLine, Send, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import toast from "react-hot-toast";

interface Material {
  _id: string;
  title: string;
  status?: string;
}

export function TeacherMaterialActions({
  material,
  editHref,
  role,
}: {
  material: Material;
  editHref?: string;
  role?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(material.status || "draft");
  const [showDelete, setShowDelete] = useState(false);
  const [busy, setBusy] = useState<"delete" | "draft" | "publish" | null>(null);
  const [deleted, setDeleted] = useState(false);
  const href = editHref || `/teacher/materials/${material._id}/edit`;
  const isStudent = role === "student";

  const patchStatus = async (next: "draft" | "published") => {
    setBusy(next === "draft" ? "draft" : "publish");
    try {
      const res = await fetch(`/api/materials/${material._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not update status");
      setStatus(isStudent && next === "published" ? "under_review" : next);
      toast.success(
        next === "draft"
          ? "Saved as draft"
          : isStudent
            ? "Submitted for review"
            : "Published",
      );
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    setBusy("delete");
    try {
      const res = await fetch(`/api/materials/${material._id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleted(true);
        toast.success("Material deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete material");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(null);
      setShowDelete(false);
    }
  };

  if (deleted) return <span className="text-xs text-red-500 font-medium">Deleted</span>;

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => router.push(href)}
          className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
        {status === "published" ? (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => patchStatus("draft")}
            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
            title="Set as draft"
          >
            <FilePenLine className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => patchStatus("published")}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
            title={isStudent ? "Submit for review" : "Publish"}
          >
            <Send className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowDelete(true)}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Material"
        message={`Are you sure you want to delete "${material.title}"? This action cannot be undone.`}
        confirmLabel={busy === "delete" ? "Deleting..." : "Delete"}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </>
  );
}
