"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HiMenu, HiX } from "react-icons/hi";

const MarketingNavbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-black/5"
          : "bg-white border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between h-[72px] px-6">
        <Link href="/" className="font-extrabold text-[1.4rem] text-[var(--primary)]">
          Get<span className="text-black font-bold">Materials</span>
        </Link>

        <ul className="hidden md:flex items-center gap-6 text-[15px] font-semibold text-gray-500">
          <li><Link href="/materials" className="hover:text-[var(--primary)] transition">Materials</Link></li>
          <li><Link href="/about" className="hover:text-[var(--primary)] transition">About</Link></li>
          <li><Link href="/contact" className="hover:text-[var(--primary)] transition">Contact</Link></li>
          <li><Link href="/feedback" className="hover:text-[var(--primary)] transition">Feedback</Link></li>
          <li><Link href="/how-to-use" className="hover:text-[var(--primary)] transition">How to Use</Link></li>
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="border-2 border-[var(--primary)] text-[var(--primary)] py-2 px-4 rounded-xl font-semibold text-sm hover:bg-[var(--primary)] hover:text-white transition"
          >
            Add Notes
          </Link>
          <Link
            href="/support"
            className="bg-[var(--primary)] text-white py-2.5 px-5 rounded-xl font-semibold text-sm shadow-[0_4px_14px_rgba(177,0,255,0.25)] hover:-translate-y-0.5 transition-all"
          >
            Buy me a chai ☕
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-2xl text-black" aria-label="Toggle menu">
          {open ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-6 pb-6 flex flex-col gap-3 bg-white border-t border-gray-100 animate-in slide-in-from-top">
          <Link href="/materials" onClick={() => setOpen(false)} className="py-2 font-semibold text-gray-600 hover:text-[var(--primary)]">Materials</Link>
          <Link href="/about" onClick={() => setOpen(false)} className="py-2 font-semibold text-gray-600 hover:text-[var(--primary)]">About</Link>
          <Link href="/contact" onClick={() => setOpen(false)} className="py-2 font-semibold text-gray-600 hover:text-[var(--primary)]">Contact</Link>
          <Link href="/feedback" onClick={() => setOpen(false)} className="py-2 font-semibold text-gray-600 hover:text-[var(--primary)]">Feedback</Link>
          <Link href="/how-to-use" onClick={() => setOpen(false)} className="py-2 font-semibold text-gray-600 hover:text-[var(--primary)]">How to Use</Link>
          <div className="flex gap-3 mt-2 pt-3 border-t border-gray-100">
            <Link href="/login" className="flex-1 text-center border-2 border-[var(--primary)] text-[var(--primary)] py-2 rounded-xl font-semibold text-sm">Add Notes</Link>
            <Link href="/support" className="flex-1 text-center bg-[var(--primary)] text-white py-2 rounded-xl font-semibold text-sm">Buy me a chai ☕</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default MarketingNavbar;
