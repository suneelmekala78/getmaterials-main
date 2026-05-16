"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Material {
  _id: string;
  title: string;
}

export function TeacherMaterialActions({ material }: { material: Material }) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/materials/${material._id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleted(true);
      }
    } catch {
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  if (deleted) return <span className="text-xs text-red-500 font-medium">Deleted</span>;

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => router.push(`/teacher/materials/${material._id}/edit`)}
          className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowDelete(true)}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Material"
        message={`Are you sure you want to delete "${material.title}"? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </>
  );
}
