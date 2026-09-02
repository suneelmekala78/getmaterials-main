"use client";

import { useState } from "react";
import { Search, Menu, Home, HelpCircle, ClipboardCheck, Upload } from "lucide-react";
import Link from "next/link";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ProfileDrawer, type ProfileUser } from "@/components/layout/ProfileDrawer";

interface AppTopbarProps {
  user: ProfileUser;
  onMenuClick?: () => void;
}

export function AppTopbar({ user, onMenuClick }: AppTopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const uploadHref = user.role === "teacher" ? "/teacher/upload" : "/upload";
  const quizzesHref = user.role === "teacher" ? "/teacher/quizzes" : "/quizzes";
  const isGuest = !user.email && user.name === "Guest";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/subjects?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="h-14 px-6 flex items-center justify-between bg-white border-b border-black/10 shrink-0">
      <button onClick={onMenuClick} className="lg:hidden p-2 text-gray-600 hover:text-black rounded-lg">
        <Menu className="w-5 h-5" />
      </button>

      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search materials, subjects..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] transition"
          />
        </div>
      </form>

      <div className="flex items-center gap-2">
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-[var(--primary)] rounded-lg hover:bg-gray-50 transition">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <Link href={quizzesHref} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-[var(--primary)] rounded-lg hover:bg-gray-50 transition">
            <ClipboardCheck className="w-3.5 h-3.5" /> Quizzes
          </Link>
          <Link href="/how-to-use" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-[var(--primary)] rounded-lg hover:bg-gray-50 transition">
            <HelpCircle className="w-3.5 h-3.5" /> Help
          </Link>
        </nav>

        {isGuest ? (
          <Link
            href="/login"
            className="border-2 border-[var(--primary)] text-[var(--primary)] py-1.5 px-3 rounded-xl font-semibold text-sm hover:bg-[var(--primary)] hover:text-white transition"
          >
            Login
          </Link>
        ) : (
          <>
            <NotificationBell />
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm"
              aria-label="Open profile"
            >
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </button>
            <Link
              href={uploadHref}
              className="hidden sm:inline-flex items-center gap-1.5 bg-[var(--primary)] text-white py-1.5 px-3 rounded-xl font-semibold text-sm hover:opacity-90"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload
            </Link>
          </>
        )}
      </div>

      {!isGuest && (
        <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} user={user} />
      )}
    </header>
  );
}
