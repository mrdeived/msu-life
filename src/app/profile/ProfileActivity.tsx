"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarCheck, Heart } from "lucide-react";

interface ActivityEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string | null;
  imageUrl: string | null;
}

function EventCard({ event }: { event: ActivityEvent }) {
  const start = new Date(event.startAt);
  const end = event.endAt ? new Date(event.endAt) : null;

  return (
    <Link
      href={`/event/${event.id}`}
      className="flex gap-3 items-start bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 hover:ring-2 hover:ring-msu-red/30 transition-shadow"
    >
      {/* Thumbnail */}
      <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden bg-gradient-to-br from-msu-red to-msu-red/70">
        {event.imageUrl ? (
          <Image src={event.imageUrl} alt={event.title} fill sizes="64px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,255,255,.2)_6px,rgba(255,255,255,.2)_12px)]" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
          {event.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
          {" · "}
          {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {end && ` – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
        </p>
        {event.location && (
          <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1">{event.location}</p>
        )}
      </div>
    </Link>
  );
}

type Tab = "attending" | "liked";

export default function ProfileActivity({
  attending,
  liked,
}: {
  attending: ActivityEvent[];
  liked: ActivityEvent[];
}) {
  const [tab, setTab] = useState<Tab>("attending");

  const events = tab === "attending" ? attending : liked;
  const empty =
    tab === "attending"
      ? "You're not attending any events yet."
      : "You haven't liked any events yet.";

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-msu-red">My Activity</h2>

      {/* Tab bar */}
      <div className="flex gap-1">
        <button
          onClick={() => setTab("attending")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            tab === "attending"
              ? "bg-msu-red text-msu-white"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          Attending {attending.length > 0 && `(${attending.length})`}
        </button>
        <button
          onClick={() => setTab("liked")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            tab === "liked"
              ? "bg-msu-red text-msu-white"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          Liked {liked.length > 0 && `(${liked.length})`}
        </button>
      </div>

      {/* Event list */}
      {events.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">{empty}</p>
      ) : (
        <div className="space-y-2">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </section>
  );
}
