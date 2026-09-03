"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { HiMenu, HiX } from "react-icons/hi";
import { Upload } from "lucide-react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";

const links = [
  { href: "/", label: "Home" },
  { href: "/materials", label: "Materials" },
  { href: "/subjects", label: "Subjects" },
  { href: "/colleges", label: "Colleges" },
  { href: "/quizzes", label: "Quizzes" },
  { href: "/feedback", label: "Feedback" },
  { href: "/how-to-use", label: "How to Use" },
];

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

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const navLinks = links.map((link) =>
    link.href === "/quizzes" ? { ...link, href: quizzesHref } : link
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
                link.href === "/feedback" || link.href === "/how-to-use"
                  ? "hidden xl:block"
                  : undefined
              }
            >
              <Link
                href={link.href}
                className={
                  isActive(link.href)
                    ? "text-[var(--primary)] underline underline-offset-8 decoration-2"
                    : "hover:text-[var(--primary)] transition"
                }
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 shrink-0">
          {status !== "loading" && user ? (
            <>
              <NotificationBell />
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="w-9 h-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm"
                aria-label="Open profile"
              >
                {user.name?.charAt(0)?.toUpperCase() || "U"}
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
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`py-2 font-semibold ${isActive(link.href) ? "text-[var(--primary)]" : "text-gray-600 hover:text-[var(--primary)]"}`}
            >
              {link.label}
            </Link>
          ))}
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
