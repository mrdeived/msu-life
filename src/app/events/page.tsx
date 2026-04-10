import { optionalAuth } from "@/lib/optionalAuth";
import { prisma } from "@/lib/prisma";
import EventsHub from "./EventsHub";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default async function EventsPage() {
  const user = await optionalAuth();

  // Fetch all published events for Browse tab (client handles date filter + sort)
  const rawEvents = await prisma.event.findMany({
    where: { isPublished: true },
    orderBy: { startAt: "asc" },
    take: 100,
    select: { id: true, title: true, description: true, location: true, startAt: true, endAt: true, imageUrl: true },
  });

  const eventIds = rawEvents.map((e) => e.id);

  // Fetch interaction counts and user state
  const countQueries = [
    prisma.eventLike.groupBy({ by: ["eventId"], where: { eventId: { in: eventIds } }, _count: { _all: true } }),
    prisma.eventBookmark.groupBy({ by: ["eventId"], where: { eventId: { in: eventIds } }, _count: { _all: true } }),
    prisma.eventAttendance.groupBy({ by: ["eventId"], where: { eventId: { in: eventIds } }, _count: { _all: true } }),
  ] as const;

  let likesById = new Map<string, number>();
  let bookmarksById = new Map<string, number>();
  let attendanceById = new Map<string, number>();
  let userLikedIds = new Set<string>();
  let userBookmarkedIds = new Set<string>();
  let userAttendingIds = new Set<string>();
  let attending: { id: string; title: string; description: string | null; location: string | null; startAt: string; endAt: string | null }[] = [];
  let bookmarked: typeof attending = [];
  let isAdmin = false;

  if (user) {
    const [likeCounts, bookmarkCounts, attendanceCounts, userLikes, userBookmarks, userAttendances, attendances, userBookmarks2, dbUser] =
      await Promise.all([
        ...countQueries,
        prisma.eventLike.findMany({ where: { userId: user.id, eventId: { in: eventIds } }, select: { eventId: true } }),
        prisma.eventBookmark.findMany({ where: { userId: user.id, eventId: { in: eventIds } }, select: { eventId: true } }),
        prisma.eventAttendance.findMany({ where: { userId: user.id, eventId: { in: eventIds } }, select: { eventId: true } }),
        prisma.eventAttendance.findMany({
          where: { userId: user.id },
          orderBy: { event: { startAt: "asc" } },
          select: { event: { select: { id: true, title: true, description: true, location: true, startAt: true, endAt: true } } },
        }),
        prisma.eventBookmark.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          select: { event: { select: { id: true, title: true, description: true, location: true, startAt: true, endAt: true } } },
        }),
        prisma.user.findUnique({ where: { id: user.id }, select: { isAdmin: true, email: true } }),
      ]);

    likesById = new Map(likeCounts.map((x) => [x.eventId, x._count._all]));
    bookmarksById = new Map(bookmarkCounts.map((x) => [x.eventId, x._count._all]));
    attendanceById = new Map(attendanceCounts.map((x) => [x.eventId, x._count._all]));
    userLikedIds = new Set(userLikes.map((x) => x.eventId));
    userBookmarkedIds = new Set(userBookmarks.map((x) => x.eventId));
    userAttendingIds = new Set(userAttendances.map((x) => x.eventId));

    attending = attendances.map((a) => ({
      id: a.event.id,
      title: a.event.title,
      description: a.event.description,
      location: a.event.location,
      startAt: a.event.startAt.toISOString(),
      endAt: a.event.endAt?.toISOString() ?? null,
    }));
    bookmarked = userBookmarks2.map((b) => ({
      id: b.event.id,
      title: b.event.title,
      description: b.event.description,
      location: b.event.location,
      startAt: b.event.startAt.toISOString(),
      endAt: b.event.endAt?.toISOString() ?? null,
    }));

    isAdmin = !!(dbUser && (dbUser.isAdmin || ADMIN_EMAILS.includes(dbUser.email.toLowerCase())));
  } else {
    const [likeCounts, bookmarkCounts, attendanceCounts] = await Promise.all(countQueries);
    likesById = new Map(likeCounts.map((x) => [x.eventId, x._count._all]));
    bookmarksById = new Map(bookmarkCounts.map((x) => [x.eventId, x._count._all]));
    attendanceById = new Map(attendanceCounts.map((x) => [x.eventId, x._count._all]));
  }

  const browseEvents = rawEvents.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    location: e.location,
    startAt: e.startAt.toISOString(),
    endAt: e.endAt?.toISOString() ?? null,
    imageUrl: e.imageUrl,
    likeCount: likesById.get(e.id) ?? 0,
    bookmarkCount: bookmarksById.get(e.id) ?? 0,
    attendeeCount: attendanceById.get(e.id) ?? 0,
    liked: userLikedIds.has(e.id),
    bookmarked: userBookmarkedIds.has(e.id),
    attending: userAttendingIds.has(e.id),
  }));

  return (
    <EventsHub
      isGuest={!user}
      isAdmin={isAdmin}
      browseEvents={browseEvents}
      attending={attending}
      bookmarked={bookmarked}
    />
  );
}
