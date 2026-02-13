"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Newspaper, CalendarCheck, SquarePen, User, LogIn } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const authedItems: NavItem[] = [
  { href: "/home", label: "Home", icon: <Home size={22} /> },
  { href: "/feed", label: "Browse", icon: <Newspaper size={22} /> },
  { href: "/my-events", label: "My Events", icon: <CalendarCheck size={22} /> },
  { href: "/my-created-events", label: "Created", icon: <SquarePen size={22} />, adminOnly: true },
  { href: "/profile", label: "Profile", icon: <User size={22} /> },
];

const guestItems: NavItem[] = [
  { href: "/home", label: "Home", icon: <Home size={22} /> },
  { href: "/feed", label: "Browse", icon: <Newspaper size={22} /> },
  { href: "/login", label: "Login", icon: <LogIn size={22} /> },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setIsAuthed(true);
        setIsAdmin(!!data.isAdmin);
      })
      .catch(() => {
        if (!cancelled) setIsAuthed(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Hide on auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/verify") || pathname.startsWith("/api")) {
    return null;
  }

  // Wait for auth check
  if (isAuthed === null) return null;

  const items = isAuthed
    ? authedItems.filter((i) => !i.adminOnly || isAdmin)
    : guestItems;

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
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
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
            {item.icon}
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
