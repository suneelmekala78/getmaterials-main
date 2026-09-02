export function isPdfFile(att: { type?: string; fileUrl?: string; mimeType?: string; fileName?: string }) {
  const hay = `${att.fileName || ""} ${att.mimeType || ""} ${att.fileUrl || ""}`.toLowerCase();
  return att.type === "pdf" || hay.includes("application/pdf") || /\.pdf(\?|$)/.test(hay);
}

export function isOfficeFile(att: { type?: string; fileUrl?: string; mimeType?: string; fileName?: string }) {
  if (!att.fileUrl || isPdfFile(att)) return false;
  const hay = `${att.fileName || ""} ${att.mimeType || ""} ${att.fileUrl || ""}`.toLowerCase();
  return (
    att.type === "assignment" ||
    /\.(docx?|pptx?|xlsx?|txt)(\?|$)/.test(hay) ||
    hay.includes("officedocument") ||
    hay.includes("msword") ||
    hay.includes("ms-excel") ||
    hay.includes("ms-powerpoint")
  );
}

export function officeKindLabel(att: { fileUrl?: string; mimeType?: string; fileName?: string; type?: string }) {
  const hay = `${att.fileName || ""} ${att.mimeType || ""} ${att.fileUrl || ""}`.toLowerCase();
  if (/\.pptx?(\?|$)/.test(hay) || hay.includes("presentationml") || hay.includes("ms-powerpoint")) return "PowerPoint";
  if (/\.xlsx?(\?|$)/.test(hay) || hay.includes("spreadsheetml") || hay.includes("ms-excel")) return "Excel";
  if (/\.txt(\?|$)/.test(hay) || hay.includes("text/plain")) return "Text";
  if (/\.docx?(\?|$)/.test(hay) || hay.includes("wordprocessingml") || hay.includes("msword")) return "Word";
  return "Document";
}

export function officeViewerUrl(fileUrl: string) {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
}
