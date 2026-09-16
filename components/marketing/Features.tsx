import Image from "next/image";
import Link from "next/link";
import { Caveat } from "next/font/google";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const features = [
  {
    title: "High-Quality Content",
    desc: "Expert-created study materials that are easy to understand and always up to date.",
    image: "/images/icons/books.png",
    card: "bg-[#f3e8ff]",
  },
  {
    title: "Learn at Your Pace",
    desc: "Flexible learning, anytime, anywhere — designed to fit your schedule.",
    image: "/images/icons/goal.png",
    card: "bg-[#ecfdf3]",
  },
  {
    title: "Build Real Skills",
    desc: "Go beyond theory with practice, projects and real-world examples.",
    image: "/images/icons/bulb.png",
    card: "bg-[#fff7ed]",
  },
  {
    title: "Join a Supportive Community",
    desc: "Learn, share and grow together with fellow learners across India.",
    image: "/images/icons/students.png",
    card: "bg-[#eff6ff]",
  },
];

const testimonialAvatars = [
  "/images/stu1.jpg",
  "/images/stu2.jpg",
  "/images/default-profile-pic.png",
];

export default function Features() {
  return (
    <section className="font-marketing relative overflow-hidden bg-[#fafafa] px-6 py-16 sm:py-20 md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-12 top-20 h-52 w-52 rounded-full bg-[#f3e8ff]/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 bottom-40 h-44 w-44 rounded-full bg-[#ecfdf3]/60 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12 text-center sm:mb-14">
          <span className="inline-flex rounded-full bg-[#f3e8ff] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
            Why Choose Us
          </span>
          <h2 className="mt-5 text-[2rem] font-bold leading-tight tracking-tight text-[#111] sm:text-[2.35rem] md:text-[2.6rem]">
            More Than Just Learning
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-500 sm:text-base">
            We&apos;re here to make quality education accessible, engaging and effective for every
            learner, everywhere.
          </p>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:gap-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {features.map((feature) => (
              <article
                key={feature.title}
                className={`${feature.card} flex min-h-[170px] items-start gap-4 rounded-[22px] p-5 sm:min-h-[180px] sm:p-6 lg:min-h-[190px] lg:p-7`}
              >
                <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center sm:h-[80px] sm:w-[80px]">
                  <Image
                    src={feature.image}
                    alt=""
                    width={96}
                    height={96}
                    className="h-auto max-h-[72px] w-auto object-contain sm:max-h-[80px]"
                  />
                </div>
                <div className="min-w-0 pt-1">
                  <h3 className="text-[16px] font-bold leading-snug text-[#111] sm:text-[17px]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-600 sm:text-[14px]">
                    {feature.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mx-auto flex w-full max-w-[360px] flex-col items-center lg:max-w-none lg:items-end">
            <p
              className={`${caveat.className} mb-4 text-center text-[1.35rem] leading-tight text-slate-500 lg:mb-5 lg:text-right xl:text-[1.5rem]`}
            >
              Better Learners
              <br />
              Brighter Futures
            </p>

            <Image
              src="/images/icons/student4.png"
              alt="Student pointing upward with books"
              width={760}
              height={900}
              className="h-auto w-full max-w-[320px] object-contain sm:max-w-[360px] lg:max-w-[340px] xl:max-w-[380px]"
            />
          </div>
        </div>

        <div className="mt-12 rounded-[24px] bg-[#f5f6f8] px-5 py-5 sm:mt-14 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex -space-x-2.5">
                {testimonialAvatars.map((src) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <div>
                <p className="text-[14px] leading-relaxed text-slate-700 sm:text-[15px]">
                  &ldquo;GetMaterials has completely changed the way I learn. It&apos;s simple,
                  effective and actually fun!&rdquo;
                </p>
                <p className="mt-1 text-[13px] text-slate-500">— A Happy Learner</p>
              </div>
            </div>

            <div className="hidden h-12 w-px bg-slate-200 lg:block" aria-hidden />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8 lg:gap-10">
              <div className="text-center sm:text-left">
                <p className="text-[1.75rem] font-bold leading-none text-[#111]">4.8/5</p>
                <div className="mt-1.5 flex justify-center gap-0.5 sm:justify-start">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-[15px] text-amber-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="mt-1 text-[13px] text-slate-500">Trusted by 25K+ learners</p>
              </div>

              <Link
                href="/signup"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,#b100ff_0%,#c026d3_100%)] px-6 py-3 text-[15px] font-semibold text-white shadow-[0_12px_28px_rgba(177,0,255,0.24)] transition hover:-translate-y-0.5"
              >
                Join Now
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
