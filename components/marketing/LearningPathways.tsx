import Image from "next/image";
import Link from "next/link";

const cards = [
  {
    eyebrow: "Build your foundation",
    title: "Materials",
    images: [
      { src: "/images/hero.png", alt: "Study materials", className: "left-0 top-8 w-[58%] rotate-[-6deg]" },
      { src: "/images/default-thumbnail.png", alt: "Notes and guides", className: "right-0 top-0 w-[52%] rotate-[8deg]" },
    ],
  },
  {
    eyebrow: "Apply what you learn",
    title: "Quizzes",
    images: [
      { src: "/images/img1.jpg", alt: "Practice quiz", className: "left-2 top-6 w-[48%] rotate-[-8deg]" },
      { src: "/images/img2.jpg", alt: "Interactive learning", className: "right-0 top-0 w-[54%] rotate-[10deg]" },
    ],
  },
  {
    eyebrow: "See your improvement",
    title: "Progress",
    images: [
      { src: "/images/stu1.jpg", alt: "Student progress", className: "left-0 top-10 w-[46%] rotate-[-5deg]" },
      { src: "/images/why-hero.png", alt: "Learning journey", className: "right-0 top-0 w-[56%] rotate-[6deg]" },
    ],
  },
  {
    eyebrow: "Grow without limits",
    title: "Community",
    images: [
      { src: "/images/be-part.png", alt: "Student community", className: "left-1 top-8 w-[58%] rotate-[-4deg]" },
      { src: "/images/stu2.jpg", alt: "Collaborative learning", className: "right-0 top-2 w-[48%] rotate-[9deg]" },
    ],
  },
];

export default function LearningPathways() {
  return (
    <section className="relative isolate overflow-hidden bg-[#d8ebff]">
      <Image
        src="/images/sky-grass.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-bottom"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-0 pt-14 sm:pt-16 md:pt-20">
        <p className="mx-auto max-w-2xl text-center text-[15px] leading-relaxed text-slate-600 sm:text-base">
          GetMaterials helps learners build real world skills through expert-led resources,
          flexible learning, and clear progress tracking.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {cards.map((card) => (
            <article
              key={card.title}
              className="overflow-hidden rounded-[24px] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="px-5 pb-0 pt-5 sm:px-6 sm:pt-6">
                <p className="text-[13px] font-medium text-slate-500">{card.eyebrow}</p>
                <h3 className="mt-1 text-[1.75rem] font-extrabold tracking-tight text-[#111] sm:text-[1.9rem]">
                  {card.title}
                </h3>
              </div>

              <div className="relative mt-4 h-[150px] px-4 pb-5 sm:h-[165px]">
                {card.images.map((image) => (
                  <div
                    key={image.src}
                    className={`absolute overflow-hidden rounded-2xl border border-white/80 shadow-[0_10px_24px_rgba(15,23,42,0.12)] ${image.className}`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={320}
                      height={220}
                      className="h-[92px] w-full object-cover sm:h-[104px]"
                    />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="relative mt-10 flex min-h-[280px] items-end justify-center pb-8 sm:min-h-[320px] sm:pb-10 md:min-h-[360px]">
          <Link
            href="/signup"
            className="relative z-20 inline-flex items-center justify-center rounded-full bg-[#111] px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_34px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-black"
          >
            Start Learning
          </Link>

          <div className="pointer-events-none absolute bottom-0 right-[-1rem] z-30 w-[min(52vw,320px)] sm:right-0 sm:w-[min(42vw,360px)] md:w-[380px] lg:w-[420px]">
            <Image
              src="/images/student.png"
              alt="Student pointing upward"
              width={1145}
              height={1373}
              className="h-auto w-full object-contain object-bottom"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
