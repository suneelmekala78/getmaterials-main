"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { HiMenu, HiX } from "react-icons/hi";
import { ExternalLink, Upload } from "lucide-react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { APP_COURSES_URL } from "@/lib/shared";

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
  { href: "/polls", label: "Polls" },
  { href: "/teachers", label: "Teachers" },
];

const coursesLink: NavLink = {
  href: APP_COURSES_URL,
  label: "Courses",
  external: true,
};

const linkClass = (active: boolean) =>
  active
    ? "text-[var(--primary)] underline underline-offset-8 decoration-2"
    : "hover:text-[var(--primary)] transition";

const coursesLinkClass =
  "inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[var(--primary)] hover:bg-violet-100 transition";

const MarketingNavbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user as { name?: string; email?: string; image?: string; role?: string; status?: string } | undefined;
  const isTeacher = user?.role === "teacher" && user?.status !== "pending";
  const quizzesHref = isTeacher ? "/teacher/quizzes" : "/quizzes";
  const uploadHref = isTeacher ? "/teacher/upload" : "/upload";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
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
    link.href === "/quizzes" ? { ...link, href: quizzesHref } : link
  );

  const renderLink = (link: NavLink, className: string, onClick?: () => void) =>
    link.external ? (
      <a
        key={link.label}
        href={link.href}
        className={className}
        onClick={onClick}
        title="Opens Courses (courses.getmaterials.in)"
        aria-label="Courses — opens courses.getmaterials.in"
      >
        <span>{link.label}</span>
        <ExternalLink className="w-3.5 h-3.5 opacity-80" aria-hidden />
      </a>
    ) : (
      <Link key={link.label} href={link.href} className={className} onClick={onClick}>
        {link.label}
      </Link>
    );

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 shadow-sm border-b border-black/5"
          : "bg-white border-b border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-[72px] px-4 sm:px-6">
        <Link href="/" className="font-extrabold text-[1.4rem] text-[var(--primary)] shrink-0">
          Get<span className="text-black font-bold">Materials</span>
        </Link>

        <ul className="hidden lg:flex items-center gap-4 xl:gap-5 text-[15px] font-semibold text-gray-500 min-w-0">
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
          <li aria-hidden className="w-px h-5 bg-gray-200 shrink-0" />
          <li className="shrink-0">
            {renderLink(coursesLink, `${coursesLinkClass} text-[13px] font-bold`)}
          </li>
        </ul>

        <div className="flex items-center gap-2 shrink-0">
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
                className="inline-flex items-center gap-2 bg-[var(--primary)] text-white py-2 px-3 sm:px-4 rounded-xl font-semibold text-sm hover:opacity-90 transition"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
              </Link>
            </>
          ) : status !== "loading" ? (
            <Link
              href="/login"
              className="border-2 border-[var(--primary)] text-[var(--primary)] py-2 px-4 rounded-xl font-semibold text-sm hover:bg-[var(--primary)] hover:text-white transition"
            >
              Login
            </Link>
          ) : null}

          <button onClick={() => setOpen(!open)} className="lg:hidden text-2xl text-black" aria-label="Toggle menu">
            {open ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden px-6 pb-6 flex flex-col gap-3 bg-white border-t border-gray-100 animate-in slide-in-from-top">
          {navLinks.map((link) =>
            renderLink(
              link,
              `py-2 font-semibold ${
                isActive(link.href, link.external)
                  ? "text-[var(--primary)]"
                  : "text-gray-600 hover:text-[var(--primary)]"
              }`,
              () => setOpen(false),
            ),
          )}
          <div className="mt-1 pt-3 border-t border-dashed border-violet-200">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-500 mb-2">
              Separate app
            </p>
            {renderLink(
              coursesLink,
              `${coursesLinkClass} w-fit text-sm font-bold`,
              () => setOpen(false),
            )}
            <p className="text-xs text-gray-400 mt-1.5">courses.getmaterials.in</p>
          </div>
          <div className="flex gap-3 mt-2 pt-3 border-t border-gray-100">
            {user ? (
              <Link
                href={uploadHref}
                className="flex-1 text-center bg-[var(--primary)] text-white py-2 rounded-xl font-semibold text-sm"
              >
                Upload
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex-1 text-center border-2 border-[var(--primary)] text-[var(--primary)] py-2 rounded-xl font-semibold text-sm"
              >
                Login
              </Link>
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
