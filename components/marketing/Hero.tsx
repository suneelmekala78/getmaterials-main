import Link from "next/link";
import { FaBookOpen, FaChalkboardTeacher, FaUserGraduate, FaSearch } from "react-icons/fa";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[rgba(177,0,255,0.04)] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[rgba(177,0,255,0.03)] translate-y-1/2 -translate-x-1/3" />

      <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[rgba(177,0,255,0.08)] text-[var(--primary)] text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse" />
            100% Free &amp; Open for Students
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] text-[#111] mb-6">
            Study smarter with
            <span className="text-[var(--primary)]"> free materials</span>
            <br className="hidden sm:block" /> from real teachers
          </h1>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            Access handwritten notes, video lectures, assignments &amp; guides — all curated by verified educators.
            No more searching 10 different websites. Everything you need, in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              href="/materials"
              className="w-full sm:w-auto bg-[var(--primary)] text-white font-bold px-8 py-3.5 rounded-xl text-[15px] shadow-[0_8px_24px_rgba(177,0,255,0.3)] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(177,0,255,0.35)] transition-all"
            >
              Browse Materials — It&apos;s Free
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto border-2 border-gray-200 text-gray-700 font-semibold px-8 py-3.5 rounded-xl text-[15px] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
            >
              Learn How It Works
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[var(--primary)]">10K+</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Materials uploaded</p>
            </div>
            <div className="w-px h-10 bg-gray-200 hidden sm:block" />
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[var(--primary)]">50+</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Verified teachers</p>
            </div>
            <div className="w-px h-10 bg-gray-200 hidden sm:block" />
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[var(--primary)]">5K+</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Active students</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          {[
            { icon: FaSearch, title: "Find Instantly", desc: "Search by subject, topic, or keyword" },
            { icon: FaBookOpen, title: "Quality Notes", desc: "Handwritten & typed notes by experts" },
            { icon: FaChalkboardTeacher, title: "Verified Teachers", desc: "Content from trusted educators" },
            { icon: FaUserGraduate, title: "Free Forever", desc: "No fees, no subscriptions, no limits" },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-[rgba(177,0,255,0.08)] flex items-center justify-center mb-3">
                <item.icon className="text-[var(--primary)] text-lg" />
              </div>
              <h3 className="font-bold text-[15px] mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
