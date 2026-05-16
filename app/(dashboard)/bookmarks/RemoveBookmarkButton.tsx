"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RemoveBookmarkButton({ materialId }: { materialId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    setLoading(true);
    await fetch("/api/bookmarks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId }),
    });
    router.refresh();
  };

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
