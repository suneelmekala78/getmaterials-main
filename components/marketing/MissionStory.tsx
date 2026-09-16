import Image from "next/image";
import { Caveat } from "next/font/google";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const missionPoints = [
  {
    text: "Make study materials accessible to everyone",
    image: "/images/icons/books.png",
  },
  {
    text: "Build a student-driven open learning community",
    image: "/images/icons/community.png",
  },
  {
    text: "Support academic success for every student",
    image: "/images/icons/star.png",
  },
];

const communityAvatars = [
  "/images/stu1.jpg",
  "/images/stu2.jpg",
  "/images/img1.jpg",
  "/images/default-profile-pic.png",
];

export default function MissionStory() {
  return (
    <section
      id="our-story"
      className="font-marketing relative scroll-mt-24 overflow-hidden bg-[linear-gradient(180deg,#faf8ff_0%,#ffffff_100%)] px-6 py-16 sm:py-20 md:py-24 lg:pb-32 xl:pb-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-16 h-56 w-56 rounded-full bg-[#f3e8ff]/60 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 bottom-10 h-48 w-48 rounded-full bg-[#e8f3ff]/70 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:pb-6">
          <div className="relative">
            <span className="inline-flex rounded-full bg-[#f3e8ff] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              Our Mission
            </span>

            <h2 className="mt-5 text-[2rem] font-bold leading-tight tracking-tight text-[#111] sm:text-[2.35rem] md:text-[2.5rem]">
              Why We Built GetMaterials?
            </h2>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-600 sm:text-base">
              We believe every student deserves equal access to quality study resources. Notes
              shouldn&apos;t be limited to a few — knowledge should be shared, not sold.
            </p>

            <ul className="mt-8 space-y-5">
              {missionPoints.map((point) => (
                <li key={point.text} className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f3e8ff] sm:h-16 sm:w-16">
                    <Image
                      src={point.image}
                      alt=""
                      width={56}
                      height={56}
                      className="h-9 w-9 object-contain sm:h-10 sm:w-10"
                    />
                  </div>
                  <span className="text-[15px] font-medium leading-snug text-[#111] sm:text-[16px]">
                    {point.text}
                  </span>
                </li>
              ))}
            </ul>

            <p
              className={`${caveat.className} mt-10 text-[1.35rem] leading-tight text-slate-500 lg:hidden`}
            >
              Learn
              <br />
              Share
              <br />
              Grow
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[28px]">
              <Image
                src="/images/student-collage.png"
                alt="Student walking toward campus with books"
                width={980}
                height={740}
                className="h-[340px] w-full object-cover object-center sm:h-[380px] lg:h-[420px] xl:h-[440px]"
              />
            </div>

            <p
              className={`${caveat.className} pointer-events-none absolute -left-2 bottom-10 z-10 hidden text-[1.45rem] leading-tight text-slate-500 md:-rotate-6 lg:-left-16 lg:bottom-16 xl:-left-20 xl:bottom-20 xl:text-[1.55rem] lg:block`}
            >
              Learn
              <br />
              Share
              <br />
              Grow
            </p>

            <div className="relative z-10 mt-5 w-full rounded-[24px] bg-white p-6 shadow-[0_18px_50px_rgba(17,17,17,0.12)] sm:p-7 lg:absolute lg:-bottom-12 lg:-right-10 lg:mt-0 lg:w-[min(100%,380px)] xl:-bottom-14 xl:-right-14">
              <span className="inline-flex rounded-full bg-[#f3e8ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
                Our Story
              </span>

              <h3 className="mt-3 text-[1.65rem] font-bold leading-tight text-[#111] sm:text-[1.85rem]">
                From an Idea to a Movement
              </h3>

              <p className="mt-3 text-[14px] leading-relaxed text-slate-600 sm:text-[15px]">
                GetMaterials started with a simple idea — to help students find the right materials
                without struggling. Today, it&apos;s a growing movement powered by thousands of
                students and educators across India.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex -space-x-2">
                  {communityAvatars.map((src) => (
                    <Image
                      key={src}
                      src={src}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-white ring-2 ring-white">
                    +2K
                  </span>
                </div>
                <p className="text-[13px] text-slate-500 sm:text-sm">... and growing every day!</p>
              </div>
            </div>

            <p
              className={`${caveat.className} pointer-events-none absolute -bottom-2 right-0 hidden text-[1.15rem] text-slate-400 lg:block xl:text-[1.25rem]`}
            >
              A brighter you, starts here.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
