"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Bookmark,
  ClipboardCheck,
  MessageSquare,
  Settings,
  Search,
  FileText,
  BarChart3,
  Upload,
  Globe,
  CalendarDays,
  GraduationCap,
} from "lucide-react";

const studentLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/subjects", icon: BookOpen, label: "Subjects" },
  { href: "/materials", icon: FileText, label: "Materials" },
  { href: "/upload", icon: Upload, label: "Upload" },
  { href: "/my-materials", icon: FileText, label: "My Materials" },
  { href: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
  { href: "/quizzes", icon: ClipboardCheck, label: "Quizzes" },
  { href: "/welcome", icon: GraduationCap, label: "Study profile" },
  { href: "/timetable", icon: CalendarDays, label: "Timetable" },
  { href: "/requests", icon: MessageSquare, label: "Requests" },
  { href: "/polls", icon: BarChart3, label: "Polls" },
];

const teacherLinks = [
  { href: "/teacher/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/subjects", icon: Search, label: "Subjects" },
  { href: "/materials", icon: FileText, label: "All Materials" },
  { href: "/teacher/upload", icon: Upload, label: "Upload" },
  { href: "/teacher/materials", icon: BookOpen, label: "My Materials" },
  { href: "/teacher/quizzes", icon: ClipboardCheck, label: "Quizzes" },
  { href: "/teacher/polls", icon: BarChart3, label: "Polls" },
  { href: "/teacher/requests", icon: MessageSquare, label: "Requests" },
];

interface AppSidebarProps {
  user: {
    name?: string | null;
    role?: string;
    status?: string;
  };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const links = user.role === "teacher" && user.status !== "pending" ? teacherLinks : studentLinks;

  return (
    <aside className="flex flex-col w-64 h-screen bg-white border-r border-black/10 sticky top-0 overflow-y-auto">
      <div className="p-6 font-extrabold text-[1.2rem] text-[var(--primary)]">
        Get<span className="text-black">Materials</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-semibold text-sm transition ${
                isActive
                  ? "bg-[var(--primary)] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-black/5">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            pathname === "/settings"
              ? "bg-[var(--primary)] text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
