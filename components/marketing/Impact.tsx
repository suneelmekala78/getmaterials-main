import Image from "next/image";
import Link from "next/link";
import { FaChartBar, FaDownload, FaUsers, FaGlobeAsia } from "react-icons/fa";

const cards = [
  {
    icon: FaChartBar,
    value: "12K+",
    title: "Materials Shared",
    hint: "By our community",
    tint: "text-[#7C3AED]",
    iconBg: "bg-[#f3e8ff]",
  },
  {
    icon: FaDownload,
    value: "2.4L+",
    title: "Downloads",
    hint: "This month",
    tint: "text-[#16A34A]",
    iconBg: "bg-[#ecfdf3]",
  },
  {
    icon: FaUsers,
    value: "25K+",
    title: "Active Users",
    hint: "Every month",
    tint: "text-[#EA580C]",
    iconBg: "bg-[#fff4e5]",
  },
  {
    icon: FaGlobeAsia,
    value: "All India",
    title: "Presence",
    hint: "From 500+ cities",
    tint: "text-[#2563EB]",
    iconBg: "bg-[#e8f3ff]",
  },
];

export default function Impact() {
  return (
    <section id="impact" className="font-marketing scroll-mt-24 px-6 pb-16 pt-2 sm:pb-20 md:pb-24">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,#f6f0ff_0%,#f4eeff_100%)] px-6 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-[#eadcff]/70 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 bottom-0 h-32 w-32 rounded-full bg-[#eadcff]/60 blur-2xl"
          />

          <div className="relative grid grid-cols-1 items-end gap-8 md:grid-cols-2 md:gap-10 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.15fr)] xl:gap-8">
            <div className="max-w-md md:col-span-2 xl:col-span-1 xl:self-center">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
                Our Impact
              </p>
              <h2 className="mt-3 text-[2rem] font-bold leading-tight tracking-tight text-[#111] sm:text-[2.35rem] md:text-[2.5rem]">
                Making a Difference
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-600 sm:text-base">
                Together, we are building the largest free study resource platform in India.
              </p>

              <Link
                href="/materials"
                className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-[linear-gradient(90deg,#b100ff_0%,#c026d3_100%)] px-6 py-3 text-[15px] font-semibold text-white shadow-[0_12px_28px_rgba(177,0,255,0.28)] transition hover:-translate-y-0.5"
              >
                <FaChartBar className="text-sm" />
                See Our Impact
                <span aria-hidden>→</span>
              </Link>
            </div>

            <div className="order-3 flex justify-center md:order-3 xl:order-2 xl:justify-end">
              <Image
                src="/images/icons/student3.png"
                alt="Student with books giving thumbs up"
                width={760}
                height={900}
                className="h-auto w-full max-w-[260px] object-contain sm:max-w-[300px] xl:max-w-[280px] xl:translate-y-2 2xl:max-w-[320px]"
              />
            </div>

            <div className="relative order-2 md:order-2 md:col-span-2 xl:order-3 xl:col-span-1">
              <div className="pointer-events-none absolute -right-1 -top-5 z-20 sm:-top-7">
                <svg
                  aria-hidden
                  className="absolute -left-10 top-7 h-14 w-14 text-[#c4b5fd]"
                  viewBox="0 0 64 64"
                  fill="none"
                >
                  <path
                    d="M4 58 C 16 42, 26 30, 40 20 S 54 10, 58 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4 6"
                    strokeLinecap="round"
                  />
                </svg>
                <Image
                  src="/images/icons/paper-rocket.png"
                  alt=""
                  width={72}
                  height={72}
                  className="relative h-12 w-12 rotate-[16deg] sm:h-14 sm:w-14"
                  aria-hidden
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                {cards.map((card) => (
                  <article
                    key={card.title}
                    className="rounded-[20px] bg-white p-4 shadow-[0_10px_28px_rgba(88,44,190,0.08)] sm:p-5"
                  >
                    <div
                      className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg}`}
                    >
                      <card.icon className={`text-lg ${card.tint}`} />
                    </div>
                    <p className="text-[1.65rem] font-bold leading-none text-[#111] sm:text-[1.85rem]">
                      {card.value}
                    </p>
                    <p className="mt-2 text-[14px] font-bold text-[#111] sm:text-[15px]">
                      {card.title}
                    </p>
                    <p className="mt-1 text-[12px] text-slate-500 sm:text-[13px]">{card.hint}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
