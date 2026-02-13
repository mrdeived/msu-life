import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import EventActionRow from "@/components/EventActionRow";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();

  const { id } = await params;

  const [event, attendeeCount, attendance, bookmarkCount, bookmark, likeCount, like] = await Promise.all([
    prisma.event.findFirst({
      where: { id, isPublished: true },
      select: { id: true, title: true, description: true, location: true, startAt: true, endAt: true, createdAt: true, updatedAt: true },
    }),
    prisma.eventAttendance.count({ where: { eventId: id } }),
    prisma.eventAttendance.findUnique({
      where: { userId_eventId: { userId: user.id, eventId: id } },
      select: { id: true },
    }),
    prisma.eventBookmark.count({ where: { eventId: id } }),
    prisma.eventBookmark.findUnique({
      where: { userId_eventId: { userId: user.id, eventId: id } },
      select: { id: true },
    }),
    prisma.eventLike.count({ where: { eventId: id } }),
    prisma.eventLike.findUnique({
      where: { userId_eventId: { userId: user.id, eventId: id } },
      select: { id: true },
    }),
  ]);

  const isAttending = !!attendance;
  const isBookmarked = !!bookmark;
  const isLiked = !!like;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <Link href="/feed" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Events</Link>
        <h1 className="text-lg font-bold text-msu-white">Event</h1>
      </header>

      <main className="max-w-lg mx-auto sm:py-6">
        {!event ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Event not found.</p>
            <Link href="/feed" className="text-sm text-msu-red hover:underline">&larr; Back to events</Link>
          </div>
        ) : (
          <article className="bg-white dark:bg-gray-900 sm:rounded-lg border-y sm:border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Banner */}
            <div className="relative h-36 bg-gradient-to-br from-msu-red to-msu-red/70 flex items-end">
              <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,.15)_10px,rgba(255,255,255,.15)_20px)]" />
              <h2 className="relative px-5 pb-4 text-xl font-bold text-msu-white leading-tight drop-shadow-sm">
                {event.title}
              </h2>
            </div>

            {/* Meta */}
            <div className="px-5 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
              <span>
                {event.startAt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              </span>
              <span>
                {event.startAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {event.endAt && ` – ${event.endAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
              </span>
              {event.location && <span>{event.location}</span>}
            </div>

            {/* Action Row */}
            <div className="border-b border-gray-100 dark:border-gray-800">
              <EventActionRow
                eventId={event.id}
                initialLiked={isLiked}
                initialBookmarked={isBookmarked}
                initialAttending={isAttending}
                likeCount={likeCount}
                bookmarkCount={bookmarkCount}
                attendeeCount={attendeeCount}
              />
            </div>

            {/* Description */}
            {event.description && (
              <div className="px-5 py-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}
          </article>
        )}
      </main>
    </div>
  );
}
