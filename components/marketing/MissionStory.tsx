import Image from "next/image";
import { FaCheck } from "react-icons/fa";

const missionPoints = [
  "Make study materials accessible to everyone",
  "Build a student-driven open learning community",
  "Support academic success for every student",
];

const avatars = ["#7C3AED", "#10B981", "#F97316", "#0EA5E9"];

export default function MissionStory() {
  return (
    <section id="our-story" className="section scroll-mt-24 bg-white lg:pb-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-10 lg:gap-14 items-center">
          <div>
            <p className="text-[var(--primary)] font-bold text-[11px] uppercase tracking-[0.18em] mb-3">
              Our Mission
            </p>
            <h2 className="text-3xl md:text-[38px] font-extrabold mb-4 leading-tight text-[#111]">
              Why We Built GetMaterials?
            </h2>
            <p className="text-gray-600 leading-relaxed mb-7 max-w-md">
              We believe every student deserves equal access to quality study resources. Notes
              shouldn&apos;t be limited to a few — knowledge should be shared, not sold.
            </p>
            <ul className="space-y-4">
              {missionPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[15px] text-gray-800">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shrink-0">
                    <FaCheck className="text-[10px]" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="rounded-[28px] overflow-hidden h-[340px] sm:h-[400px] lg:h-[440px]">
              <Image
                src="/images/why-hero.png"
                alt="Student walking toward campus"
                width={900}
                height={700}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="lg:absolute lg:-bottom-8 lg:-right-8 lg:left-auto mt-5 lg:mt-0 bg-white rounded-[24px] shadow-[0_18px_50px_rgba(17,17,17,0.14)] p-6 sm:p-7 w-full lg:w-[360px]">
              <p className="text-[var(--primary)] font-bold text-[11px] uppercase tracking-[0.18em] mb-2">
                Our Story
              </p>
              <h3 className="text-2xl font-extrabold mb-3 leading-tight text-[#111]">
                From an Idea to a Movement
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                GetMaterials started with a simple idea — to help students find the right materials
                without struggling. Today, it&apos;s a growing movement powered by thousands of
                students and educators across India.
              </p>
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2">
                  {avatars.map((color, index) => (
                    <span
                      key={color}
                      className="w-8 h-8 rounded-full ring-2 ring-white"
                      style={{ background: color }}
                      aria-hidden
                    >
                      <span className="sr-only">Community member {index + 1}</span>
                    </span>
                  ))}
                  <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    +2K
                  </span>
                </div>
                <p className="text-sm text-gray-500">... and growing every day!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
