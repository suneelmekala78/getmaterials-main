import Link from "next/link";
import { FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  APP_COURSES_URL,
  CONTACT_EMAIL,
  CONTACT_OFFICE,
} from "@/lib/shared";

const platformLinks = [
  { href: "/materials", label: "Browse Materials" },
  { href: APP_COURSES_URL, label: "Courses", external: true },
  { href: "/colleges", label: "Colleges" },
  { href: "/quizzes", label: "Quizzes" },
  { href: "/teachers", label: "Teachers" },
  { href: "/polls", label: "Polls" },
];

const exploreLinks = [
  { href: "/subjects", label: "Subjects" },
  { href: "/about", label: "About Us" },
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
}: {
  href: string;
  label: string;
  external?: boolean;
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
        title="Opens Courses (courses.getmaterials.in)"
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
  links: { href: string; label: string; external?: boolean }[];
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
              Free, open education materials curated by verified teachers. Learn anything,
              anytime, anywhere.
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
          <p className="text-[13px] text-slate-400 sm:text-sm">
            Made with love for students everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
