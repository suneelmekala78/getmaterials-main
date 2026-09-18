import Image from "next/image";
import Link from "next/link";

const headlineAvatars = [
  "/images/stu1.jpg",
  "/images/stu2.jpg",
  "/images/default-profile-pic.png",
];

const statRows = [
  {
    value: "2x",
    label: "Faster Revision",
    description:
      "Find the right notes and previous papers faster — organized by subject and college.",
  },
  {
    value: "100%",
    label: "Free Materials",
    description:
      "Download study resources from verified teachers without paywalls on GetMaterials.",
  },
];

const sidePoints = [
  "Practice with quizzes and join polls — built for students, alongside free study materials.",
  "Access verified materials from teachers and students across colleges — all in one place.",
];

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="shrink-0">
      <p className="text-[2.1rem] font-extrabold leading-none text-[#111] sm:text-[2.5rem]">
        {value}
      </p>
      <p className="mt-1.5 text-sm font-medium text-slate-500 sm:text-[15px]">
        {label}
      </p>
    </div>
  );
}

export default function PlatformShowcase() {
  return (
    <section className="bg-white px-6 py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="relative mx-auto mb-16 max-w-4xl md:mb-20 lg:max-w-5xl">
          <span
            aria-hidden
            className="pointer-events-none absolute -left-2 top-0 select-none font-serif text-[5rem] leading-none text-slate-200 sm:-left-4 sm:text-[6rem] md:text-[7rem]"
          >
            &ldquo;
          </span>

          <h2 className="relative text-center text-[1.65rem] font-extrabold leading-[1.3] tracking-tight text-[#111] sm:text-[2.1rem] md:text-[2.6rem] lg:text-[2.85rem]">
            Platform that{" "}
            <span className="mx-0.5 inline-flex translate-y-[-2px] align-middle">
              <span className="inline-flex -space-x-2.5">
                {headlineAvatars.map((src) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    width={44}
                    height={44}
                    className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm sm:h-9 sm:w-9 md:h-10 md:w-10"
                  />
                ))}
              </span>
            </span>{" "}
            helps curious{" "}
            <Image
              src="/images/icons/stars.png"
              alt=""
              width={48}
              height={48}
              className="mx-0.5 inline-block h-7 w-7 translate-y-[-2px] align-middle sm:h-8 sm:w-8 md:h-9 md:w-9"
              aria-hidden
            />
            <br className="hidden sm:block" />
            <span className="sm:ml-1">
              {" "}
              minds learn faster build skills and succeed{" "}
            </span>
            <Image
              src="/images/icons/hand-thumbup.png"
              alt=""
              width={48}
              height={48}
              className="mx-0.5 inline-block h-7 w-7 translate-y-[-2px] align-middle sm:h-8 sm:w-8 md:h-9 md:w-9"
              aria-hidden
            />{" "}
            anywhere
          </h2>
        </div>

        {/* Desktop: stat | description | character (span 2) | side text */}
        <div className="hidden lg:grid lg:grid-cols-[118px_minmax(0,1fr)_minmax(220px,280px)_minmax(0,1fr)] lg:grid-rows-[auto_auto_auto] lg:items-start lg:gap-x-10 lg:gap-y-14">
          <div className="pt-1">
            <StatBlock value={statRows[0].value} label={statRows[0].label} />
          </div>
          <p className="max-w-sm pt-2 text-[15px] leading-relaxed text-slate-600">
            {statRows[0].description}
          </p>
          <div className="relative row-span-2 mx-auto w-full max-w-[280px] self-center justify-self-center">
            <Image
              src="/images/icons/student2.png"
              alt="Student ready to learn"
              width={520}
              height={680}
              className="h-auto w-full object-contain"
            />
            <div className="pointer-events-none absolute -right-3 -top-2">
              <Image
                src="/images/icons/paper-rocket.png"
                alt=""
                width={72}
                height={72}
                className="relative h-14 w-14 rotate-[16deg]"
                aria-hidden
              />
            </div>
          </div>
          <p className="max-w-sm pt-2 text-[15px] leading-relaxed text-slate-600">
            {sidePoints[0]}
          </p>

          <div className="pt-1">
            <StatBlock value={statRows[1].value} label={statRows[1].label} />
          </div>
          <p className="max-w-sm pt-2 text-[15px] leading-relaxed text-slate-600">
            {statRows[1].description}
          </p>
          <div className="flex flex-col gap-5 pt-1">
            <p className="max-w-sm text-[15px] leading-relaxed text-slate-600">
              {sidePoints[1]}
            </p>
            <Link
              href="/signup"
              className="inline-flex w-fit items-center justify-center rounded-full bg-[#111] px-7 py-3 text-[15px] font-semibold text-white shadow-[0_14px_34px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-black"
            >
              Join Now
            </Link>
          </div>
        </div>

        {/* Mobile / tablet */}
        <div className="space-y-12 lg:hidden">
          {statRows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[88px_1fr] items-start gap-5 sm:grid-cols-[104px_1fr]"
            >
              <StatBlock value={row.value} label={row.label} />
              <p className="pt-1 text-[15px] leading-relaxed text-slate-600">
                {row.description}
              </p>
            </div>
          ))}

          <div className="grid grid-cols-1 items-end gap-8 sm:grid-cols-[minmax(0,280px)_1fr]">
            <div className="relative mx-auto w-full max-w-[260px] sm:mx-0">
              <Image
                src="/images/icons/student2.png"
                alt="Student ready to learn"
                width={520}
                height={680}
                className="h-auto w-full object-contain"
              />
              <div className="pointer-events-none absolute -right-2 -top-2">
                <svg
                  aria-hidden
                  className="absolute -left-10 top-7 h-14 w-14 text-[#8ec5ff]"
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
                  className="relative h-12 w-12 rotate-[16deg]"
                  aria-hidden
                />
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {sidePoints.map((text) => (
                <p
                  key={text}
                  className="text-[15px] leading-relaxed text-slate-600"
                >
                  {text}
                </p>
              ))}
              <Link
                href="/signup"
                className="inline-flex w-fit items-center justify-center rounded-full bg-[#111] px-7 py-3 text-[15px] font-semibold text-white shadow-[0_14px_34px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-black"
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
