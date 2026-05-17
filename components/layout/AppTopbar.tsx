"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Search, Menu, LogOut, User, ChevronDown } from "lucide-react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface AppTopbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  onMenuClick?: () => void;
}

export function AppTopbar({ user, onMenuClick }: AppTopbarProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogout, setShowLogout] = useState(false);

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

      <div className="flex items-center gap-4">

        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold leading-tight">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-52 bg-white rounded-xl border border-gray-200 shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                onClick={() => setShowProfile(false)}
              >
                <User className="w-4 h-4" /> Settings
              </Link>
              <button
                onClick={() => { setShowProfile(false); setShowLogout(true); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showLogout}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        variant="warning"
        onConfirm={() => signOut({ callbackUrl: "/login" })}
        onCancel={() => setShowLogout(false)}
      />
    </header>
  );
}
