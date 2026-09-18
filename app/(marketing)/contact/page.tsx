import type { Metadata } from "next";
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import ContactForm from "@/components/marketing/ContactForm";
import { CONTACT_EMAIL, CONTACT_OFFICE } from "@/lib/shared";
import { listingMetadata } from "@/lib/seo";

export const metadata: Metadata = listingMetadata({
  title: "Contact Us — Get in Touch with GetMaterials",
  description:
    "Get in touch with the GetMaterials team. Have questions, suggestions, or want to partner with us? We respond within 24 hours.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="font-marketing">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(145deg, #faf5ff 0%, #fafafa 50%, #eef2ff 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 20% 15%, rgba(177,0,255,0.16), transparent), radial-gradient(ellipse 45% 40% at 90% 75%, rgba(99,102,241,0.12), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-14 md:pt-20 md:pb-16">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-[#f3e8ff] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              Contact
            </span>
            <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight text-[#111] leading-tight">
              GetMaterials is listening
            </h1>
            <p className="mt-4 text-[15px] sm:text-lg leading-relaxed text-slate-500 max-w-xl">
              Questions, partnerships, or feedback — drop a note and we&apos;ll
              reply within a day.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#contact-form"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm shadow-[0_4px_14px_rgba(177,0,255,0.25)] hover:-translate-y-0.5 transition-all"
              >
                Send a message
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-violet-200 bg-white/70 text-[var(--primary)] font-semibold text-sm hover:bg-white transition"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-[#fafafa] px-6 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Reach us</h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                We work with students and educators across India. Prefer email
                or the form — both land in the same inbox.
              </p>
            </div>
            <ul className="space-y-4">
              {[
                {
                  icon: FaEnvelope,
                  title: "Email",
                  text: CONTACT_EMAIL,
                  href: `mailto:${CONTACT_EMAIL}`,
                  sub: "Reply within 24 hours",
                },
                {
                  icon: FaMapMarkerAlt,
                  title: "Office",
                  text: CONTACT_OFFICE,
                  href: undefined as string | undefined,
                  sub: "Telangana, India",
                },
                {
                  icon: FaClock,
                  title: "Hours",
                  text: "Usually within a day",
                  href: undefined as string | undefined,
                  sub: "Mon – Sun, 9am – 9pm IST",
                },
              ].map((c) => (
                <li key={c.title} className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(177,0,255,0.08)] flex items-center justify-center shrink-0">
                    <c.icon className="text-[var(--primary)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{c.title}</p>
                    {c.href ? (
                      <a
                        href={c.href}
                        className="text-sm text-slate-700 hover:text-[var(--primary)] transition break-all"
                      >
                        {c.text}
                      </a>
                    ) : (
                      <p className="text-sm text-slate-700">{c.text}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-3">Follow us</p>
              <div className="flex gap-3">
                <a
                  href="https://linkedin.com/company/getmaterials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center text-gray-500 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition"
                >
                  <FaLinkedinIn className="text-sm" />
                </a>
                <a
                  href="https://instagram.com/getmaterials.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center text-gray-500 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition"
                >
                  <FaInstagram className="text-sm" />
                </a>
                <a
                  href="https://x.com/getmaterials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center text-gray-500 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition"
                >
                  <FaXTwitter className="text-sm" />
                </a>
                <a
                  href="https://youtube.com/@GetMaterials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center text-gray-500 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition"
                >
                  <FaYoutube className="text-sm" />
                </a>
              </div>
            </div>
          </div>

          <div id="contact-form" className="lg:col-span-8 scroll-mt-24">
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
