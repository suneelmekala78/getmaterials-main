"use client";

import { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";
import { BottomBar } from "./BottomBar";

interface MobileShellProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  children: React.ReactNode;
}

export function MobileShell({ user, children }: MobileShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — mobile: slides in, desktop: always visible */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AppSidebar user={user} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppTopbar user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6 pb-20 lg:pb-6">{children}</main>
      </div>

      {/* Mobile bottom bar */}
      <BottomBar role={user.role} />
    </div>
  );
}
