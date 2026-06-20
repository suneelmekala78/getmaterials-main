import type { Metadata } from "next";
import { FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import ContactForm from "@/components/marketing/ContactForm";

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
                { icon: FaEnvelope, title: "Email Us", text: "getmaterials.in@gmail.com", sub: "We reply within 24 hours" },
                { icon: FaMapMarkerAlt, title: "Location", text: "Hyderabad, India", sub: "Remote-first team" },
                { icon: FaClock, title: "Response Time", text: "Usually within a day", sub: "Mon – Sun, 9am – 9pm IST" },
              ].map((c) => (
                <div key={c.title} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(177,0,255,0.08)] flex items-center justify-center mb-3">
                    <c.icon className="text-[var(--primary)]" />
                  </div>
                  <h3 className="font-bold text-[15px] mb-1">{c.title}</h3>
                  <p className="text-sm text-gray-700">{c.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
                </div>
              ))}
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
