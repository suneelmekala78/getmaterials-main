"use client";

import { useState, FormEvent } from "react";
import toast from "react-hot-toast";

export default function FeedbackForm() {
  const [form, setForm] = useState({ name: "", email: "", rating: 5, message: "", website: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("success");
      setForm({ name: "", email: "", rating: 5, message: "", website: "" });
      toast.success("Thanks for your feedback!");
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
      <h3 className="font-bold text-lg mb-5">Share your feedback</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name *</label>
        <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)] transition" placeholder="Your name" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Email *</label>
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)] transition" placeholder="your@email.com" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((r) => (
            <button key={r} type="button" onClick={() => setForm({ ...form, rating: r })}
              className={`w-10 h-10 rounded-xl border text-sm font-bold transition ${form.rating >= r ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-gray-200 text-gray-400 hover:border-[var(--primary)]"}`}>
              {r}★
            </button>
          ))}
        </div>
      </div>
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Feedback *</label>
        <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)] transition resize-none" placeholder="Tell us what you think about GetMaterials..." />
      </div>
      <button type="submit" disabled={status === "loading"} className="bg-[var(--primary)] text-white font-bold px-8 py-3 rounded-xl text-sm shadow-[0_4px_14px_rgba(177,0,255,0.25)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
        {status === "loading" ? "Submitting..." : "Submit Feedback"}
      </button>
      {status === "success" && <p className="mt-4 text-sm text-green-600 font-medium">Thanks for your feedback! We really appreciate it.</p>}
      {status === "error" && <p className="mt-4 text-sm text-red-500 font-medium">{errorMsg}</p>}
    </form>
  );
}
