"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { HiMenu, HiX } from "react-icons/hi";
import { Upload } from "lucide-react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { UserAvatar } from "@/components/layout/UserAvatar";

type NavLink = {
  href: string;
  label: string;
  external?: boolean;
};

/** Site pages only — Courses is a separate product (courses.getmaterials.in). */
const baseLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/materials", label: "Materials" },
  { href: "/subjects", label: "Subjects" },
  { href: "/colleges", label: "Colleges" },
  { href: "/quizzes", label: "Quizzes" },
  { href: "/practice", label: "Practice" },
  { href: "/polls", label: "Polls" },
  { href: "/teachers", label: "Teachers" },
];

// Courses site is not production-ready. Uncomment with APP_COURSES_URL when it is.
// const coursesLink: NavLink = {
//   href: APP_COURSES_URL,
//   label: "Courses",
//   external: true,
// };

const MarketingNavbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user as
    | { name?: string; email?: string; image?: string; role?: string; status?: string }
    | undefined;
  const isTeacher = user?.role === "teacher" && user?.status !== "pending";
  const quizzesHref = isTeacher ? "/teacher/quizzes" : "/quizzes";
  const uploadHref = isTeacher ? "/teacher/upload" : "/upload";
  const isHome = pathname === "/";
  const heroMode = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const isActive = (href: string, external?: boolean) => {
    if (external) return false;
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  const navLinks = baseLinks.map((link) =>
    link.href === "/quizzes" ? { ...link, href: quizzesHref } : link,
  );

  const linkClass = (active: boolean) => {
    if (heroMode) {
      return active
        ? "text-[var(--primary)] font-bold underline underline-offset-8 decoration-2"
        : "text-slate-500 hover:text-[var(--primary)] transition-colors duration-300";
    }
    return active
      ? "text-[var(--primary)] underline underline-offset-8 decoration-2"
      : "hover:text-[var(--primary)] transition";
  };

  const renderLink = (link: NavLink, className: string, onClick?: () => void) =>
    link.external ? (
      <a
        key={link.label}
        href={link.href}
        className={className}
        onClick={onClick}
      >
        <span>{link.label}</span>
      </a>
    ) : (
      <Link key={link.label} href={link.href} className={className} onClick={onClick}>
        {link.label}
      </Link>
    );

  return (
    <nav
      className={`z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isHome ? "fixed inset-x-0 top-0" : "sticky top-0"
      } ${
        heroMode
          ? "border-b border-transparent bg-transparent px-3 pt-3 sm:px-5 sm:pt-4"
          : "border-b border-black/5 bg-white/95 px-0 pt-0 shadow-sm backdrop-blur-md"
      }`}
    >
      <div
        className={`mx-auto flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          heroMode
            ? "h-[64px] max-w-6xl rounded-full border border-white/70 bg-white/75 px-4 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-6"
            : "h-[72px] max-w-7xl rounded-none border border-transparent bg-transparent px-4 sm:px-6"
        }`}
      >
        <Link
          href="/"
          className="shrink-0 text-[1.25rem] font-extrabold text-[var(--primary)] transition-colors duration-500 sm:text-[1.4rem]"
        >
          Get<span className="font-bold text-black">Materials</span>
        </Link>

        <ul
          className={`hidden min-w-0 items-center gap-3 text-[14px] font-semibold transition-colors duration-500 lg:flex xl:gap-5 xl:text-[15px] ${
            heroMode ? "text-slate-500" : "text-gray-500"
          }`}
        >
          {navLinks.map((link) => (
            <li
              key={link.label}
              className={
                link.href === "/polls" || link.href === "/teachers"
                  ? "hidden xl:block"
                  : undefined
              }
            >
              {renderLink(link, linkClass(isActive(link.href, link.external)))}
            </li>
          ))}
          {/* Uncomment when courses.getmaterials.in is ready.
          <li
            aria-hidden
            className={`h-5 w-px shrink-0 ${heroMode ? "bg-slate-300/80" : "bg-gray-200"}`}
          />
          <li className="shrink-0">
            {renderLink(coursesLink, "inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[13px] font-bold text-[var(--primary)] hover:bg-violet-100 transition-colors duration-300")}
          </li>
          */}
        </ul>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {status !== "loading" && user ? (
            <>
              <NotificationBell />
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="rounded-full"
                aria-label="Open profile"
              >
                <UserAvatar name={user.name} image={user.image} role={user.role} size={36} />
              </button>
              <Link
                href={uploadHref}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white transition-all duration-500 hover:opacity-90 sm:px-4"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
              </Link>
            </>
          ) : status !== "loading" ? (
            heroMode ? (
              <>
                <Link
                  href="/login"
                  className="hidden text-sm font-semibold text-slate-600 transition-colors duration-500 hover:text-[#111] sm:inline-flex"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-[#111] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition hover:bg-black sm:px-5"
                >
                  Get started
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-xl border-2 border-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary)] transition hover:bg-[var(--primary)] hover:text-white"
              >
                Login
              </Link>
            )
          ) : null}

          <button
            onClick={() => setOpen(!open)}
            className="text-2xl text-black lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className={`mt-2 flex flex-col gap-3 px-5 pb-5 lg:hidden animate-in slide-in-from-top ${
            heroMode
              ? "mx-3 rounded-3xl border border-white/70 bg-white/85 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:mx-5"
              : "border-t border-gray-100 bg-white"
          }`}
        >
          <div className={heroMode ? "pt-4" : ""}>
            {navLinks.map((link) =>
              renderLink(
                link,
                `block py-2 font-semibold ${
                  isActive(link.href, link.external)
                    ? "text-[var(--primary)]"
                    : "text-gray-600 hover:text-[var(--primary)]"
                }`,
                () => setOpen(false),
              ),
            )}
          </div>
          {/* Uncomment when courses.getmaterials.in is ready.
          <div className="mt-1 border-t border-dashed border-violet-200 pt-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-violet-500">
              Separate app
            </p>
            {renderLink(coursesLink, "inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 w-fit text-sm font-bold text-[var(--primary)]", () => setOpen(false))}
            <p className="mt-1.5 text-xs text-gray-400">courses.getmaterials.in</p>
          </div>
          */}
          <div className="mt-2 flex gap-3 border-t border-gray-100 pt-3">
            {user ? (
              <Link
                href={uploadHref}
                className="flex-1 rounded-xl bg-[var(--primary)] py-2 text-center text-sm font-semibold text-white"
              >
                Upload
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex-1 rounded-xl border-2 border-slate-200 py-2 text-center text-sm font-semibold text-slate-700"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className={`flex-1 py-2 text-center text-sm font-semibold text-white ${
                    heroMode ? "rounded-full bg-[#111]" : "rounded-xl bg-[var(--primary)]"
                  }`}
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {user && (
        <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} user={user} />
      )}
    </nav>
  );
};

export default MarketingNavbar;
