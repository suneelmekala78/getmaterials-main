"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, XCircle, MessageSquare, Loader2, BookOpen, UserCheck, Play } from "lucide-react";
import toast from "react-hot-toast";

interface Comment {
  user: { name: string; role: string };
  message: string;
  createdAt: string;
}

interface Request {
  _id: string;
  description: string;
  subject?: { name: string };
  user?: { name: string; email: string };
  assignedTo?: { name: string; email: string };
  status: "open" | "in_progress" | "fulfilled" | "closed";
  comments: Comment[];
  createdAt: string;
}

const STATUS_CONFIG = {
  open: { label: "Open", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
  in_progress: { label: "In Progress", icon: Play, color: "text-blue-600 bg-blue-50 border-blue-200" },
  fulfilled: { label: "Fulfilled", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  closed: { label: "Closed", icon: XCircle, color: "text-slate-500 bg-slate-50 border-slate-200" },
};

export default function TeacherRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "fulfilled" | "closed">("open");
  const [updating, setUpdating] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/teacher/requests")
      .then((r) => r.json())
      .then((data) => setRequests(data.requests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: "open" | "in_progress" | "fulfilled" | "closed", comment?: string) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/teacher/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, comment }),
      });
      if (res.ok) {
        const data = await res.json();
        setRequests((prev) =>
          prev.map((r) => (r._id === id ? data.request : r))
        );
        if (comment) {
          setCommentText((prev) => ({ ...prev, [id]: "" }));
        }
      } else {
        toast.error("Failed to update request status");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const addComment = async (id: string) => {
    const comment = commentText[id]?.trim();
    if (!comment) return;
    setUpdating(id);
    try {
      const res = await fetch("/api/teacher/requests", {
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
      } else {
        toast.error("Failed to add comment");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const counts = {
    all: requests.length,
    open: requests.filter((r) => r.status === "open").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
    fulfilled: requests.filter((r) => r.status === "fulfilled").length,
    closed: requests.filter((r) => r.status === "closed").length,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Material Requests</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Review student requests. Take a request to start working on it.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "open", "in_progress", "fulfilled", "closed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              filter === tab
                ? "bg-violet-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600"
            }`}
          >
            {tab.replace("_", " ")} <span className="ml-1 text-xs opacity-70">({counts[tab]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-16 border border-slate-100 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border border-slate-100 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No requests</h3>
          <p className="text-sm text-slate-500">
            {filter === "all" ? "Students haven't submitted any requests yet." : `No ${filter.replace("_", " ")} requests.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const cfg = STATUS_CONFIG[req.status];
            const Icon = cfg.icon;
            return (
              <div
                key={req._id}
                className="bg-white rounded-xl border border-slate-100 p-5"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{req.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
                      {req.subject?.name && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {req.subject.name}
                        </span>
                      )}
                      {req.user?.name && <span>by {req.user.name}</span>}
                      {req.assignedTo?.name && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <UserCheck className="w-3 h-3" />
                          {req.assignedTo.name} is working on this
                        </span>
                      )}
                      <span>{new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>

                  {/* Status actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === "open" && (
                      <button
                        onClick={() => updateStatus(req._id, "in_progress")}
                        disabled={updating === req._id}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        Take Request
                      </button>
                    )}
                    {req.status === "in_progress" && (
                      <button
                        onClick={() => updateStatus(req._id, "fulfilled")}
                        disabled={updating === req._id}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                      >
                        Mark Fulfilled
                      </button>
                    )}
                    {req.status === "open" && (
                      <button
                        onClick={() => updateStatus(req._id, "closed")}
                        disabled={updating === req._id}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
                      >
                        Close
                      </button>
                    )}
                    <button
                      onClick={() => setShowComments(showComments === req._id ? null : req._id)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      💬 {req.comments?.length || 0}
                    </button>
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
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-violet-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addComment(req._id);
                        }}
                      />
                      <button
                        onClick={() => addComment(req._id)}
                        disabled={!commentText[req._id]?.trim() || updating === req._id}
                        className="px-3 py-2 text-xs font-semibold bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
