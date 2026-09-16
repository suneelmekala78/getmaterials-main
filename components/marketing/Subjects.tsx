import Image from "next/image";
import Link from "next/link";
import { Caveat } from "next/font/google";
import { ArrowRight } from "lucide-react";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const leftFeatures = [
  {
    title: "Wide Range of Courses",
    desc: "Explore expert-led courses across various subjects, completely free.",
    image: "/images/icons/books.png",
    card: "bg-[#f3e8ff]",
    href: "/materials",
  },
  {
    title: "Practice & Apply",
    desc: "Work on projects, quizzes and real-world exercises to build practical skills.",
    image: "/images/icons/checklist.png",
    card: "bg-[#fff7ed]",
    href: "/quizzes",
  },
  {
    title: "Track Your Progress",
    desc: "See your improvement with clear progress tracking and milestones.",
    image: "/images/icons/progress.png",
    card: "bg-[#ecfdf3]",
    href: "/signup",
  },
];

const rightFeatures = [
  {
    title: "Supportive Community",
    desc: "Learn, share and grow together with fellow learners across India.",
    image: "/images/icons/community.png",
    card: "bg-[#eff6ff]",
    href: "/signup",
  },
  {
    title: "Learn Anytime, Anywhere",
    desc: "Access materials on any device, at your own pace, anytime, anywhere.",
    image: "/images/icons/calender.png",
    card: "bg-[#fde8f2]",
    href: "/materials",
  },
  {
    title: "100% Free Learning",
    desc: "Quality education should be for everyone. Learn without limits.",
    image: "/images/icons/star.png",
    card: "bg-[#ecfdf3]",
    href: "/materials",
  },
];

function FeatureCard({
  feature,
}: {
  feature: (typeof leftFeatures)[number];
}) {
  return (
    <Link
      href={feature.href}
      className={`${feature.card} group relative flex items-start gap-4 rounded-[22px] p-5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)] sm:p-6`}
    >
      <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center sm:h-[72px] sm:w-[72px]">
        <Image
          src={feature.image}
          alt=""
          width={88}
          height={88}
          className="h-auto max-h-[68px] w-auto object-contain sm:max-h-[72px]"
        />
      </div>
      <div className="min-w-0 flex-1 pr-8">
        <h3 className="text-[16px] font-bold leading-snug text-[#111] sm:text-[17px]">
          {feature.title}
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-600 sm:text-[14px]">
          {feature.desc}
        </p>
      </div>
      <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm transition group-hover:bg-[var(--primary)] group-hover:text-white">
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

export default function Subjects() {
  return (
    <section className="font-marketing relative overflow-hidden bg-white px-6 py-16 sm:py-20 md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full bg-[#f3e8ff]/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 bottom-20 h-48 w-48 rounded-full bg-[#ecfdf3]/60 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12 text-center sm:mb-14">
          <span className="inline-flex rounded-full bg-[#f3e8ff] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
            Features
          </span>
          <h2 className="mt-5 text-[2rem] font-bold leading-tight tracking-tight text-[#111] sm:text-[2.35rem] md:text-[2.6rem]">
            Everything You Need to Succeed
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-500 sm:text-base">
            Powerful tools and resources, designed to make learning simple, effective and
            enjoyable.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)_minmax(0,1fr)] lg:items-center lg:gap-6 xl:gap-8">
          <div className="order-2 space-y-4 lg:order-1">
            {leftFeatures.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>

          <div className="relative order-1 mx-auto flex w-full max-w-[360px] flex-col items-center lg:order-2 xl:max-w-[400px]">
            <p
              className={`${caveat.className} mb-4 text-center text-[1.35rem] leading-tight text-slate-500 sm:text-[1.45rem]`}
            >
              Learn
              <br />
              Practice
              <br />
              Grow
              <br />
              Repeat
            </p>

            <div className="flex justify-center">
              <Image
                src="/images/icons/student5.png"
                alt="Student learning on laptop"
                width={760}
                height={900}
                className="h-auto w-full max-w-[320px] object-contain sm:max-w-[360px]"
              />
            </div>

            <div className="mt-6 flex flex-col items-center text-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(90deg,#b100ff_0%,#c026d3_100%)] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_28px_rgba(177,0,255,0.28)] transition hover:-translate-y-0.5"
              >
                Start Learning Free
                <span aria-hidden>→</span>
              </Link>
              <p className={`${caveat.className} mt-3 text-[1.2rem] text-slate-500`}>
                A brighter you, starts here.
              </p>
            </div>
          </div>

          <div className="order-3 space-y-4">
            {rightFeatures.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>

        <p
          className={`${caveat.className} mt-10 text-[1.35rem] leading-tight text-slate-500 sm:mt-12 sm:text-[1.5rem] md:-rotate-6`}
        >
          Small Steps
          <br />
          Big Results
        </p>
      </div>
    </section>
  );
}
