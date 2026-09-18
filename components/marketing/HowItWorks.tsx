import Image from "next/image";
import Link from "next/link";
import { Caveat } from "next/font/google";
import { Zap } from "lucide-react";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const steps = [
  {
    num: "01",
    title: "Create Your Account",
    desc: "Sign up in seconds and join a community of learners.",
    image: "/images/icons/student-withlaptop.png",
    card: "bg-[#f3e8ff]",
    numColor: "text-[#9333ea]",
  },
  {
    num: "02",
    title: "Explore Resources",
    desc: "Browse free notes, subjects, quizzes, polls, and college resources.",
    image: "/images/icons/books.png",
    card: "bg-[#ecfdf3]",
    numColor: "text-[#16a34a]",
  },
  {
    num: "03",
    title: "Practice & Learn",
    desc: "Use practice tools and track your progress.",
    image: "/images/icons/checklist.png",
    card: "bg-[#fff7ed]",
    numColor: "text-[#ea580c]",
  },
  {
    num: "04",
    title: "Achieve Your Goals",
    desc: "Build skills, gain confidence and create a brighter future.",
    image: "/images/icons/student-happy.png",
    card: "bg-[#eff6ff]",
    numColor: "text-[#2563eb]",
  },
];

function StepArrow() {
  return (
    <svg
      aria-hidden
      className="hidden w-10 shrink-0 text-[#c084fc] xl:block"
      viewBox="0 0 40 48"
      fill="none"
    >
      <path
        d="M4 24 C 12 10, 20 10, 28 24 S 36 38, 36 38"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="5 6"
        strokeLinecap="round"
      />
      <path
        d="M30 34 L36 38 L30 42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StepCard({
  step,
}: {
  step: (typeof steps)[number];
}) {
  return (
    <article
      className={`${step.card} flex min-h-[340px] flex-col rounded-[24px] px-5 pb-6 pt-5 sm:min-h-[360px] sm:px-6 sm:pb-7 sm:pt-6`}
    >
      <p className={`text-[13px] font-semibold ${step.numColor}`}>{step.num}</p>

      <div className="mx-auto my-4 flex h-[150px] w-full max-w-[190px] items-end justify-center sm:my-5 sm:h-[165px]">
        <Image
          src={step.image}
          alt=""
          width={220}
          height={220}
          className="h-auto max-h-[150px] w-auto object-contain sm:max-h-[165px]"
        />
      </div>

      <h3 className="text-[17px] font-bold leading-snug text-[#111] sm:text-[18px]">
        {step.title}
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{step.desc}</p>
    </article>
  );
}

export default function HowItWorks() {
  return (
    <section className="font-marketing relative overflow-hidden bg-[#fafafa] px-6 py-16 sm:py-20 md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full bg-[#f3e8ff]/60 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 bottom-32 h-48 w-48 rounded-full bg-[#ecfdf3]/70 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="relative mb-12 text-center sm:mb-14">
          <span className="inline-flex rounded-full bg-[#f3e8ff] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
            How It Works
          </span>

          <div className="relative mx-auto mt-5 max-w-3xl overflow-visible">
            <h2 className="text-[2rem] font-bold leading-tight tracking-tight text-[#111] sm:text-[2.35rem] md:text-[2.6rem]">
              Your Learning Journey in 4 Simple Steps
            </h2>
            <p
              className={`${caveat.className} absolute top-1 hidden text-left text-[1.35rem] leading-none text-slate-500 md:block md:left-[calc(100%+2rem)] lg:top-0 lg:left-[calc(100%+3.5rem)] lg:text-[1.55rem] xl:left-[calc(100%+5rem)]`}
            >
              Small Steps
              <br />
              Big Progress
            </p>
          </div>

          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-500 sm:text-base">
            Get started in minutes and take one step closer to your goals with high-quality
            resources, totally free.
          </p>
        </div>

        <div className="hidden items-start justify-center xl:flex">
          {steps.map((step, index) => (
            <div key={step.num} className="flex items-start">
              <div className="w-[230px]">
                <StepCard step={step} />
              </div>
              {index < steps.length - 1 && (
                <div className="flex h-[340px] items-center px-1">
                  <StepArrow />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:hidden">
          {steps.map((step) => (
            <StepCard key={step.num} step={step} />
          ))}
        </div>

        <div className="relative mt-14 sm:mt-16">
          <p
            className={`${caveat.className} absolute -left-1 bottom-2 hidden text-[1.2rem] leading-tight text-slate-500 sm:block md:text-[1.35rem]`}
          >
            Better. Learners
            <br />
            Brighter Futures
          </p>

          <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-5 rounded-[24px] bg-white px-5 py-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:flex-row sm:gap-6 sm:px-6 sm:py-6 md:px-8">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f3e8ff] text-[var(--primary)]">
              <Zap className="h-5 w-5" fill="currentColor" />
            </div>

            <p className="flex-1 text-center text-[14px] leading-relaxed text-slate-600 sm:text-left sm:text-[15px]">
              Learning is easier when you have the right support. Join thousands of learners who
              are already building a better tomorrow.
            </p>

            <Link
              href="/signup"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(90deg,#b100ff_0%,#c026d3_100%)] px-6 py-3 text-[15px] font-semibold text-white shadow-[0_12px_28px_rgba(177,0,255,0.24)] transition hover:-translate-y-0.5"
            >
              Join Now
              <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="pointer-events-none absolute -right-1 -top-8 hidden sm:block md:-right-2">
            <Image
              src="/images/icons/stars.png"
              alt=""
              width={72}
              height={72}
              className="h-14 w-14 rotate-[8deg] md:h-16 md:w-16"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  );
}
