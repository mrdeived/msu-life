import Link from "next/link";
import { optionalAuth } from "@/lib/optionalAuth";
import { prisma } from "@/lib/prisma";
import FeedActionRow from "@/components/FeedActionRow";

export default async function FeedPage() {
  const user = await optionalAuth();

  const events = await prisma.event.findMany({
    where: { isPublished: true, startAt: { gt: new Date() } },
    orderBy: { startAt: "asc" },
    take: 20,
    select: { id: true, title: true, description: true, location: true, startAt: true, endAt: true },
  });

  let likesById = new Map<string, number>();
  let bookmarksById = new Map<string, number>();
  let attendanceById = new Map<string, number>();
  let userLikedIds = new Set<string>();
  let userBookmarkedIds = new Set<string>();
  let userAttendingIds = new Set<string>();

  if (events.length > 0) {
    const eventIds = events.map((e) => e.id);

    const countQueries = [
      prisma.eventLike.groupBy({
        by: ["eventId"],
        where: { eventId: { in: eventIds } },
        _count: { _all: true },
      }),
      prisma.eventBookmark.groupBy({
        by: ["eventId"],
        where: { eventId: { in: eventIds } },
        _count: { _all: true },
      }),
      prisma.eventAttendance.groupBy({
        by: ["eventId"],
        where: { eventId: { in: eventIds } },
        _count: { _all: true },
      }),
    ] as const;

    if (user) {
      const [likeCounts, bookmarkCounts, attendanceCounts, userLikes, userBookmarks, userAttendances] = await Promise.all([
        ...countQueries,
        prisma.eventLike.findMany({
          where: { userId: user.id, eventId: { in: eventIds } },
          select: { eventId: true },
        }),
        prisma.eventBookmark.findMany({
          where: { userId: user.id, eventId: { in: eventIds } },
          select: { eventId: true },
        }),
        prisma.eventAttendance.findMany({
          where: { userId: user.id, eventId: { in: eventIds } },
          select: { eventId: true },
        }),
      ]);

      likesById = new Map(likeCounts.map((x) => [x.eventId, x._count._all]));
      bookmarksById = new Map(bookmarkCounts.map((x) => [x.eventId, x._count._all]));
      attendanceById = new Map(attendanceCounts.map((x) => [x.eventId, x._count._all]));
      userLikedIds = new Set(userLikes.map((x) => x.eventId));
      userBookmarkedIds = new Set(userBookmarks.map((x) => x.eventId));
      userAttendingIds = new Set(userAttendances.map((x) => x.eventId));
    } else {
      const [likeCounts, bookmarkCounts, attendanceCounts] = await Promise.all(countQueries);

      likesById = new Map(likeCounts.map((x) => [x.eventId, x._count._all]));
      bookmarksById = new Map(bookmarkCounts.map((x) => [x.eventId, x._count._all]));
      attendanceById = new Map(attendanceCounts.map((x) => [x.eventId, x._count._all]));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Home</Link>
        <h1 className="text-lg font-bold text-msu-white">Events</h1>
      </header>

      <main className="max-w-lg mx-auto sm:py-6 space-y-4 sm:space-y-6">
        {events.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-12">No upcoming events yet.</p>
        ) : (
          events.map((e) => (
            <div
              key={e.id}
              className="bg-white dark:bg-gray-900 border-y sm:border sm:rounded-lg border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              <Link
                href={`/event/${e.id}`}
                aria-label={`View details for ${e.title}`}
                className="block hover:opacity-95 transition-opacity"
              >
                {/* Banner */}
                <div className="relative bg-gradient-to-br from-msu-red to-msu-red/70 flex items-end h-28 sm:h-auto sm:aspect-[4/5]">
                  <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,.15)_10px,rgba(255,255,255,.15)_20px)]" />
                  <h2 className="relative px-4 pb-3 text-base sm:text-lg font-bold text-msu-white leading-tight drop-shadow-sm line-clamp-2">
                    {e.title}
                  </h2>
                </div>

                {/* Meta */}
                <div className="px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <span>
                    {e.startAt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                  <span>
                    {e.startAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {e.endAt && ` – ${e.endAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                  </span>
                  {e.location && <span>{e.location}</span>}
                </div>

                {/* Snippet */}
                {e.description && (
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                      {e.description.length > 140 ? e.description.slice(0, 140) + "…" : e.description}
                    </p>
                  </div>
                )}
              </Link>

              {/* Action Row */}
              <FeedActionRow
                eventId={e.id}
                isGuest={!user}
                initialLiked={userLikedIds.has(e.id)}
                initialBookmarked={userBookmarkedIds.has(e.id)}
                initialAttending={userAttendingIds.has(e.id)}
                initialLikeCount={likesById.get(e.id) ?? 0}
                initialBookmarkCount={bookmarksById.get(e.id) ?? 0}
                initialAttendeeCount={attendanceById.get(e.id) ?? 0}
              />
            </div>
          ))
        )}
      </main>
    </div>
  );
}
