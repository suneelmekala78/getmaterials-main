import type { Metadata } from "next";
import { FaGraduationCap, FaHandsHelping, FaLightbulb, FaGlobe, FaHeart, FaRocket, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_E164,
  CONTACT_OFFICE,
} from "@getmaterials/shared";

export const metadata: Metadata = {
  title: "About Us — Our Mission to Make Education Free",
  description:
    "Learn about GetMaterials — our mission to make quality education free and accessible to every student in India. Founded by Suneel Mekala, we provide free study materials, notes & resources.",
  keywords: ["about GetMaterials", "free education India", "Suneel Mekala", "open education platform", "student community"],
  alternates: { canonical: "https://getmaterials.in/about" },
  openGraph: {
    title: "About GetMaterials — Free Education for Everyone",
    description: "Our mission is to make quality education free and accessible. Meet the founder and learn our story.",
    url: "https://getmaterials.in/about",
  },
};

const values = [
  { icon: FaGraduationCap, title: "Education First", desc: "Everything we build is centered around helping students learn better, faster, and for free." },
  { icon: FaHandsHelping, title: "Community Driven", desc: "Teachers and students collaborate to create and improve study materials together." },
  { icon: FaLightbulb, title: "Quality Over Quantity", desc: "Every material is reviewed. We'd rather have 100 great resources than 10,000 mediocre ones." },
  { icon: FaGlobe, title: "Open & Accessible", desc: "No registration walls for browsing. No premium tiers. Education should be a right, not a product." },
  { icon: FaHeart, title: "Built with Passion", desc: "GetMaterials is a passion project by students and educators who believe in free knowledge sharing." },
  { icon: FaRocket, title: "Always Improving", desc: "We ship features and improvements regularly based on community feedback. The best is yet to come." },
];

const team = [
  { name: "Suneel Mekala", role: "Founder & Developer", image: "/suneel.jpeg" },
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-soft">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-20 md:pb-24 text-center">
          <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-wider mb-3">About GetMaterials</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5">
            Making quality education <span className="text-[var(--primary)]">free for everyone</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
            GetMaterials is a free, community-driven platform where verified teachers share study materials and students access them — all without paying a single rupee. We believe education is a right, not a privilege.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-wider mb-2">Our Mission</p>
              <h2 className="text-3xl font-extrabold mb-4">Why we built GetMaterials</h2>
              <div className="space-y-4 text-gray-500 leading-relaxed">
                <p>
                  Every student deserves access to quality study materials. But the reality is that many students — especially in India — struggle to find reliable notes, guides, and resources online. They waste hours searching through scattered websites, paying for materials that should be free, or settling for low-quality content.
                </p>
                <p>
                  GetMaterials was born out of frustration with this system. As students ourselves, we experienced these problems firsthand. So we decided to build the platform we wished existed: one central place where verified teachers share high-quality materials, and students access them completely free.
                </p>
                <p>
                  Our vision is simple — <strong>make education accessible to everyone, regardless of financial background</strong>. We&apos;re not building a business. We&apos;re building a movement.
                </p>
              </div>
            </div>

            <div className="bg-gradient-purple rounded-3xl p-8 md:p-10 text-white">
              <h3 className="text-2xl font-extrabold mb-6">By the numbers</h3>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { num: "10K+", label: "Materials uploaded" },
                  { num: "50+", label: "Verified teachers" },
                  { num: "5K+", label: "Active students" },
                  { num: "100%", label: "Free forever" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-3xl font-extrabold">{s.num}</p>
                    <p className="text-sm text-white/70 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-gradient-soft">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-wider mb-2">Our Values</p>
            <h2 className="text-3xl font-extrabold">What we believe in</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-[rgba(177,0,255,0.08)] flex items-center justify-center mb-4">
                  <v.icon className="text-[var(--primary)] text-lg" />
                </div>
                <h3 className="font-bold mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-wider mb-2">Our Team</p>
            <h2 className="text-3xl font-extrabold mb-4">The person behind GetMaterials</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Built with passion by a student who believes education should be free for everyone.</p>
          </div>
          <div className="flex justify-center">
            {team.map((t) => (
              <div key={t.name} className="text-center">
                <Image src={t.image} alt={t.name} width={80} height={80} className="w-20 h-20 rounded-full object-cover mx-auto mb-3" />
                <p className="font-bold text-sm">{t.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-wider mb-2">Reach Out</p>
            <h2 className="text-3xl font-extrabold mb-4">Get in touch with us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-12">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <FaEnvelope className="text-[var(--primary)] text-xl mx-auto mb-2" />
              <h3 className="font-bold text-sm mb-1">Email</h3>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-gray-500 hover:text-[var(--primary)]">{CONTACT_EMAIL}</a>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <FaPhone className="text-[var(--primary)] text-xl mx-auto mb-2" />
              <h3 className="font-bold text-sm mb-1">Phone</h3>
              <a href={`tel:${CONTACT_PHONE_E164}`} className="text-sm text-gray-500 hover:text-[var(--primary)]">{CONTACT_PHONE}</a>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <FaMapMarkerAlt className="text-[var(--primary)] text-xl mx-auto mb-2" />
              <h3 className="font-bold text-sm mb-1">Office</h3>
              <p className="text-sm text-gray-500">{CONTACT_OFFICE}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-gradient-soft">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Want to be part of the mission?</h2>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">
            Whether you&apos;re a student who wants to help, a teacher who wants to share, or someone who believes in free education — there&apos;s a place for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/contact" className="bg-[var(--primary)] text-white font-bold px-8 py-3.5 rounded-xl text-[15px] shadow-[0_4px_14px_rgba(177,0,255,0.25)] hover:-translate-y-0.5 transition-all">
              Get in Touch
            </Link>
            <Link href="/support" className="border-2 border-gray-200 text-gray-700 font-semibold px-8 py-3.5 rounded-xl text-[15px] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all">
              Buy me a chai ☕
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
