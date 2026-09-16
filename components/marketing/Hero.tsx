import Image from "next/image";
import Link from "next/link";
import { Caveat } from "next/font/google";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const heroStats = [
  {
    value: "1500+",
    label: "Trusted Users",
    image: "/images/icons/students.png",
    card: "bg-[#f3e8ff]",
  },
  {
    value: "10K+",
    label: "Study Materials",
    image: "/images/icons/books.png",
    card: "bg-[#ecfdf3]",
  },
  {
    value: "500+",
    label: "Expert Teachers",
    image: "/images/icons/community.png",
    card: "bg-[#eff6ff]",
  },
  {
    value: "100%",
    label: "Free to Learn",
    image: "/images/icons/star.png",
    card: "bg-[#fff7ed]",
  },
];

export default function Hero() {
  return (
    <section className="font-marketing relative isolate overflow-hidden bg-[#d2e9ff]">
      <Image
        src="/images/home-hero.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_30%] lg:object-[center_40%]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-6 pb-10 pt-[5.5rem] sm:pb-12 sm:pt-24 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:pb-16 lg:pt-28">
        <div className="relative z-10">
          <span className="inline-flex rounded-full bg-[#f3e8ff] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--primary)] sm:text-[12px]">
            Learn • Share • Grow
          </span>

          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.1] tracking-tight text-[#111] sm:text-[2.45rem] md:text-[2.85rem] lg:text-[3rem]">
            Learn Smarter. Grow Faster.
            <br />
            <span className="bg-[linear-gradient(90deg,#9333ea_0%,#b100ff_55%,#c026d3_100%)] bg-clip-text text-transparent">
              Succeed Anywhere.
            </span>
          </h1>

          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-600 sm:text-base">
            Practical, industry-ready courses taught by expert instructors. Learn at your own pace
            or live from anywhere in the world.
          </p>

          <Link
            href="/materials"
            className="mt-6 inline-flex items-center gap-3 rounded-full bg-[linear-gradient(90deg,#b100ff_0%,#c026d3_100%)] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_28px_rgba(177,0,255,0.28)] transition hover:-translate-y-0.5 sm:mt-7"
          >
            Explore Courses
            <span
              aria-hidden
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-sm"
            >
              →
            </span>
          </Link>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-4 sm:gap-4">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className={`${stat.card} flex items-center gap-2.5 rounded-[18px] px-3 py-3 sm:flex-col sm:items-start sm:gap-2 sm:px-4 sm:py-4`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center sm:h-11 sm:w-11">
                  <Image
                    src={stat.image}
                    alt=""
                    width={44}
                    height={44}
                    className="h-9 w-9 object-contain sm:h-10 sm:w-10"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[1.05rem] font-bold leading-none text-[#111] sm:text-[1.15rem]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-500 sm:text-[12px]">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p
            className={`${caveat.className} mt-8 hidden text-[1.35rem] leading-tight text-slate-500 md:-rotate-6 lg:block xl:text-[1.5rem]`}
          >
            Small Steps
            <br />
            Big Results
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[520px] lg:mx-0 lg:max-w-none">
          <p
            className={`${caveat.className} absolute -right-1 top-2 z-20 hidden text-right text-[1.25rem] leading-tight text-slate-500 sm:block md:text-[1.35rem] lg:-right-4 lg:top-6`}
          >
            Learn
            <br />
            Practice
            <br />
            Grow
            <br />
            Repeat
          </p>

          <Image
            src="/images/icons/paper-rocket.png"
            alt=""
            width={120}
            height={120}
            className="pointer-events-none absolute left-[14%] top-0 z-20 h-20 w-20 -rotate-[18deg] sm:h-24 sm:w-24 lg:left-[10%] lg:top-0 lg:h-28 lg:w-28"
            aria-hidden
          />

          <div className="relative min-h-[280px] sm:min-h-[340px] lg:min-h-[420px] xl:min-h-[460px]" aria-hidden />

          <div className="absolute bottom-6 right-0 z-20 hidden rounded-[20px] bg-white/95 px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.1)] backdrop-blur-sm sm:block lg:bottom-10 lg:right-2">
            <p className={`${caveat.className} text-[1.15rem] leading-snug text-slate-600 sm:text-[1.25rem]`}>
              A brighter you,
              <br />
              starts here.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
