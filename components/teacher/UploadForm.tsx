"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  Video,
  Link2,
  Image,
  ClipboardCheck,
  X,
  CheckCircle,
  Plus,
} from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";

interface Subject {
  id: string;
  name: string;
  slug: string;
}

interface Chapter {
  id: string;
  title: string;
  subject: string;
}

interface College {
  id: string;
  name: string;
  code: string;
}

interface UploadFormProps {
  subjects: Subject[];
  chapters: Chapter[];
  colleges: College[];
}

interface AttachmentItem {
  id: string;
  type: "pdf" | "video" | "link" | "image" | "assignment";
  file?: File;
  externalUrl?: string;
}

const materialTypes = [
  { value: "pdf", label: "PDF / Notes", icon: FileText, color: "border-red-200 bg-red-50 text-red-700" },
  { value: "video", label: "Video Link", icon: Video, color: "border-blue-200 bg-blue-50 text-blue-700" },
  { value: "link", label: "External Link", icon: Link2, color: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { value: "image", label: "Image", icon: Image, color: "border-purple-200 bg-purple-50 text-purple-700" },
  { value: "assignment", label: "Assignment", icon: ClipboardCheck, color: "border-amber-200 bg-amber-50 text-amber-700" },
];

export function UploadForm({ subjects, chapters, colleges }: UploadFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    chapter: "",
    college: "",
    tags: "",
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([
    { id: crypto.randomUUID(), type: "pdf" },
  ]);

  const filteredChapters = chapters.filter(
    (c) => c.subject === formData.subject
  );

  const addAttachment = () => {
    setAttachments([
      ...attachments,
      { id: crypto.randomUUID(), type: "pdf" },
    ]);
  };

  const removeAttachment = (id: string) => {
    if (attachments.length <= 1) return;
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const updateAttachment = (id: string, updates: Partial<AttachmentItem>) => {
    setAttachments(
      attachments.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 100 * 1024 * 1024) {
        setError("File size must be under 100MB");
        return;
      }
      updateAttachment(id, { file: selected });
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Upload thumbnail if provided
      let thumbnailUrl = "";
      if (thumbnail) {
        const thumbData = new FormData();
        thumbData.append("file", thumbnail);
        thumbData.append("folder", "thumbnails");

        const thumbRes = await fetch("/api/upload", {
          method: "POST",
          body: thumbData,
        });

        if (!thumbRes.ok) {
          const data = await thumbRes.json();
          throw new Error(data.error || "Failed to upload thumbnail");
        }

        const { fileUrl } = await thumbRes.json();
        thumbnailUrl = fileUrl;
      }

      // Upload all files and collect URLs
      const uploadedAttachments = [];

      for (const attachment of attachments) {
        if (attachment.type === "video" || attachment.type === "link") {
          if (!attachment.externalUrl) {
            throw new Error("Please provide a URL for all link/video attachments");
          }
          uploadedAttachments.push({
            type: attachment.type,
            externalUrl: attachment.externalUrl,
          });
        } else {
          if (!attachment.file) {
            throw new Error("Please select a file for all file attachments");
          }
          const uploadData = new FormData();
          uploadData.append("file", attachment.file);
          uploadData.append("folder", "materials");

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: uploadData,
          });

          if (!uploadRes.ok) {
            const data = await uploadRes.json();
            throw new Error(data.error || "Failed to upload file");
          }

          const { fileUrl } = await uploadRes.json();
          uploadedAttachments.push({
            type: attachment.type,
            fileUrl,
            fileName: attachment.file.name,
            fileSize: attachment.file.size,
            mimeType: attachment.file.type,
          });
        }
      }

      // Use first attachment as the primary file/url for backward compat
      const primary = uploadedAttachments[0];

      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: primary?.type || "pdf",
          subject: formData.subject,
          chapter: formData.chapter,
          college: formData.college || undefined,
          externalUrl: primary?.externalUrl || undefined,
          fileUrl: primary?.fileUrl || undefined,
          thumbnailUrl: thumbnailUrl || undefined,
          attachments: uploadedAttachments.slice(1),
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to upload material");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/teacher/materials");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Material Uploaded!
        </h2>
        <p className="text-slate-500">
          Your material has been published and is now available to students.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
          <X className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Material type - removed, type is derived from first attachment */}

      {/* Details */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Algebra Basics - Complete Notes"
            required
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Description
          </label>
          <RichTextEditor
            content={formData.description}
            onChange={(html) => setFormData({ ...formData, description: html })}
            placeholder="Brief description of this material..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Subject *
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value, chapter: "" })}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Chapter *
            </label>
            <select
              value={formData.chapter}
              onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
              required
              disabled={!formData.subject}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
            >
              <option value="">Select chapter</option>
              {filteredChapters.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            College (optional)
          </label>
          <select
            value={formData.college}
            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          >
            <option value="">Not assigned to any college</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="e.g., algebra, equations, basics"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
      </div>

      {/* Thumbnail */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <label className="block text-sm font-semibold text-slate-900 mb-3">
          Thumbnail (optional)
        </label>
        <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-violet-300 transition-colors">
          {thumbnail ? (
            <div className="flex items-center justify-center gap-3">
              <img
                src={URL.createObjectURL(thumbnail)}
                alt="Thumbnail preview"
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="text-left">
                <p className="text-sm font-medium text-slate-900">{thumbnail.name}</p>
                <p className="text-xs text-slate-500">
                  {(thumbnail.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setThumbnail(null)}
                className="p-1 text-slate-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Image className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-600 mb-1">Upload a thumbnail image</p>
              <p className="text-xs text-slate-400">JPG, PNG or WebP (max 5MB)</p>
              <input
                type="file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    if (f.size > 5 * 1024 * 1024) {
                      setError("Thumbnail must be under 5MB");
                      return;
                    }
                    setThumbnail(f);
                    setError("");
                  }
                }}
                accept=".jpg,.jpeg,.png,.webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </>
          )}
        </div>
      </div>

      {/* File/URL attachments */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-semibold text-slate-900">
            Attachments ({attachments.length})
          </label>
          <button
            type="button"
            onClick={addAttachment}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700"
          >
            <Plus className="w-3.5 h-3.5" /> Add more
          </button>
        </div>

        <div className="space-y-4">
          {attachments.map((attachment, index) => (
            <div
              key={attachment.id}
              className="border border-slate-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500">
                  Attachment {index + 1}
                </span>
                {attachments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAttachment(attachment.id)}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Type selector for this attachment */}
              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {materialTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateAttachment(attachment.id, { type: type.value as AttachmentItem["type"], file: undefined, externalUrl: undefined })}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-[10px] font-medium transition-all ${
                      attachment.type === type.value
                        ? type.color + " border-current"
                        : "border-slate-100 text-slate-400 hover:border-slate-200"
                    }`}
                  >
                    <type.icon className="w-3.5 h-3.5" />
                    {type.label}
                  </button>
                ))}
              </div>

              {/* File or URL input */}
              {(attachment.type === "video" || attachment.type === "link") ? (
                <input
                  type="url"
                  value={attachment.externalUrl || ""}
                  onChange={(e) => updateAttachment(attachment.id, { externalUrl: e.target.value })}
                  placeholder={attachment.type === "video" ? "https://youtube.com/watch?v=..." : "https://..."}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              ) : (
                <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-violet-300 transition-colors">
                  {attachment.file ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5 text-violet-500" />
                      <div className="text-left">
                        <p className="text-xs font-medium text-slate-900">{attachment.file.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {(attachment.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateAttachment(attachment.id, { file: undefined })}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                      <p className="text-xs text-slate-500">Click to upload (max 100MB)</p>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(attachment.id, e)}
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload Material"}
      </button>
    </form>
  );
}
