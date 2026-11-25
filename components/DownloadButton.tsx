"use client";

import type { ReactNode } from "react";
import { useState } from "react";

interface DownloadButtonProps {
  materialId: string;
  fileUrl: string;
  fileName?: string;
  /** Attachment index when a material has multiple files. */
  index?: number;
  children: ReactNode;
  className?: string;
}

export default function DownloadButton({
  materialId,
  fileUrl,
  fileName,
  index = 0,
  children,
  className,
}: DownloadButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/materials/${encodeURIComponent(materialId)}/download-link?attachment=1&index=${Math.max(0, index)}`,
      );
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        filename?: string;
        error?: string;
      };
      const url = res.ok && data.url ? data.url : fileUrl;
      const name = data.filename || fileName || "material";

      // Open attachment-disposition URL in a new tab so the browser downloads
      // instead of navigating away from the material page.
      const a = document.createElement("a");
      a.href = url;
      a.rel = "noopener";
      a.target = "_blank";
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    } finally {
      setBusy(false);
    }
  };

  return (
    <a
      href={fileUrl}
      download={fileName || true}
      onClick={handleClick}
      className={className}
      aria-busy={busy}
    >
      {children}
    </a>
  );
}
