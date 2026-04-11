"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, CalendarDays, Users, User } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  activePaths?: string[];
}

const navItems: NavItem[] = [
  { href: "/home",    label: "Home",    icon: <Home size={22} /> },
  { href: "/events",  label: "Events",  icon: <CalendarDays size={22} /> },
  { href: "/chat",    label: "Social",  icon: <Users size={22} />, activePaths: ["/chat", "/people"] },
  { href: "/profile", label: "Profile", icon: <User size={22} /> },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [chatUnread, setChatUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(() => { if (!cancelled) setIsAuthed(true); })
      .catch(() => { if (!cancelled) setIsAuthed(false); });

    fetch("/api/chat/unread")
      .then((r) => r.ok ? r.json() : { total: 0 })
      .then((d) => { if (!cancelled) setChatUnread(d.total ?? 0); })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [pathname]);

  // Hide on verify and API routes
  if (pathname.startsWith("/verify") || pathname.startsWith("/api")) {
    return null;
  }

  // Wait for initial auth check
  if (isAuthed === null) return null;

  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg
        flex items-center justify-around
        rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md
        border border-gray-200 dark:border-gray-700
        shadow-lg px-2 py-2
        transition-shadow hover:shadow-xl"
      aria-label="Main navigation"
    >
      {navItems.map((item) => {
        const paths = item.activePaths ?? [item.href];
        const active = paths.some((p) => pathname === p || pathname.startsWith(p + "/"));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-200
              ${active
                ? "text-msu-red"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:scale-110"
              }`}
          >
            <div className="relative">
              {item.icon}
              {item.href === "/chat" && chatUnread > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] flex items-center justify-center rounded-full bg-msu-red text-white text-[8px] font-bold ring-2 ring-white dark:ring-gray-900 px-0.5">
                  {chatUnread > 9 ? "9+" : chatUnread}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
            {active && (
              <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-msu-red" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
