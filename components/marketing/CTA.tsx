import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

export default function CTA() {
  return (
    <section className="section">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-gradient-purple rounded-3xl px-8 py-14 md:px-16 md:py-20 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to start learning?</h2>
            <p className="text-white/80 max-w-lg mx-auto mb-8 text-[15px] leading-relaxed">
              Join thousands of students already using GetMaterials. Browse free notes, download resources, and accelerate your learning today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/materials"
                className="inline-flex items-center gap-2 bg-white text-[var(--primary)] font-bold px-8 py-3.5 rounded-xl text-[15px] hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                Get Started Free <FaArrowRight className="text-sm" />
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 bg-white/15 text-white font-semibold px-8 py-3.5 rounded-xl text-[15px] border border-white/20 hover:bg-white/25 transition-all"
              >
                Support Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
