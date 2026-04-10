"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search } from "lucide-react";
import FeedActionRow from "@/components/FeedActionRow";
import MyEventsTabs from "@/components/MyEventsTabs";

interface BrowseEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string | null;
  imageUrl: string | null;
  likeCount: number;
  bookmarkCount: number;
  attendeeCount: number;
  liked: boolean;
  bookmarked: boolean;
  attending: boolean;
}

interface SavedEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string | null;
}

type Tab = "browse" | "saved" | "create";

export default function EventsHub({
  isGuest,
  isAdmin,
  browseEvents,
  attending,
  bookmarked,
}: {
  isGuest: boolean;
  isAdmin: boolean;
  browseEvents: BrowseEvent[];
  attending: SavedEvent[];
  bookmarked: SavedEvent[];
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "browse", label: "Browse" },
    { id: "saved", label: "Saved" },
    ...(isAdmin ? [{ id: "create" as Tab, label: "Create" }] : []),
  ];

  const [tab, setTab] = useState<Tab>("browse");
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Home</Link>
        <h1 className="text-lg font-bold text-msu-white">Events</h1>
      </header>

      {/* Tab bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex gap-1 px-4 py-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === t.id
                  ? "bg-msu-red text-msu-white"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-lg mx-auto sm:py-6 space-y-4 sm:space-y-6">
        {/* Browse tab */}
        {tab === "browse" && (
          <>
            {/* Search input */}
            <div className="px-4 sm:px-0 pt-4 sm:pt-0">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search events..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-msu-red/50 focus:border-msu-red"
                />
              </div>
            </div>

            {(() => {
              const term = query.trim().toLowerCase();
              const filtered = term
                ? browseEvents.filter(
                    (e) =>
                      e.title.toLowerCase().includes(term) ||
                      (e.description ?? "").toLowerCase().includes(term) ||
                      (e.location ?? "").toLowerCase().includes(term)
                  )
                : browseEvents;

              if (filtered.length === 0) {
                return (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-12">
                    {term ? "No events match your search." : "No upcoming events yet."}
                  </p>
                );
              }

              return filtered.map((e) => {
                const startAt = new Date(e.startAt);
                const endAt = e.endAt ? new Date(e.endAt) : null;
                return (
                  <div
                    key={e.id}
                    className="bg-white dark:bg-gray-900 border-y sm:border sm:rounded-lg border-gray-200 dark:border-gray-800 overflow-hidden"
                  >
                    <Link
                      href={`/event/${e.id}`}
                      aria-label={`View details for ${e.title}`}
                      className="block hover:opacity-95 transition-opacity"
                    >
                      <div className="relative bg-gradient-to-br from-msu-red to-msu-red/70 flex items-end h-28 sm:h-auto sm:aspect-[4/5]">
                        {e.imageUrl ? (
                          <Image
                            src={e.imageUrl}
                            alt={e.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 512px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,.15)_10px,rgba(255,255,255,.15)_20px)]" />
                        )}
                        <div className={`absolute inset-0 ${e.imageUrl ? "bg-gradient-to-t from-black/70 via-black/20 to-transparent" : ""}`} />
                        <h2 className="relative px-4 pb-3 text-base sm:text-lg font-bold text-msu-white leading-tight drop-shadow-sm line-clamp-2">
                          {e.title}
                        </h2>
                      </div>

                      <div className="px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                        <span>
                          {startAt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                        <span>
                          {startAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {endAt && ` – ${endAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                        </span>
                        {e.location && <span>{e.location}</span>}
                      </div>

                      {e.description && (
                        <div className="px-4 py-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                            {e.description.length > 140 ? e.description.slice(0, 140) + "…" : e.description}
                          </p>
                        </div>
                      )}
                    </Link>

                    <FeedActionRow
                      eventId={e.id}
                      isGuest={isGuest}
                      initialLiked={e.liked}
                      initialBookmarked={e.bookmarked}
                      initialAttending={e.attending}
                      initialLikeCount={e.likeCount}
                      initialBookmarkCount={e.bookmarkCount}
                      initialAttendeeCount={e.attendeeCount}
                    />
                  </div>
                );
              });
            })()}
          </>
        )}

        {/* Saved tab */}
        {tab === "saved" && (
          <>
            {isGuest ? (
              <div className="text-center py-12 space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <Link href="/login" className="text-msu-red hover:underline">Log in</Link> to see your saved events.
                </p>
              </div>
            ) : (
              <MyEventsTabs attending={attending} bookmarked={bookmarked} />
            )}
          </>
        )}

        {/* Create tab (admin only) */}
        {tab === "create" && isAdmin && (
          <div className="p-4 sm:p-0">
            <div className="bg-white dark:bg-gray-900 sm:rounded-lg border-y sm:border border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center gap-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create a new event for the campus community.
              </p>
              <Link
                href="/events/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-msu-red text-msu-white text-sm font-medium hover:bg-msu-red/90 transition-colors"
              >
                <Plus size={16} />
                New Event
              </Link>
              <Link
                href="/my-created-events"
                className="text-sm text-msu-red hover:underline"
              >
                View my created events
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
