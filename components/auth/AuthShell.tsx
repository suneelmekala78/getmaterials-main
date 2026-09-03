import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

const points = [
  "Free notes, PDFs and videos",
  "Shared by teachers and students",
  "Colleges across India",
];

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_520px] xl:grid-cols-[minmax(0,1fr)_560px]">
      <aside className="relative hidden lg:flex h-screen sticky top-0 overflow-hidden text-white">
        <Image
          src="/images/why-hero.png"
          alt="Student walking toward campus"
          fill
          priority
          sizes="55vw"
          className="object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20" />

        <div className="relative z-10 flex h-full w-full flex-col justify-between px-14 py-12 xl:px-20 xl:py-14">
          <Link href="/" className="inline-flex w-fit text-[1.55rem] font-extrabold tracking-tight">
            Get<span className="text-white">Materials</span>
          </Link>

          <div className="max-w-[420px]">
            <p className="text-sm font-semibold tracking-wide text-white/70 mb-3">
              Free for every student
            </p>
            <h1 className="text-[34px] xl:text-[40px] font-extrabold leading-[1.18] mb-4">
              Study materials from any college, in one place.
            </h1>
            <p className="text-[15px] leading-relaxed text-white/80 mb-6">
              Notes, PDFs and videos — shared by teachers and students across India.
            </p>
            <ul className="flex flex-wrap gap-2">
              {points.map((point) => (
                <li
                  key={point}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/95 backdrop-blur-[2px]"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <div className="min-h-screen flex flex-col bg-white lg:border-l lg:border-slate-100">
        <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-[420px] mx-auto">
            <Link
              href="/"
              className="mb-8 inline-block font-extrabold text-[1.45rem] text-[var(--primary)] lg:hidden"
            >
              Get<span className="text-black">Materials</span>
            </Link>

            <h2 className="text-[1.75rem] font-extrabold tracking-tight text-slate-900">
              {title}
            </h2>
            <div className="mt-2 mb-8 text-[15px] leading-relaxed text-slate-500">
              {subtitle}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
