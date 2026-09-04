"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  Bookmark,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Upload,
  User,
  X,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { UserAvatar } from "@/components/layout/UserAvatar";

export type ProfileUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  status?: string;
};

function drawerLinks(role?: string, status?: string) {
  const isTeacher = role === "teacher" && status !== "pending";
  return [
    { href: "/profile", label: "My Profile", icon: User },
    {
      href: isTeacher ? "/teacher/dashboard" : "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: isTeacher ? "/teacher/materials" : "/my-materials",
      label: "My Materials",
      icon: FileText,
    },
    {
      href: isTeacher ? "/teacher/upload" : "/upload",
      label: "Upload",
      icon: Upload,
    },
    {
      href: isTeacher ? "/teacher/polls" : "/polls",
      label: "My Polls",
      icon: BarChart3,
    },
    {
      href: isTeacher ? "/teacher/quizzes" : "/quizzes",
      label: "Quizzes",
      icon: ClipboardCheck,
    },
    ...(!isTeacher ? [{ href: "/bookmarks", label: "Bookmarks", icon: Bookmark }] : []),
    { href: "/settings", label: "Settings", icon: Settings },
  ];
}

export function ProfileDrawer({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: ProfileUser;
}) {
  const [showLogout, setShowLogout] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[200]">
        <button
          type="button"
          className="absolute inset-0 bg-black/40"
          aria-label="Close profile"
          onClick={onClose}
        />
        <aside className="absolute right-0 top-0 h-dvh w-full max-w-sm bg-white shadow-2xl flex flex-col">
          <div className="flex items-start justify-between px-5 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              <UserAvatar name={user.name} image={user.image} role={user.role} size={48} />
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">{user.name || "Account"}</p>
                <p className="text-sm text-slate-500 truncate">{user.email}</p>
                <p className="text-xs text-violet-600 capitalize mt-0.5">{user.role || "student"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-3">
            {drawerLinks(user.role, user.status).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-[var(--primary)]"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowLogout(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={showLogout}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        variant="warning"
        onConfirm={() => signOut({ callbackUrl: "/" })}
        onCancel={() => setShowLogout(false)}
      />
    </>,
    document.body
  );
}
