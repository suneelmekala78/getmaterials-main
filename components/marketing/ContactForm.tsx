"use client";

import { useState, FormEvent } from "react";
import toast from "react-hot-toast";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", website: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "", website: "" });
      toast.success("Message sent! We'll get back to you soon.");
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
      <h3 className="font-bold text-lg mb-5">Send us a message</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)] transition" placeholder="Your name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)] transition" placeholder="you@example.com" />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
        <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)] transition" placeholder="What's this about?" />
      </div>
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
        <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)] transition resize-none" placeholder="Write your message here..." />
      </div>
      <button type="submit" disabled={status === "loading"} className="bg-[var(--primary)] text-white font-bold px-8 py-3 rounded-xl text-sm shadow-[0_4px_14px_rgba(177,0,255,0.25)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>
      {status === "success" && <p className="mt-4 text-sm text-green-600 font-medium">Message sent! We&apos;ll get back to you soon.</p>}
      {status === "error" && <p className="mt-4 text-sm text-red-500 font-medium">{errorMsg}</p>}
    </form>
  );
}
