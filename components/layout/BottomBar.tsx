"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Upload,
  ClipboardCheck,
} from "lucide-react";

const studentTabs = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/subjects", icon: BookOpen, label: "Subjects" },
  { href: "/materials", icon: FileText, label: "Materials" },
  { href: "/upload", icon: Upload, label: "Upload" },
  { href: "/quizzes", icon: ClipboardCheck, label: "Quizzes" },
];

const teacherTabs = [
  { href: "/teacher/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/materials", icon: BookOpen, label: "Browse" },
  { href: "/teacher/upload", icon: Upload, label: "Upload" },
  { href: "/teacher/materials", icon: FileText, label: "My Files" },
  { href: "/teacher/quizzes", icon: ClipboardCheck, label: "Quizzes" },
];

interface BottomBarProps {
  role?: string;
}

export function BottomBar({ role }: BottomBarProps) {
  const pathname = usePathname();
  const tabs = role === "teacher" ? teacherTabs : studentTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === "/dashboard" || tab.href === "/teacher/dashboard"
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-lg transition ${
                isActive
                  ? "text-[var(--primary)]"
                  : "text-gray-500"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
