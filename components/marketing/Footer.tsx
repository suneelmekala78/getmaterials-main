import Link from "next/link";
import { Heart } from "lucide-react";
import { FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  CONTACT_EMAIL,
  CONTACT_OFFICE,
} from "@/lib/shared";

const platformLinks = [
  { href: "/materials", label: "Browse Materials" },
  { href: "/subjects", label: "Subjects" },
  { href: "/colleges", label: "Colleges" },
  { href: "/quizzes", label: "Quizzes" },
  { href: "/teachers", label: "Teachers" },
  { href: "/polls", label: "Polls" },
];

// Courses and Arena are not production-ready. Uncomment when they are.
// const productLinks = [
//   {
//     href: APP_COURSES_URL,
//     label: "Courses",
//     external: true,
//     title: "Opens Courses (courses.getmaterials.in)",
//   },
//   {
//     href: APP_ARENA_URL,
//     label: "Arena",
//     external: true,
//     title: "Opens Arena (arena.getmaterials.in)",
//   },
// ];

const exploreLinks = [
  { href: "/about", label: "About Us" },
  { href: "/careers", label: "Careers" },
  { href: "/how-to-use", label: "How to Use" },
  { href: "/feedback", label: "Feedback" },
  { href: "/contact", label: "Contact Us" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

const socialLinks = [
  {
    href: "https://linkedin.com/company/getmaterials",
    label: "LinkedIn",
    icon: FaLinkedinIn,
  },
  {
    href: "https://instagram.com/getmaterials.in",
    label: "Instagram",
    icon: FaInstagram,
  },
  {
    href: "https://x.com/getmaterials",
    label: "X",
    icon: FaXTwitter,
  },
  {
    href: "https://youtube.com/@GetMaterials",
    label: "YouTube",
    icon: FaYoutube,
  },
];

function FooterLink({
  href,
  label,
  external,
  title,
}: {
  href: string;
  label: string;
  external?: boolean;
  title?: string;
}) {
  const className =
    "text-[14px] text-slate-500 transition hover:text-[var(--primary)]";

  if (external) {
    return (
      <a
        href={href}
        className={`${className} inline-flex items-center gap-1 font-medium text-[var(--primary)]`}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
      >
        {label}
        <span className="text-[10px] opacity-70" aria-hidden>
          ↗
        </span>
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; external?: boolean; title?: string }[];
}) {
  return (
    <div>
      <h4 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <FooterLink {...link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="font-marketing relative overflow-hidden bg-[linear-gradient(180deg,#faf8ff_0%,#ffffff_100%)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-10 h-52 w-52 rounded-full bg-[#f3e8ff]/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 bottom-0 h-44 w-44 rounded-full bg-[#e8f3ff]/60 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_repeat(3,minmax(0,1fr))] lg:gap-8 xl:gap-10">
          <div>
            <Link
              href="/"
              className="inline-block text-[1.35rem] font-extrabold text-[var(--primary)] sm:text-[1.45rem]"
            >
              Get<span className="text-black">Materials</span>
            </Link>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-slate-500 sm:text-[15px]">
              Free study materials, subjects, colleges, quizzes, and polls — shared by verified
              teachers for students everywhere.
            </p>

            <div className="mt-5 flex gap-2.5">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3e8ff] text-[var(--primary)] transition hover:bg-[var(--primary)] hover:text-white"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Platform" links={platformLinks} />
          <FooterColumn title="Explore" links={exploreLinks} />
          {/* Uncomment when Courses and Arena are ready.
          <FooterColumn title="More from us" links={productLinks} />
          */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              Legal & Contact
            </h4>
            <ul className="mt-4 space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink {...link} />
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-[14px] text-slate-500 transition hover:text-[var(--primary)]"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <span className="text-[14px] text-slate-500">{CONTACT_OFFICE}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#f3e8ff] pt-6 sm:flex-row">
          <p className="text-[13px] text-slate-400 sm:text-sm">
            © {new Date().getFullYear()} GetMaterials. All rights reserved.
          </p>
          <p className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 sm:text-sm">
            Made with
            <Heart
              className="h-3.5 w-3.5 fill-rose-500 text-rose-500"
              aria-hidden
            />
            for students everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
