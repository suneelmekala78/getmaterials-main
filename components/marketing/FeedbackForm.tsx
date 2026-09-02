"use client";

import { useState, FormEvent } from "react";
import toast from "react-hot-toast";

const BUG_TYPE_OPTIONS = [
  { value: "crash", label: "App crash or freeze" },
  { value: "login", label: "Login or signup" },
  { value: "upload", label: "Uploading materials" },
  { value: "download", label: "Download or preview" },
  { value: "search", label: "Search or filters" },
  { value: "notifications", label: "Notifications" },
  { value: "ui", label: "Display or layout" },
  { value: "performance", label: "Slow performance" },
  { value: "other", label: "Something else" },
];

export default function FeedbackForm() {
  const [form, setForm] = useState({
    type: "feedback" as "feedback" | "bug",
    name: "",
    email: "",
    bugType: "",
    subject: "",
    // 0 means "not rated yet" — the user picks their own score.
    rating: 0,
    message: "",
    website: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (form.type === "feedback" && form.rating < 1) {
      setStatus("error");
      setErrorMsg("Please pick a rating before submitting");
      toast.error("Please pick a rating before submitting");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rating: form.type === "bug" ? undefined : form.rating,
          platform: "website",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("success");
      setForm({ ...form, name: "", email: "", bugType: "", subject: "", rating: 0, message: "", website: "" });
      toast.success(form.type === "bug" ? "Bug report sent!" : "Thanks for your feedback!");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
      {/* Honeypot field — hidden from real users */}
      <input type="text" name="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="hidden" tabIndex={-1} autoComplete="off" />
      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setForm({ ...form, type: "feedback" })}
          className={`py-2.5 rounded-lg text-sm font-semibold transition ${form.type === "feedback" ? "bg-white text-[var(--primary)] shadow-sm" : "text-gray-500"}`}
        >
          Share Feedback
        </button>
        <button
          type="button"
          onClick={() => setForm({ ...form, type: "bug" })}
          className={`py-2.5 rounded-lg text-sm font-semibold transition ${form.type === "bug" ? "bg-white text-red-600 shadow-sm" : "text-gray-500"}`}
        >
          Report a Bug
        </button>
      </div>
      <h3 className="font-bold text-lg mb-5">{form.type === "bug" ? "Tell us what went wrong" : "Share your feedback"}</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name *</label>
        <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)] transition" placeholder="Your name" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Email *</label>
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)] transition" placeholder="your@email.com" />
      </div>
      {form.type === "bug" ? (
        <>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Bug Type *</label>
          <select required value={form.bugType} onChange={(e) => setForm({ ...form, bugType: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-red-500 transition">
            <option value="">Select what the bug affects</option>
            {BUG_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Bug Summary *</label>
          <input type="text" required minLength={3} maxLength={200} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 transition" placeholder="Example: PDF preview stays blank" />
        </div>
        </>
      ) : (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating *</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button key={r} type="button" onClick={() => setForm({ ...form, rating: r })}
                className={`w-10 h-10 rounded-xl border text-sm font-bold transition ${form.rating >= r ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-gray-200 text-gray-400 hover:border-[var(--primary)]"}`}>
                {r}★
              </button>
            ))}
          </div>
          {form.rating < 1 && (
            <p className="mt-1.5 text-xs text-gray-400">Pick a rating from 1 to 5.</p>
          )}
        </div>
      )}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{form.type === "bug" ? "What happened? *" : "Your Feedback *"}</label>
        <textarea required minLength={10} maxLength={1000} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)] transition resize-none" placeholder={form.type === "bug" ? "Include the steps you followed and what you expected to happen..." : "Tell us what you think about GetMaterials..."} />
      </div>
      <button type="submit" disabled={status === "loading"} className="bg-[var(--primary)] text-white font-bold px-8 py-3 rounded-xl text-sm shadow-[0_4px_14px_rgba(177,0,255,0.25)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
        {status === "loading" ? "Submitting..." : form.type === "bug" ? "Send Bug Report" : "Submit Feedback"}
      </button>
      {status === "success" && <p className="mt-4 text-sm text-green-600 font-medium">{form.type === "bug" ? "Thanks! We received your bug report." : "Thanks for your feedback! We really appreciate it."}</p>}
      {status === "error" && <p className="mt-4 text-sm text-red-500 font-medium">{errorMsg}</p>}
    </form>
  );
}
