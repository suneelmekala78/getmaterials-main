import type { Metadata } from "next";
import { FaServer, FaBookOpen, FaCoffee, FaHeart } from "react-icons/fa";
import DonateForm from "@/components/marketing/DonateForm";

export const metadata: Metadata = {
  title: "Buy me a Chai ☕ — Support Free Education for Students",
  description:
    "Support GetMaterials by buying us a chai. Help us keep education free by covering server costs, development, and content creation. Every rupee makes a difference.",
  alternates: { canonical: "https://getmaterials.in/support" },
  openGraph: {
    title: "Buy me a Chai ☕ — Keep Education Free",
    description: "Your support helps cover server costs, create content, and build better tools for students.",
    url: "https://getmaterials.in/support",
  },
};

const purposes = [
  { icon: FaServer, title: "Server Costs", desc: "Keep the platform fast and reliable for thousands of students." },
  { icon: FaBookOpen, title: "Content Creation", desc: "Fund teachers to create more high-quality study materials." },
  { icon: FaCoffee, title: "Development", desc: "Help our developers build new features and improve the platform." },
  { icon: FaHeart, title: "Spreading Access", desc: "Expand to more subjects, more languages, and more students." },
];

export default function SupportPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-soft">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-20 md:pb-24 text-center">
          <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-wider mb-3">Support Us</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5">
            Help us keep education <span className="text-[var(--primary)]">free</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">
            GetMaterials is 100% free for students. Your support helps us cover server costs, create more content, and build better tools. Every rupee counts.
          </p>
        </div>
      </section>

      {/* How donations are used */}
      <section className="section">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold mb-4">Where your support goes</h2>
            <p className="text-gray-500 max-w-lg mx-auto">We&apos;re fully transparent about how every contribution is used.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
            {purposes.map((p) => (
              <div key={p.title} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[rgba(177,0,255,0.08)] flex items-center justify-center mb-4 mx-auto">
                  <p.icon className="text-[var(--primary)] text-xl" />
                </div>
                <h3 className="font-bold text-[15px] mb-1">{p.title}</h3>
                <p className="text-sm text-gray-500">{p.desc}</p>
              </div>
            ))}
          </div>
          {/* Donate Form */}
          <div className="max-w-xl mx-auto">
            <DonateForm />
          </div>
        </div>
      </section>
    </main>
  );
}
