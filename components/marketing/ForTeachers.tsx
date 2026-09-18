import Image from "next/image";
import Link from "next/link";
import { Caveat } from "next/font/google";
import { FileText, GraduationCap, Users } from "lucide-react";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const teacherPoints = [
  {
    title: "Reach More Students",
    desc: "Share your notes, guides and resources with learners across India.",
    image: "/images/icons/community.png",
    card: "bg-[#f3e8ff]",
  },
  {
    title: "Share with Ease",
    desc: "Upload study materials in minutes, completely free.",
    image: "/images/icons/share.png",
    card: "bg-[#fff4e5]",
  },
  {
    title: "Make a Difference",
    desc: "Help students learn better and build a stronger academic future.",
    image: "/images/icons/progress.png",
    card: "bg-[#ecfdf3]",
  },
];

const teacherStats = [
  {
    value: "Reach",
    label: "More students",
    icon: GraduationCap,
    iconBg: "bg-[#f3e8ff]",
    iconColor: "text-[#9333ea]",
  },
  {
    value: "Share",
    label: "Notes & PDFs",
    icon: FileText,
    iconBg: "bg-[#ecfdf3]",
    iconColor: "text-[#16a34a]",
  },
  {
    value: "Free",
    label: "For teachers too",
    icon: Users,
    iconBg: "bg-[#fff4e5]",
    iconColor: "text-[#ea580c]",
  },
];

export default function ForTeachers() {
  return (
    <section
      id="for-teachers"
      className="font-marketing relative scroll-mt-24 overflow-hidden bg-white px-6 py-16 sm:py-20 md:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-12 h-56 w-56 rounded-full bg-[#f3e8ff]/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 bottom-8 h-48 w-48 rounded-full bg-[#e8f3ff]/60 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div>
            <span className="inline-flex rounded-full bg-[#f3e8ff] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              For Teachers
            </span>

            <h2 className="mt-5 text-[2rem] font-bold leading-tight tracking-tight text-[#111] sm:text-[2.35rem] md:text-[2.5rem]">
              Teach. Share. Make an Impact.
            </h2>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-600 sm:text-base">
              Join a growing community of educators who are empowering students by sharing quality
              learning materials. Your knowledge can reach thousands and create real change.
            </p>

            <ul className="mt-8 space-y-5">
              {teacherPoints.map((point) => (
                <li key={point.title} className="flex items-start gap-4">
                  <div
                    className={`${point.card} flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl sm:h-16 sm:w-16`}
                  >
                    <Image
                      src={point.image}
                      alt=""
                      width={56}
                      height={56}
                      className="h-9 w-9 object-contain sm:h-10 sm:w-10"
                    />
                  </div>
                  <div className="pt-0.5">
                    <h3 className="text-[15px] font-bold text-[#111] sm:text-[16px]">
                      {point.title}
                    </h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-slate-500 sm:text-[15px]">
                      {point.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[linear-gradient(90deg,#b100ff_0%,#c026d3_100%)] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_28px_rgba(177,0,255,0.24)] transition hover:-translate-y-0.5 sm:w-auto"
            >
              Join as a Teacher
              <span
                aria-hidden
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-sm"
              >
                →
              </span>
            </Link>

            <p
              className={`${caveat.className} mt-5 text-[1.35rem] leading-tight text-slate-500 sm:text-[1.45rem]`}
            >
              Knowledge grows when shared.
            </p>
          </div>

          <div className="relative pb-10 sm:pb-12 lg:pr-10">
            <div className="relative overflow-hidden rounded-[28px]">
              <Image
                src="/images/teacher.png"
                alt="Teacher sharing study materials with students"
                width={980}
                height={740}
                className="h-[260px] w-full object-cover object-center sm:h-[300px] lg:h-[340px] xl:h-[360px]"
              />
            </div>

            <div className="absolute bottom-6 left-1/2 z-10 w-[calc(100%-1.5rem)] max-w-[520px] -translate-x-1/2 translate-y-1/2 rounded-[20px] bg-white px-4 py-4 shadow-[0_18px_50px_rgba(17,17,17,0.12)] sm:bottom-8 sm:w-[calc(100%-2rem)] sm:px-5 sm:py-5 lg:bottom-10">
              <div className="grid grid-cols-3 gap-2 sm:gap-0">
                {teacherStats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`flex flex-col items-center text-center sm:px-3 ${
                      index > 0 ? "border-l border-slate-100" : ""
                    }`}
                  >
                    <div
                      className={`${stat.iconBg} flex h-10 w-10 items-center justify-center rounded-xl sm:h-11 sm:w-11`}
                    >
                      <stat.icon className={`h-5 w-5 ${stat.iconColor}`} strokeWidth={2.2} />
                    </div>
                    <p className="mt-2 text-[1.1rem] font-bold leading-none text-[#111] sm:text-[1.25rem]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[11px] leading-snug text-slate-500 sm:text-[12px]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p
              className={`${caveat.className} pointer-events-none absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 text-[1.15rem] leading-tight text-slate-500 lg:block xl:-right-2 xl:text-[1.3rem]`}
            >
              Educate
              <br />
              Uplift
              <br />
              Transform
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
