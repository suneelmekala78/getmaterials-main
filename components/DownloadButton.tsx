"use client";

import type { ReactNode } from "react";

interface DownloadButtonProps {
  materialId: string;
  fileUrl: string;
  children: ReactNode;
  className?: string;
}

export default function DownloadButton({ materialId, fileUrl, children, className }: DownloadButtonProps) {
  const handleClick = () => {
    // Fire and forget — track the download
    fetch(`/api/materials/${materialId}/download`, { method: "POST" }).catch(() => {});
  };

  return (
    <a
      href={fileUrl}
      download
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
