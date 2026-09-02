import Image from "next/image";
import Link from "next/link";
import { FaPlay, FaUserPlus } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-[rgba(177,0,255,0.07)] blur-3xl" />
      <div className="absolute top-20 right-0 w-[380px] h-[380px] rounded-full bg-[rgba(177,0,255,0.06)] blur-3xl" />
      <div className="absolute bottom-0 left-1/3 w-[240px] h-[240px] rounded-full bg-[rgba(99,102,241,0.08)] blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-10 md:pt-12 md:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#F3E8FF] text-[var(--primary)] text-xs font-bold px-3.5 py-1.5 rounded-full mb-5">
              <HiOutlineSparkles className="text-sm" />
              Free study materials for every student
            </div>

            <h1 className="text-[36px] sm:text-[46px] font-extrabold leading-[1.15] text-[#111] mb-5">
              Empowering Students.
              <br />
              Sharing Knowledge.
              <br />
              <span className="text-[var(--primary)]">Building Futures.</span>
            </h1>

            <p className="text-[15px] sm:text-base text-gray-500 max-w-lg mb-8 leading-relaxed">
              GetMaterials is a free platform for students across India to access, share, and
              organise study materials from any college — notes, PDFs, videos, and more.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[#C026D3] text-white font-bold px-6 py-3.5 rounded-xl text-[15px] shadow-[0_8px_24px_rgba(177,0,255,0.28)] hover:-translate-y-0.5 transition-all"
              >
                <FaUserPlus className="text-sm" />
                Join Our Community
              </Link>
              <Link
                href="#our-story"
                className="inline-flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-800 font-semibold px-6 py-3.5 rounded-xl text-[15px] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
              >
                <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                  <FaPlay className="text-[9px] ml-0.5" />
                </span>
                Watch Our Story
              </Link>
            </div>
          </div>

          <div className="relative">
            <Image
              src="/images/hero.png"
              alt="Students collaborating on GetMaterials"
              width={980}
              height={740}
              priority
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
