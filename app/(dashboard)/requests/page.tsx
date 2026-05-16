"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, Plus, Clock, CheckCircle2, AlertCircle, Loader2, ChevronDown, UserCheck, Play, RotateCcw } from "lucide-react";

interface Comment {
  user: { name: string; role: string };
  message: string;
  createdAt: string;
}

interface RequestItem {
  _id: string;
  description: string;
  subject?: { name: string };
  assignedTo?: { name: string };
  status: string;
  comments: Comment[];
  createdAt: string;
}

interface SubjectOption {
  _id: string;
  name: string;
  slug: string;
}

export default function RequestsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showComments, setShowComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((data) => setSubjects(data.subjects || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!subject) {
      setError("Please select a subject.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, subject }),
      });
      const data = await res.json();
      if (res.ok) {
        setTitle("");
        setDescription("");
        setSubject("");
        setSuccess("Your request was submitted successfully!");
        fetchRequests();
      } else {
        setError(data.error || "Failed to submit request. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig: Record<string, { icon: any; label: string; color: string }> = {
    open: { icon: Clock, label: "Open", color: "text-amber-600 bg-amber-50" },
    in_progress: { icon: Play, label: "In Progress", color: "text-blue-600 bg-blue-50" },
    fulfilled: { icon: CheckCircle2, label: "Fulfilled", color: "text-emerald-600 bg-emerald-50" },
    closed: { icon: AlertCircle, label: "Closed", color: "text-slate-500 bg-slate-50" },
  };

  const reopenRequest = async (id: string, comment?: string) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "open", comment }),
      });
      if (res.ok) {
        const data = await res.json();
        setRequests((prev) =>
          prev.map((r) => (r._id === id ? data.request : r))
        );
        setCommentText((prev) => ({ ...prev, [id]: "" }));
      }
    } catch {
      // Handle error
    } finally {
      setUpdating(null);
    }
  };

  const addComment = async (id: string) => {
    const comment = commentText[id]?.trim();
    if (!comment) return;
    setUpdating(id);
    try {
      const res = await fetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, comment }),
      });
      if (res.ok) {
        const data = await res.json();
        setRequests((prev) =>
          prev.map((r) => (r._id === id ? data.request : r))
        );
        setCommentText((prev) => ({ ...prev, [id]: "" }));
      }
    } catch {
      // Handle error
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Material Requests</h1>
        <p className="text-slate-500 mt-1">
          Can&apos;t find what you need? Request it and teachers will upload it.
        </p>
      </div>

      {/* Request form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
            <Plus className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">New Request</h2>
            <p className="text-xs text-slate-500">Describe what materials you need</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {success}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Linear Algebra Chapter 3 Notes"
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full appearance-none px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all bg-white pr-10"
              >
                <option value="">Select a subject...</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Details (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what specific materials you need..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !title.trim() || !subject}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-medium text-sm rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>

      {/* My requests */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Requests</h2>
        {loading ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No requests yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Your material requests will appear here. Submit one above!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const status = statusConfig[req.status] || statusConfig.open;
              const StatusIcon = status.icon;
              return (
                <div
                  key={req._id}
                  className="bg-white rounded-xl p-4 border border-slate-100"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-lg ${status.color} flex items-center justify-center shrink-0 mt-0.5`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{req.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
                        {req.subject?.name && <span>{req.subject.name}</span>}
                        {req.assignedTo?.name && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <UserCheck className="w-3 h-3" />
                            {req.assignedTo.name} is working on this
                          </span>
                        )}
                        <span>{new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {(req.status === "fulfilled" || req.status === "closed") && (
                        <button
                          onClick={() => reopenRequest(req._id)}
                          disabled={updating === req._id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Re-open
                        </button>
                      )}
                      <button
                        onClick={() => setShowComments(showComments === req._id ? null : req._id)}
                        className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        💬 {req.comments?.length || 0}
                      </button>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase ${status.color} shrink-0`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {showComments === req._id && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      {req.comments && req.comments.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {req.comments.map((c, idx) => (
                            <div key={idx} className="flex gap-2 text-xs">
                              <span className="font-semibold text-slate-700">
                                {c.user?.name || "Unknown"}
                                <span className={`ml-1 px-1 py-0.5 text-[10px] rounded ${c.user?.role === "teacher" ? "bg-violet-50 text-violet-600" : "bg-blue-50 text-blue-600"}`}>
                                  {c.user?.role}
                                </span>
                              </span>
                              <span className="text-slate-600 flex-1">{c.message}</span>
                              <span className="text-slate-400 shrink-0">
                                {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentText[req._id] || ""}
                          onChange={(e) => setCommentText({ ...commentText, [req._id]: e.target.value })}
                          placeholder={req.status === "fulfilled" ? "Not satisfied? Explain what's missing and re-open..." : "Add a comment..."}
                          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-violet-500"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              if (req.status === "fulfilled" || req.status === "closed") {
                                reopenRequest(req._id, commentText[req._id]);
                              } else {
                                addComment(req._id);
                              }
                            }
                          }}
                        />
                        {(req.status === "fulfilled" || req.status === "closed") ? (
                          <button
                            onClick={() => reopenRequest(req._id, commentText[req._id])}
                            disabled={!commentText[req._id]?.trim() || updating === req._id}
                            className="px-3 py-2 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                          >
                            Re-open
                          </button>
                        ) : (
                          <button
                            onClick={() => addComment(req._id)}
                            disabled={!commentText[req._id]?.trim() || updating === req._id}
                            className="px-3 py-2 text-xs font-semibold bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
                          >
                            Send
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
