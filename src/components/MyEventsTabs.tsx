"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck, Bookmark } from "lucide-react";

interface EventData {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string | null;
}

function EventCard({ event }: { event: EventData }) {
  const start = new Date(event.startAt);
  const end = event.endAt ? new Date(event.endAt) : null;

  return (
    <Link
      href={`/event/${event.id}`}
      aria-label={`View details for ${event.title}`}
      className="block bg-white dark:bg-gray-900 border-y sm:border sm:rounded-lg border-gray-200 dark:border-gray-800 overflow-hidden hover:ring-2 hover:ring-msu-red/30 transition-shadow"
    >
      <article>
        <div className="relative bg-gradient-to-br from-msu-red to-msu-red/70 flex items-end h-28 sm:h-auto sm:aspect-[4/5]">
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,.15)_10px,rgba(255,255,255,.15)_20px)]" />
          <h2 className="relative px-4 pb-3 text-base sm:text-lg font-bold text-msu-white leading-tight drop-shadow-sm line-clamp-2">
            {event.title}
          </h2>
        </div>

        <div className="px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
          <span>
            {start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
          </span>
          <span>
            {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            {end && ` – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
          </span>
          {event.location && <span>{event.location}</span>}
        </div>

        {event.description && (
          <div className="px-4 py-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
              {event.description.length > 140 ? event.description.slice(0, 140) + "…" : event.description}
            </p>
          </div>
        )}
      </article>
    </Link>
  );
}

type Tab = "attending" | "bookmarks";

export default function MyEventsTabs({
  attending,
  bookmarked,
}: {
  attending: EventData[];
  bookmarked: EventData[];
}) {
  const [tab, setTab] = useState<Tab>("attending");

  const events = tab === "attending" ? attending : bookmarked;

  return (
    <>
      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border-y sm:border sm:rounded-lg border-gray-200 dark:border-gray-800 px-4 py-2">
        <button
          onClick={() => setTab("attending")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            tab === "attending"
              ? "bg-msu-red text-msu-white"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          Attending
        </button>
        <button
          onClick={() => setTab("bookmarks")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            tab === "bookmarks"
              ? "bg-msu-red text-msu-white"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          Bookmarks
        </button>
      </div>

      {/* Event list */}
      {events.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-12">
          {tab === "attending"
            ? "You\u2019re not attending any events yet."
            : "You have no bookmarked events."}
        </p>
      ) : (
        events.map((e) => <EventCard key={e.id} event={e} />)
      )}
    </>
  );
}
