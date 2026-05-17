"use client";

import { useState, useEffect } from "react";
import { Star, Loader2, Trash2, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

interface ReviewItem {
  _id: string;
  user: { _id: string; name: string; avatar?: string; role: string };
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewStats {
  average: number;
  total: number;
  distribution: number[];
}

export function MaterialReviews({ materialId, currentUserId }: { materialId: string; currentUserId?: string }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ average: 0, total: 0, distribution: [0, 0, 0, 0, 0] });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [materialId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?materialId=${materialId}`);
      const data = await res.json();
      if (res.ok) {
        setReviews(data.reviews || []);
        setStats(data.stats || { average: 0, total: 0, distribution: [0, 0, 0, 0, 0] });

        // Pre-fill if user already reviewed
        if (currentUserId) {
          const myReview = data.reviews?.find((r: ReviewItem) => r.user?._id === currentUserId);
          if (myReview) {
            setRating(myReview.rating);
            setComment(myReview.comment);
          }
        }
      }
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!rating) {
      setError("Please select a rating.");
      return;
    }
    if (!comment.trim() || comment.trim().length < 3) {
      setError("Please write a comment (at least 3 characters).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId, rating, comment: comment.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || "Review submitted!");
        fetchReviews();
      } else {
        setError(data.error || "Failed to submit review.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(null);
    setDeleting(id);
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
        setRating(0);
        setComment("");
        fetchReviews();
        toast.success("Review deleted");
      } else {
        toast.error("Failed to delete review");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const StarRating = ({ value, interactive = false }: { value: number; interactive?: boolean }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setRating(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          <Star
            className={`w-5 h-5 ${
              star <= (interactive ? hoverRating || value : value)
                ? "text-amber-400 fill-amber-400"
                : "text-slate-200"
            }`}
          />
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Header with stats */}
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-violet-500" />
          Reviews & Ratings
        </h2>

        {stats.total > 0 && (
          <div className="mt-4 flex items-start gap-6">
            {/* Average rating */}
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">{stats.average}</p>
              <StarRating value={Math.round(stats.average)} />
              <p className="text-xs text-slate-500 mt-1">{stats.total} review{stats.total !== 1 ? "s" : ""}</p>
            </div>

            {/* Distribution */}
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution[star - 1];
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-slate-500">{star}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-slate-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Write review form */}
      {currentUserId && (
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            {reviews.some((r) => r.user?._id === currentUserId) ? "Update Your Review" : "Write a Review"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="px-3 py-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="px-3 py-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg">
                {success}
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Your Rating</label>
              <StarRating value={rating} interactive />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this material..."
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !rating}
              className="px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Submitting..." : reviews.some((r) => r.user?._id === currentUserId) ? "Update Review" : "Submit Review"}
            </button>
          </form>
        </div>
      )}

      {/* Reviews list */}
      <div className="divide-y divide-slate-50">
        {reviews.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Star className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="px-6 py-4">
              <div className="flex items-start gap-3">
                {review.user?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.user.avatar}
                    alt={review.user.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {review.user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{review.user?.name || "Anonymous"}</span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded capitalize ${
                      review.user?.role === "teacher" ? "bg-violet-50 text-violet-600" : "bg-blue-50 text-blue-600"
                    }`}>
                      {review.user?.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRating value={review.rating} />
                    <span className="text-[10px] text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{review.comment}</p>
                </div>
                {currentUserId === review.user?._id && (
                  <button
                    onClick={() => setDeleteConfirmId(review._id)}
                    disabled={deleting === review._id}
                    className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                    title="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">Delete Review?</h3>
            <p className="text-sm text-slate-500 mb-5">Are you sure you want to delete your review? This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={!!deleting}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
