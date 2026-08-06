import type { Metadata } from "next";
import { FaEnvelope, FaMapMarkerAlt, FaClock, FaPhone, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import ContactForm from "@/components/marketing/ContactForm";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_E164,
  CONTACT_OFFICE,
} from "@getmaterials/shared";

export const metadata: Metadata = {
  title: "Contact Us — Get in Touch with GetMaterials",
  description:
    "Get in touch with the GetMaterials team. Have questions, suggestions, or want to partner with us? We respond within 24 hours.",
  alternates: { canonical: "https://getmaterials.in/contact" },
  openGraph: {
    title: "Contact GetMaterials",
    description: "Questions, suggestions, or partnerships? Drop us a message.",
    url: "https://getmaterials.in/contact",
  },
};

export default function ContactPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-soft">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-20 md:pb-24 text-center">
          <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-wider mb-3">Contact Us</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5">
            We&apos;d love to <span className="text-[var(--primary)]">hear from you</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Have a question, suggestion, or want to collaborate? Drop us a message and we&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Info cards */}
            <div className="space-y-5">
              {[
                {
                  icon: FaEnvelope,
                  title: "Email Us",
                  text: CONTACT_EMAIL,
                  href: `mailto:${CONTACT_EMAIL}`,
                  sub: "We reply within 24 hours",
                },
                {
                  icon: FaPhone,
                  title: "Call Us",
                  text: CONTACT_PHONE,
                  href: `tel:${CONTACT_PHONE_E164}`,
                  sub: "Mon – Sat, 9am – 7pm IST",
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
                  title: "Response Time",
                  text: "Usually within a day",
                  href: undefined as string | undefined,
                  sub: "Mon – Sun, 9am – 9pm IST",
                },
              ].map((c) => (
                <div key={c.title} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(177,0,255,0.08)] flex items-center justify-center mb-3">
                    <c.icon className="text-[var(--primary)]" />
                  </div>
                  <h3 className="font-bold text-[15px] mb-1">{c.title}</h3>
                  {c.href ? (
                    <a href={c.href} className="text-sm text-gray-700 hover:text-[var(--primary)] transition">
                      {c.text}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-700">{c.text}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
                </div>
              ))}
              {/* Social Links */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-[15px] mb-3">Follow Us</h3>
                <div className="flex gap-3">
                  <a href="https://linkedin.com/company/getmaterials" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[var(--primary)] hover:text-white transition"><FaLinkedinIn className="text-sm" /></a>
                  <a href="https://instagram.com/getmaterials.in" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[var(--primary)] hover:text-white transition"><FaInstagram className="text-sm" /></a>
                  <a href="https://x.com/getmaterials" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[var(--primary)] hover:text-white transition"><FaXTwitter className="text-sm" /></a>
                  <a href="https://youtube.com/@GetMaterials" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[var(--primary)] hover:text-white transition"><FaYoutube className="text-sm" /></a>
                </div>
              </div>
            </div>
            {/* Form */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
