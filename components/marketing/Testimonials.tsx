import Image from "next/image";
import Link from "next/link";
import { Caveat } from "next/font/google";
import { FileText, Heart, Users } from "lucide-react";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type Review = {
  name: string;
  role: string;
  text: string;
  time: string;
  avatar: string;
  quoteColor: string;
};

const reviews: Review[] = [
  {
    name: "Harshitha",
    role: "B.Tech Student",
    text: "GetMaterials saved me so much time during exam prep. I found all the handwritten notes I needed for Mathematics in one place.",
    time: "10:15 AM — Aug 12, 2024",
    avatar: "/images/stu1.jpg",
    quoteColor: "text-[#e9d5ff]",
  },
  {
    name: "Vardhan",
    role: "B.Tech Student",
    text: "I love how the materials are curated by real teachers. The quality is much better than random PDFs you find online — and it's free!",
    time: "11:20 AM — Jun 18, 2024",
    avatar: "/images/img1.jpg",
    quoteColor: "text-[#ddd6fe]",
  },
  {
    name: "Sai Reddy",
    role: "ECE Student",
    text: "The web development materials are incredibly well-organized. I went from zero to building my first website using free resources here.",
    time: "6:42 PM — Jul 03, 2024",
    avatar: "/images/stu2.jpg",
    quoteColor: "text-[#fde68a]",
  },
  {
    name: "Ramani",
    role: "Teacher",
    text: "As a teacher, I upload my notes here to help students beyond my classroom. The platform is simple and students genuinely appreciate it.",
    time: "2:05 PM — May 29, 2024",
    avatar: "/images/default-teacher-pic.png",
    quoteColor: "text-[#bbf7d0]",
  },
  {
    name: "Rahul",
    role: "Mechanical Student",
    text: "Practical exercises and projects helped me build confidence before every exam cycle. Exactly what our batch needed.",
    time: "4:33 PM — Mar 21, 2024",
    avatar: "/images/stu1.jpg",
    quoteColor: "text-[#bfdbfe]",
  },
  {
    name: "Ananya",
    role: "MBA Student",
    text: "Quizzes and polls on GetMaterials help me revise between classes, and the notes are easy to find by subject.",
    time: "9:18 AM — Apr 08, 2024",
    avatar: "/images/default-profile-pic.png",
    quoteColor: "text-[#fbcfe8]",
  },
];

const stats = [
  {
    value: "Free",
    label: "Study materials",
    icon: FileText,
    iconBg: "bg-[#ecfdf3]",
    iconColor: "text-[#16a34a]",
  },
  {
    value: "Quizzes",
    label: "& student polls",
    icon: Heart,
    iconBg: "bg-[#fde8f2]",
    iconColor: "text-[#db2777]",
  },
  {
    value: "Teachers",
    label: "Verified uploads",
    icon: Users,
    iconBg: "bg-[#f3e8ff]",
    iconColor: "text-[#9333ea]",
  },
];

function YellowDashes({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex gap-1 ${className}`} aria-hidden>
      <span className="inline-block h-0.5 w-3 rotate-[35deg] rounded-full bg-amber-300" />
      <span className="inline-block h-0.5 w-3 -rotate-[35deg] rounded-full bg-amber-300" />
    </span>
  );
}

function Stars() {
  return (
    <div className="flex shrink-0 gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-[12px] text-amber-400 sm:text-[13px]">
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="relative flex min-h-[220px] flex-col rounded-[22px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:min-h-[230px] sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Image
            src={review.avatar}
            alt={review.name}
            width={48}
            height={48}
            className="h-11 w-11 shrink-0 rounded-full border-2 border-[#f3e8ff] object-cover sm:h-12 sm:w-12"
          />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold text-[#111]">{review.name}</p>
            <p className="truncate text-[13px] text-slate-500">{review.role}</p>
          </div>
        </div>
        <Stars />
      </div>

      <p className="relative z-[1] flex-1 text-[14px] leading-[1.65] text-slate-600 sm:text-[15px]">
        {review.text}
      </p>

      <div className="relative z-[1] mt-4">
        <p className="text-[12px] text-slate-400">{review.time}</p>
      </div>

      <span
        aria-hidden
        className={`pointer-events-none absolute bottom-3 right-4 select-none font-serif text-[3.5rem] leading-none sm:bottom-4 sm:right-5 sm:text-[4rem] ${review.quoteColor}`}
      >
        &rdquo;
      </span>
    </article>
  );
}

export default function Testimonials() {
  return (
    <section className="font-marketing relative overflow-hidden bg-[linear-gradient(180deg,#eef6ff_0%,#f5f0ff_45%,#faf8ff_100%)] px-6 py-16 sm:py-20 md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-12 top-20 h-52 w-52 rounded-full bg-[#dbeafe]/60 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 bottom-24 h-44 w-44 rounded-full bg-[#f3e8ff]/50 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="relative mb-10 sm:mb-12">
          <div
            className={`${caveat.className} pointer-events-none absolute -left-2 top-2 hidden md:block lg:-left-6`}
          >
            <YellowDashes className="mb-1" />
            <p className="-rotate-6 text-[1.25rem] leading-tight text-[#2563eb] lg:text-[1.4rem]">
              Real Students
              <br />
              Real Stories
            </p>
          </div>

          <div
            className={`${caveat.className} pointer-events-none absolute -right-2 top-2 hidden text-right md:block lg:-right-6`}
          >
            <span aria-hidden className="mb-1 inline-block text-[#f472b6]">
              ♥
            </span>
            <p className="rotate-6 text-[1.25rem] leading-tight text-[#2563eb] lg:text-[1.4rem]">
              Learn
              <br />
              Share
              <br />
              Grow
            </p>
          </div>

          <div className="text-center">
            <span className="inline-flex rounded-full bg-[#f3e8ff] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              Testimonials
            </span>
            <h2 className="mt-5 text-[2rem] font-bold tracking-tight text-[#111] sm:text-[2.35rem] md:text-[2.6rem]">
              Reviews from our users
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-500 sm:text-base">
              Hear from students and teachers across India who use GetMaterials every day.
            </p>
          </div>
        </div>

        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard key={review.name} review={review} />
          ))}

          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-4 right-0 hidden h-24 w-24 opacity-50 lg:block"
            style={{
              backgroundImage:
                "radial-gradient(circle, #93c5fd 1.5px, transparent 1.5px)",
              backgroundSize: "11px 11px",
            }}
          />
        </div>

        <div className="relative mt-10 overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#f6f0ff_0%,#eef4ff_100%)] px-5 pt-8 sm:mt-12 sm:px-8 sm:pt-10">
          <Image
            src="/images/icons/student3.png"
            alt=""
            width={220}
            height={260}
            className="pointer-events-none absolute bottom-0 -left-3 z-[1] h-[170px] w-auto object-contain object-bottom sm:-left-2 sm:h-[195px] lg:-left-4 lg:h-[220px] xl:h-[240px]"
            aria-hidden
          />

          <div
            aria-hidden
            className="pointer-events-none absolute bottom-4 right-4 h-20 w-20 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle, #93c5fd 1.5px, transparent 1.5px)",
              backgroundSize: "11px 11px",
            }}
          />

          <div className="relative grid grid-cols-1 gap-8 pb-8 sm:pb-10 lg:grid-cols-[minmax(0,260px)_1fr_minmax(0,190px)] lg:items-center lg:gap-6">
            <div className="relative flex min-h-[150px] items-end pl-[108px] sm:min-h-[170px] sm:pl-[128px] lg:min-h-[190px] lg:pl-[140px]">
              <div className="relative z-[1] mb-6 rounded-[18px] border-2 border-[#93c5fd] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(59,130,246,0.08)] sm:mb-8">
                <p
                  className={`${caveat.className} text-[1.05rem] leading-snug text-[#2563eb] sm:text-[1.15rem]`}
                >
                  Join thousands
                  <br />
                  of learners today!
                </p>
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-8 h-4 w-4 rotate-45 border-b-2 border-r-2 border-[#93c5fd] bg-white"
                />
              </div>
            </div>

            <div className="relative z-[1] text-center">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4">
                {stats.map((stat) => (
                  <div key={stat.value} className="flex flex-col items-center">
                    <div
                      className={`${stat.iconBg} mb-2.5 flex h-11 w-11 items-center justify-center rounded-xl`}
                    >
                      <stat.icon className={`h-5 w-5 ${stat.iconColor}`} strokeWidth={2.2} />
                    </div>
                    <p className="text-[1.85rem] font-bold leading-none text-[#111] sm:text-[2rem]">
                      {stat.value}
                    </p>
                    <p className="mt-1.5 text-[13px] text-slate-500 sm:text-[14px]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex justify-center sm:mt-8">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(90deg,#b100ff_0%,#c026d3_100%)] px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_28px_rgba(177,0,255,0.24)] transition hover:-translate-y-0.5"
                >
                  Join Now
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>

            <div className={`${caveat.className} relative hidden lg:block`}>
              <YellowDashes className="mb-1 ml-auto" />
              <p className="rotate-6 text-right text-[1.3rem] leading-tight text-[var(--primary)] xl:text-[1.45rem]">
                Better Learning
                <br />
                Together
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
