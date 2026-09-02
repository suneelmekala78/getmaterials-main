"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type?: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
};

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = () => {
    fetch("/api/user/notifications")
      .then((res) => (res.ok ? res.json() : { notifications: [], unreadCount: 0 }))
      .then((data) => {
        setItems(data.notifications || []);
        setUnread(data.unreadCount || 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  const markRead = async (id?: string) => {
    try {
      await fetch("/api/user/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id } : {}),
      });
      if (id) {
        setItems((current) =>
          current.map((item) => (item.id === id ? { ...item, isRead: true } : item))
        );
        setUnread((count) => Math.max(0, count - 1));
      } else {
        setItems((current) => current.map((item) => ({ ...item, isRead: true })));
        setUnread(0);
      }
    } catch {
      // ignore offline API
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          load();
        }}
        className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-[var(--primary)]"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-[min(22rem,calc(100vw-2rem))] bg-white rounded-2xl border border-slate-200 shadow-xl z-[60] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="font-bold text-slate-900 text-sm">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markRead()}
                className="text-xs font-semibold text-[var(--primary)] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-sm text-slate-400 text-center">No notifications yet.</p>
            ) : (
              items.map((item) => {
                const content = (
                  <div className={`px-4 py-3 ${item.isRead ? "bg-white" : "bg-violet-50/70"}`}>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.body}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{timeAgo(item.createdAt)}</p>
                  </div>
                );
                return item.link ? (
                  <Link
                    key={item.id}
                    href={item.link}
                    onClick={() => {
                      markRead(item.id);
                      setOpen(false);
                    }}
                    className="block hover:bg-slate-50"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full text-left hover:bg-slate-50"
                    onClick={() => markRead(item.id)}
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
