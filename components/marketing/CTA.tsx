import Link from "next/link";
import { FaArrowRight, FaBookOpen } from "react-icons/fa";

export default function CTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#4c0677_0%,#7c0fb8_42%,#b100ff_78%,#d946ef_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.55) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="absolute -top-24 -left-16 w-[420px] h-[420px] rounded-full bg-fuchsia-300/25 blur-3xl" />
      <div className="absolute -bottom-28 -right-10 w-[480px] h-[480px] rounded-full bg-violet-200/20 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full border border-white/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-white/10" />

      <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 text-center text-white">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide backdrop-blur-sm mb-6">
          <FaBookOpen className="text-[11px]" />
          Free forever for students
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-5 max-w-2xl mx-auto leading-[1.15]">
          Ready to start learning?
        </h2>
        <p className="text-white/80 max-w-xl mx-auto mb-10 text-[15px] md:text-base leading-relaxed">
          Browse free notes, download resources, and join thousands of students
          already accelerating their studies with GetMaterials.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/materials"
            className="inline-flex items-center gap-2 bg-white text-[var(--primary)] font-bold px-8 py-3.5 rounded-xl text-[15px] shadow-[0_12px_40px_rgba(0,0,0,0.22)] hover:-translate-y-0.5 transition-all"
          >
            Get Started Free <FaArrowRight className="text-sm" />
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 border border-white/35 bg-white/5 text-white font-semibold px-8 py-3.5 rounded-xl text-[15px] backdrop-blur-sm hover:bg-white/15 transition-all"
          >
            Create free account
          </Link>
        </div>
      </div>
    </section>
  );
}
