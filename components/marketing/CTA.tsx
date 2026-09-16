import Image from "next/image";
import Link from "next/link";
import { Caveat } from "next/font/google";
import { BookOpen } from "lucide-react";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const bookLabels = [
  { label: "Notes", color: "bg-[#9333ea]" },
  { label: "Previous Papers", color: "bg-[#eab308]" },
  { label: "Study Guides", color: "bg-[#38bdf8]" },
  { label: "Quizzes", color: "bg-[#f472b6]" },
];

function YellowDashes({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex gap-1 ${className}`} aria-hidden>
      <span className="inline-block h-0.5 w-3 rotate-[35deg] rounded-full bg-amber-300" />
      <span className="inline-block h-0.5 w-3 -rotate-[35deg] rounded-full bg-amber-300" />
    </span>
  );
}

function BookStack() {
  return (
    <div className="relative w-[168px] shrink-0 xl:w-[188px]">
      <div className="space-y-2">
        {bookLabels.map((book) => (
          <div
            key={book.label}
            className={`${book.color} flex h-11 items-center rounded-lg px-4 shadow-[0_6px_16px_rgba(15,23,42,0.14)] sm:h-12`}
          >
            <span className="text-[12px] font-semibold text-white sm:text-[14px]">{book.label}</span>
          </div>
        ))}
      </div>
      <Image
        src="/images/icons/bulb.png"
        alt=""
        width={64}
        height={64}
        className="pointer-events-none absolute -right-7 -top-9 h-14 w-14 rotate-[8deg] object-contain sm:h-16 sm:w-16"
        aria-hidden
      />
    </div>
  );
}

export default function CTA() {
  return (
    <section className="font-marketing px-6 py-16 sm:py-20 md:py-24">
      <div className="relative mx-auto min-h-[420px] max-w-6xl overflow-hidden rounded-[28px] bg-[#f5f0ff] shadow-[0_20px_50px_rgba(177,0,255,0.08)] sm:min-h-[460px]">
        <Image
          src="/images/ready-bg.png"
          alt=""
          fill
          sizes="(max-width: 1152px) 100vw, 1152px"
          className="object-cover object-center"
          aria-hidden
        />

        <Image
          src="/images/icons/student3.png"
          alt=""
          width={280}
          height={320}
          className="pointer-events-none absolute bottom-0 -left-4 z-[1] hidden h-[220px] w-auto object-contain object-bottom sm:block sm:-left-2 sm:h-[250px] lg:-left-6 lg:h-[290px] xl:h-[310px]"
          aria-hidden
        />

        <div
          className={`${caveat.className} pointer-events-none absolute left-[11%] top-10 z-[3] hidden -rotate-6 lg:block xl:left-[13%] xl:top-12`}
        >
          <YellowDashes className="mb-1" />
          <p className="text-[1.3rem] leading-tight text-[var(--primary)] xl:text-[1.45rem]">
            Better Notes
            <br />
            Brighter Future
          </p>
        </div>

        <div
          className={`${caveat.className} pointer-events-none absolute right-[11%] top-10 z-[3] hidden rotate-6 text-right lg:block xl:right-[13%] xl:top-12`}
        >
          <span aria-hidden className="mr-1 inline-block text-[#f472b6]">
            ♥
          </span>
          <p className="text-[1.3rem] leading-tight text-[var(--primary)] xl:text-[1.45rem]">
            Learn Share
            <br />
            Grow Together
          </p>
        </div>

        <div className="relative z-10 grid min-h-[420px] grid-cols-1 items-center gap-8 px-6 py-12 sm:min-h-[460px] sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,220px)_1fr_minmax(0,260px)] lg:gap-6 lg:px-10">
          <div className="hidden min-h-[280px] lg:block" aria-hidden />

          <div className="relative mx-auto max-w-xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f3e8ff] px-4 py-1.5 text-[12px] font-semibold text-[var(--primary)]">
              <BookOpen className="h-3.5 w-3.5" strokeWidth={2.2} />
              Free forever for students
            </span>

            <h2 className="mt-5 text-[2rem] font-bold leading-[1.12] tracking-tight text-[#111] sm:text-[2.35rem] md:text-[2.75rem]">
              Ready to start{" "}
              <span className="relative inline-block">
                <YellowDashes className="absolute -left-5 top-2 hidden sm:inline-flex" />
                <span className="bg-[linear-gradient(90deg,#9333ea_0%,#b100ff_55%,#c026d3_100%)] bg-clip-text text-transparent">
                  learning?
                </span>
                <YellowDashes className="absolute -right-5 top-2 hidden sm:inline-flex" />
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-slate-600 sm:text-base">
              Browse free notes, download resources, and join thousands of students already
              accelerating their studies with GetMaterials.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/materials"
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(90deg,#b100ff_0%,#c026d3_100%)] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_28px_rgba(177,0,255,0.28)] transition hover:-translate-y-0.5"
              >
                Get Started Free
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full border-2 border-[#d8b4fe] bg-white px-7 py-3.5 text-[15px] font-semibold text-[var(--primary)] transition hover:-translate-y-0.5 hover:bg-[#faf5ff]"
              >
                Create free account
              </Link>
            </div>
          </div>

          <div className="hidden lg:block" aria-hidden />
        </div>

        <div className="pointer-events-none absolute bottom-4 right-5 z-[3] hidden lg:block xl:bottom-6 xl:right-8">
          <BookStack />
        </div>
      </div>
    </section>
  );
}
