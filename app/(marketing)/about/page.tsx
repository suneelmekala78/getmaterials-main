import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Caveat } from "next/font/google";
import { Mail, MapPin } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_OFFICE } from "@/lib/shared";
import { listingMetadata } from "@/lib/seo";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = listingMetadata({
  title: "About Us — Our Mission to Make Education Free",
  description:
    "Learn about GetMaterials — our mission to make quality education free and accessible to every student in India. Founded by Suneel Mekala, we provide free study materials, notes & resources.",
  path: "/about",
  keywords: [
    "about GetMaterials",
    "free education India",
    "Suneel Mekala",
    "open education platform",
    "student community",
  ],
});

const stats = [
  { value: "10K+", label: "Materials uploaded", image: "/images/icons/books.png", card: "bg-[#f3e8ff]" },
  { value: "500+", label: "Expert teachers", image: "/images/icons/community.png", card: "bg-[#eff6ff]" },
  { value: "25K+", label: "Active learners", image: "/images/icons/students.png", card: "bg-[#ecfdf3]" },
  { value: "100%", label: "Free forever", image: "/images/icons/love.png", card: "bg-[#fde8f2]" },
];

const values = [
  {
    title: "Education First",
    desc: "Everything we build is centered around helping students learn better, faster, and for free.",
    image: "/images/icons/books.png",
    card: "bg-[#f3e8ff]",
  },
  {
    title: "Community Driven",
    desc: "Teachers and students collaborate to create and improve study materials together.",
    image: "/images/icons/community.png",
    card: "bg-[#eff6ff]",
  },
  {
    title: "Trust & Quality",
    desc: "Every material is reviewed. We focus on reliable resources students can depend on.",
    image: "/images/icons/verified.png",
    card: "bg-[#ecfdf3]",
  },
  {
    title: "Share & Grow",
    desc: "No registration walls for browsing. Education should be a right, not a product.",
    image: "/images/icons/share.png",
    card: "bg-[#fff4e5]",
  },
  {
    title: "Built with Passion",
    desc: "GetMaterials is a passion project by students and educators who believe in free knowledge.",
    image: "/images/icons/love.png",
    card: "bg-[#fde8f2]",
  },
  {
    title: "Always Improving",
    desc: "We ship features regularly based on community feedback. The best is yet to come.",
    image: "/images/icons/progress.png",
    card: "bg-[#e8f3ff]",
  },
];

export default function AboutPage() {
  return (
    <main className="font-marketing">
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#eef6ff_0%,#faf8ff_100%)] px-6 pb-16 pt-28 sm:pb-20 sm:pt-32 md:pb-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 top-20 h-56 w-56 rounded-full bg-[#f3e8ff]/50 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 bottom-0 h-48 w-48 rounded-full bg-[#e8f3ff]/60 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-14">
          <div className="text-center lg:text-left">
            <span className="inline-flex rounded-full bg-[#f3e8ff] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              About GetMaterials
            </span>
            <h1 className="mt-5 text-[2rem] font-bold leading-tight tracking-tight text-[#111] sm:text-[2.5rem] md:text-[3rem]">
              Making quality education{" "}
              <span className="bg-[linear-gradient(90deg,#9333ea_0%,#b100ff_55%,#c026d3_100%)] bg-clip-text text-transparent">
                free for everyone
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-base lg:mx-0">
              GetMaterials is a free, community-driven platform where verified teachers share study
              materials and students access them — all without paying a single rupee. We believe
              education is a right, not a privilege.
            </p>
            <p className={`${caveat.className} mt-6 text-[1.35rem] leading-tight text-slate-500 lg:text-[1.45rem]`}>
              Learn. Share. Grow.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[420px] lg:max-w-none">
            <div className="overflow-hidden rounded-[28px] shadow-[0_20px_50px_rgba(17,17,17,0.08)]">
              <Image
                src="/images/student-collage.png"
                alt="Students learning with GetMaterials"
                width={980}
                height={740}
                className="h-[280px] w-full object-cover object-center sm:h-[320px] lg:h-[360px]"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:py-20 md:py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <span className="inline-flex rounded-full bg-[#f3e8ff] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              Our Mission
            </span>
            <h2 className="mt-5 text-[2rem] font-bold leading-tight tracking-tight text-[#111] sm:text-[2.35rem]">
              Why we built GetMaterials
            </h2>
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-slate-600 sm:text-base">
              <p>
                Every student deserves access to quality study materials. But many students —
                especially in India — struggle to find reliable notes, guides, and resources online.
                They waste hours searching scattered websites or paying for materials that should be
                free.
              </p>
              <p>
                GetMaterials was born out of frustration with this system. As students ourselves,
                we experienced these problems firsthand. So we built the platform we wished existed:
                one central place where verified teachers share high-quality materials, and students
                access them completely free.
              </p>
              <p>
                Our vision is simple —{" "}
                <strong className="font-semibold text-[#111]">
                  make education accessible to everyone, regardless of financial background
                </strong>
                . We&apos;re not building a business. We&apos;re building a movement.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`${stat.card} rounded-[22px] p-5 sm:p-6`}
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center">
                  <Image
                    src={stat.image}
                    alt=""
                    width={44}
                    height={44}
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <p className="text-[1.65rem] font-bold leading-none text-[#111] sm:text-[1.85rem]">
                  {stat.value}
                </p>
                <p className="mt-2 text-[13px] text-slate-500 sm:text-[14px]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#fafafa] px-6 py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center sm:mb-14">
            <span className="inline-flex rounded-full bg-[#f3e8ff] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              Our Values
            </span>
            <h2 className="mt-5 text-[2rem] font-bold tracking-tight text-[#111] sm:text-[2.35rem] md:text-[2.6rem]">
              What we believe in
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-500 sm:text-base">
              Guiding principles that drive everything we do to create a better learning experience
              for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {values.map((value) => (
              <article
                key={value.title}
                className={`${value.card} rounded-[22px] p-6 sm:p-7`}
              >
                <div className="mb-4 flex h-[72px] w-[72px] items-center justify-center">
                  <Image
                    src={value.image}
                    alt=""
                    width={72}
                    height={72}
                    className="h-16 w-16 object-contain"
                  />
                </div>
                <h3 className="text-[17px] font-bold text-[#111] sm:text-[18px]">{value.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{value.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            <div className="relative flex justify-center lg:justify-start">
              <Image
                src="/images/icons/student5.png"
                alt="Student using GetMaterials"
                width={400}
                height={480}
                className="h-auto w-full max-w-[280px] object-contain sm:max-w-[320px]"
              />
            </div>

            <div>
              <span className="inline-flex rounded-full bg-[#f3e8ff] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                Reach Out
              </span>
              <h2 className="mt-5 text-[2rem] font-bold leading-tight tracking-tight text-[#111] sm:text-[2.35rem]">
                Get in touch with us
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-600 sm:text-base">
                Have questions, feedback, or want to collaborate? We&apos;d love to hear from
                students, teachers, and anyone who believes in free education.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-start gap-4 rounded-[22px] bg-[#f3e8ff] p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(177,0,255,0.08)]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)]">
                    <Mail className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-[#111]">Email</p>
                    <p className="mt-1 text-[14px] text-slate-600">{CONTACT_EMAIL}</p>
                  </div>
                </a>
                <div className="flex items-start gap-4 rounded-[22px] bg-[#eff6ff] p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)]">
                    <MapPin className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-[#111]">Office</p>
                    <p className="mt-1 text-[14px] text-slate-600">{CONTACT_OFFICE}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 sm:pb-20 md:pb-24">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#f6f0ff_0%,#eef4ff_100%)] px-6 py-10 text-center sm:px-10 sm:py-12">
          <Image
            src="/images/icons/stars.png"
            alt=""
            width={64}
            height={64}
            className="pointer-events-none absolute right-6 top-6 h-12 w-12 rotate-[8deg] opacity-80"
            aria-hidden
          />
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#111] sm:text-[2rem]">
            Want to be part of the mission?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-slate-600 sm:text-base">
            Whether you&apos;re a student who wants to help, a teacher who wants to share, or
            someone who believes in free education — there&apos;s a place for you.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(90deg,#b100ff_0%,#c026d3_100%)] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_28px_rgba(177,0,255,0.24)] transition hover:-translate-y-0.5"
            >
              Get in Touch
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/materials"
              className="inline-flex items-center justify-center rounded-full border-2 border-[#d8b4fe] bg-white px-7 py-3.5 text-[15px] font-semibold text-[var(--primary)] transition hover:bg-[#faf5ff]"
            >
              Browse Materials
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
