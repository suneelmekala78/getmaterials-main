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
  AlertCircle,
} from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import toast from "react-hot-toast";

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
  assignedColleges?: string[]; // college IDs the teacher has access to
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

export function UploadForm({ subjects: initialSubjects, chapters: initialChapters, colleges, assignedColleges = [] }: UploadFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [subjects, setSubjects] = useState(initialSubjects);
  const [chapters, setChapters] = useState(initialChapters);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [uploadTarget, setUploadTarget] = useState<"all" | "college">("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    chapter: "",
    college: "",
    branch: "",
    semester: "",
    tags: "",
    materialCategory: "notes",
    program: "btech",
    batch: "",
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([
    { id: crypto.randomUUID(), type: "pdf" },
  ]);

  // Inline add subject/chapter
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCategory, setNewSubjectCategory] = useState("engineering");
  const [addingSubject, setAddingSubject] = useState(false);

  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [addingChapter, setAddingChapter] = useState(false);

  const filteredChapters = chapters.filter(
    (c) => c.subject === formData.subject
  );

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      toast.error("Please enter a subject name");
      return;
    }
    setAddingSubject(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubjectName.trim(), category: newSubjectCategory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add subject");
      const newSubject = { id: data.subject._id.toString(), name: data.subject.name, slug: data.subject.slug };
      setSubjects([...subjects, newSubject].sort((a, b) => a.name.localeCompare(b.name)));
      setFormData({ ...formData, subject: newSubject.id, chapter: "" });
      setNewSubjectName("");
      setShowAddSubject(false);
      clearFieldError("subject");
      toast.success(`Subject "${newSubject.name}" added!`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAddingSubject(false);
    }
  };

  const handleAddChapter = async () => {
    if (!formData.subject) {
      toast.error("Please select or add a subject first before adding a chapter");
      setFieldErrors((prev) => ({ ...prev, subject: "You must select a subject before adding a chapter" }));
      setShowAddChapter(false);
      return;
    }
    if (!newChapterTitle.trim()) {
      toast.error("Please enter a chapter title");
      return;
    }
    setAddingChapter(true);
    try {
      const res = await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newChapterTitle.trim(), subject: formData.subject }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add chapter");
      const newChapter = { id: data.chapter._id.toString(), title: data.chapter.title, subject: formData.subject };
      setChapters([...chapters, newChapter]);
      setFormData({ ...formData, chapter: newChapter.id });
      setNewChapterTitle("");
      setShowAddChapter(false);
      clearFieldError("chapter");
      toast.success(`Chapter "${newChapter.title}" added!`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAddingChapter(false);
    }
  };

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
        toast.error("File size must be under 100MB");
        return;
      }
      updateAttachment(id, { file: selected });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setLoading(true);

    // Validate fields
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.subject) errors.subject = "Please select a subject";
    if (!formData.chapter) errors.chapter = "Please select a chapter";

    const hasFileOrUrl = attachments.some((a) =>
      (a.type === "video" || a.type === "link") ? !!a.externalUrl : !!a.file
    );
    if (!hasFileOrUrl) errors.attachments = "Please add at least one file or URL";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      const firstErrorKey = Object.keys(errors)[0];
      toast.error(errors[firstErrorKey]);
      // Scroll to first error field
      const el = document.getElementById(`field-${firstErrorKey}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      toast.loading("Uploading material...", { id: "upload" });

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

      // Use first attachment to derive type
      const primary = uploadedAttachments[0];

      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: primary?.type || "pdf",
          materialCategory: formData.materialCategory,
          program: formData.program,
          branch: formData.branch || undefined,
          semester: formData.semester ? parseInt(formData.semester) : undefined,
          subject: formData.subject,
          chapter: formData.chapter,
          college: uploadTarget === "college" ? formData.college || undefined : undefined,
          batch: formData.batch || undefined,
          thumbnailUrl: thumbnailUrl || undefined,
          attachments: uploadedAttachments,
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

      toast.success("Material uploaded successfully!", { id: "upload" });
      setSuccess(true);
      setTimeout(() => {
        router.push("/teacher/materials");
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong", { id: "upload" });
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
      {/* Material type - removed, type is derived from first attachment */}

      {/* Details */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        <div id="field-title">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => { setFormData({ ...formData, title: e.target.value }); clearFieldError("title"); }}
            placeholder="e.g., Algebra Basics - Complete Notes"
            required
            className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
              fieldErrors.title
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                : "border-slate-200 focus:border-violet-500 focus:ring-violet-500/20"
            }`}
          />
          {fieldErrors.title && (
            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {fieldErrors.title}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Material Category *
            </label>
            <select
              value={formData.materialCategory}
              onChange={(e) => setFormData({ ...formData, materialCategory: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="notes">Notes / Study Material</option>
              <option value="question_paper">Question Paper</option>
              <option value="syllabus">Syllabus</option>
              <option value="assignment">Assignment</option>
              <option value="lab_manual">Lab Manual</option>
              <option value="reference">Reference Material</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Program *
            </label>
            <select
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="btech">B.Tech</option>
              <option value="mtech">M.Tech</option>
              <option value="mca">MCA</option>
              <option value="bca">BCA</option>
              <option value="bsc">B.Sc</option>
              <option value="msc">M.Sc</option>
              <option value="mba">MBA</option>
              <option value="bba">BBA</option>
              <option value="diploma">Diploma</option>
              <option value="phd">Ph.D</option>
              <option value="other">Other</option>
            </select>
          </div>
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
          <div id="field-subject">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Subject *
              </label>
              <button
                type="button"
                onClick={() => setShowAddSubject(!showAddSubject)}
                className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Add New
              </button>
            </div>
            {showAddSubject && (
              <div className="mb-2 p-3 bg-violet-50 border border-violet-200 rounded-xl space-y-2">
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Subject name"
                  className="w-full px-3 py-2 border border-violet-200 rounded-lg text-sm focus:outline-none focus:border-violet-500"
                />
                <select
                  value={newSubjectCategory}
                  onChange={(e) => setNewSubjectCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-violet-200 rounded-lg text-sm focus:outline-none focus:border-violet-500"
                >
                  <option value="engineering">Engineering</option>
                  <option value="science">Science</option>
                  <option value="arts">Arts</option>
                  <option value="commerce">Commerce</option>
                  <option value="medical">Medical</option>
                  <option value="law">Law</option>
                  <option value="general">General</option>
                </select>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    disabled={addingSubject || !newSubjectName.trim()}
                    className="px-3 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50"
                  >
                    {addingSubject ? "Adding..." : "Add Subject"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSubject(false)}
                    className="px-3 py-1.5 text-slate-500 text-xs font-semibold hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <select
              value={formData.subject}
              onChange={(e) => { setFormData({ ...formData, subject: e.target.value, chapter: "" }); clearFieldError("subject"); }}
              required
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.subject
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-200 focus:border-violet-500 focus:ring-violet-500/20"
              }`}
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {fieldErrors.subject && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {fieldErrors.subject}
              </p>
            )}
          </div>
          <div id="field-chapter">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Chapter *
              </label>
              {formData.subject ? (
                <button
                  type="button"
                  onClick={() => setShowAddChapter(!showAddChapter)}
                  className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> Add New
                </button>
              ) : (
                <span className="text-xs text-slate-400">Select subject first</span>
              )}
            </div>
            {showAddChapter && (
              <div className="mb-2 p-3 bg-violet-50 border border-violet-200 rounded-xl space-y-2">
                {!formData.subject && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Select or add a subject first before adding a chapter
                  </p>
                )}
                <input
                  type="text"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  placeholder="Chapter title"
                  disabled={!formData.subject}
                  className="w-full px-3 py-2 border border-violet-200 rounded-lg text-sm focus:outline-none focus:border-violet-500 disabled:opacity-50"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddChapter}
                    disabled={addingChapter || !newChapterTitle.trim() || !formData.subject}
                    className="px-3 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50"
                  >
                    {addingChapter ? "Adding..." : "Add Chapter"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddChapter(false)}
                    className="px-3 py-1.5 text-slate-500 text-xs font-semibold hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <select
              value={formData.chapter}
              onChange={(e) => { setFormData({ ...formData, chapter: e.target.value }); clearFieldError("chapter"); }}
              required
              disabled={!formData.subject}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                fieldErrors.chapter
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-200 focus:border-violet-500 focus:ring-violet-500/20"
              }`}
            >
              <option value="">Select chapter</option>
              {filteredChapters.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            {fieldErrors.chapter && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {fieldErrors.chapter}
              </p>
            )}
          </div>
        </div>

        {/* Upload Target: For All or For Specific College */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Upload For
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setUploadTarget("all"); setFormData({ ...formData, college: "" }); }}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                uploadTarget === "all"
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              For Everyone
            </button>
            <button
              type="button"
              onClick={() => setUploadTarget("college")}
              disabled={assignedColleges.length === 0}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                uploadTarget === "college"
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              For Specific College
            </button>
          </div>
          {assignedColleges.length === 0 && (
            <p className="mt-1.5 text-xs text-slate-400">
              Admin needs to assign you to a college before you can upload college-specific materials.
            </p>
          )}
        </div>

        {/* College-specific fields */}
        {uploadTarget === "college" && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                College *
              </label>
              <select
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                required={uploadTarget === "college"}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="">Select college</option>
                {colleges
                  .filter((c) => assignedColleges.includes(c.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Branch
                </label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="">All Branches</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">Mechanical</option>
                  <option value="CIVIL">Civil</option>
                  <option value="IT">IT</option>
                  <option value="AIDS">AI & DS</option>
                  <option value="AIML">AI & ML</option>
                  <option value="CSD">CS & Design</option>
                  <option value="CSM">CSM</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Semester
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {formData.materialCategory === "question_paper" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Batch (e.g., 2020-2024)
            </label>
            <input
              type="text"
              value={formData.batch}
              onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
              placeholder="e.g., 2020-2024"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
        )}

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
                      toast.error("Thumbnail must be under 5MB");
                      return;
                    }
                    setThumbnail(f);
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
      <div id="field-attachments" className="bg-white rounded-2xl border border-slate-100 p-6">
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
        {fieldErrors.attachments && (
          <p className="mb-3 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {fieldErrors.attachments}
          </p>
        )}

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
                        accept={attachment.type === "pdf" || attachment.type === "assignment" ? ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" : attachment.type === "image" ? ".jpg,.jpeg,.png,.webp,.gif" : ".pdf,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm"}
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
