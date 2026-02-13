import Link from "next/link";
import { optionalAuth } from "@/lib/optionalAuth";
import { prisma } from "@/lib/prisma";
import { computeDisplayName } from "@/lib/deriveNames";
import EventActionRow from "@/components/EventActionRow";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await optionalAuth();

  const { id } = await params;

  // Always fetch event + counts; only fetch user-specific data if logged in
  const baseQueries = [
    prisma.event.findFirst({
      where: { id, isPublished: true },
      select: { id: true, title: true, description: true, location: true, startAt: true, endAt: true, createdAt: true, updatedAt: true },
    }),
    prisma.eventAttendance.count({ where: { eventId: id } }),
    prisma.eventBookmark.count({ where: { eventId: id } }),
    prisma.eventLike.count({ where: { eventId: id } }),
  ] as const;

  let event, attendeeCount: number, bookmarkCount: number, likeCount: number;
  let isAttending = false, isBookmarked = false, isLiked = false;
  let attendees: { user: { firstName: string | null; lastName: string | null; email: string; username: string | null } }[] = [];

  if (user) {
    const [ev, attCount, bmCount, lkCount, attendance, bookmark, like, atts] = await Promise.all([
      ...baseQueries,
      prisma.eventAttendance.findUnique({
        where: { userId_eventId: { userId: user.id, eventId: id } },
        select: { id: true },
      }),
      prisma.eventBookmark.findUnique({
        where: { userId_eventId: { userId: user.id, eventId: id } },
        select: { id: true },
      }),
      prisma.eventLike.findUnique({
        where: { userId_eventId: { userId: user.id, eventId: id } },
        select: { id: true },
      }),
      prisma.eventAttendance.findMany({
        where: { eventId: id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { user: { select: { firstName: true, lastName: true, email: true, username: true } } },
      }),
    ]);

    event = ev;
    attendeeCount = attCount;
    bookmarkCount = bmCount;
    likeCount = lkCount;
    isAttending = !!attendance;
    isBookmarked = !!bookmark;
    isLiked = !!like;
    attendees = atts;
  } else {
    const [ev, attCount, bmCount, lkCount] = await Promise.all(baseQueries);

    event = ev;
    attendeeCount = attCount;
    bookmarkCount = bmCount;
    likeCount = lkCount;
  }

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
                isGuest={!user}
                initialLiked={isLiked}
                initialBookmarked={isBookmarked}
                initialAttending={isAttending}
                likeCount={likeCount}
                bookmarkCount={bookmarkCount}
                attendeeCount={attendeeCount}
              />
            </div>

            {/* Attendees */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-msu-red mb-3">
                Attendees{attendeeCount > 0 && <span className="text-gray-400 dark:text-gray-500 font-normal"> ({attendeeCount})</span>}
              </h3>
              {!user ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <Link href="/login" className="text-msu-red hover:underline">Log in</Link> to see attendees.
                </p>
              ) : attendeeCount === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No attendees yet.</p>
              ) : (
                <ul className="space-y-2">
                  {attendees.map((a, i) => {
                    const name = computeDisplayName(a.user.firstName, a.user.lastName, a.user.email, a.user.username);
                    return (
                      <li key={i} className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-msu-red/10 text-msu-red flex items-center justify-center text-xs font-bold shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
                      </li>
                    );
                  })}
                  {attendeeCount > 50 && (
                    <li className="text-xs text-gray-400 dark:text-gray-500 pl-9">
                      +{attendeeCount - 50} more
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Add to Calendar */}
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
              <a
                href={`/api/events/${event.id}/ics`}
                download
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md border border-msu-red text-msu-red hover:bg-msu-red hover:text-msu-white transition-colors"
              >
                Add to Calendar
              </a>
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
