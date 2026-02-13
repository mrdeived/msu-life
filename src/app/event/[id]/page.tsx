import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import AttendButton from "@/components/AttendButton";
import BookmarkButton from "@/components/BookmarkButton";
import LikeButton from "@/components/LikeButton";

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

      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        {!event ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Event not found.</p>
            <Link href="/feed" className="text-sm text-msu-red hover:underline">&larr; Back to events</Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 sm:p-6 space-y-4">
            <h2 className="text-xl font-bold text-msu-red">{event.title}</h2>

            <dl className="space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="font-medium w-16 shrink-0">Date</dt>
                <dd className="text-gray-600 dark:text-gray-400">
                  {event.startAt.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium w-16 shrink-0">Time</dt>
                <dd className="text-gray-600 dark:text-gray-400">
                  {event.startAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {event.endAt && (
                    <> – {event.endAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</>
                  )}
                </dd>
              </div>
              {event.location && (
                <div className="flex gap-2">
                  <dt className="font-medium w-16 shrink-0">Place</dt>
                  <dd className="text-gray-600 dark:text-gray-400">{event.location}</dd>
                </div>
              )}
            </dl>

            {event.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{event.description}</p>
            )}

            <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
              <AttendButton eventId={event.id} initialAttending={isAttending} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {attendeeCount} attending
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
              <BookmarkButton eventId={event.id} initialBookmarked={isBookmarked} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {bookmarkCount} bookmarked
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
              <LikeButton eventId={event.id} initialLiked={isLiked} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {likeCount} {likeCount === 1 ? "like" : "likes"}
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
