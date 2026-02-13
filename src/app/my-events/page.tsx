import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import MyEventsTabs from "@/components/MyEventsTabs";

export default async function MyEventsPage() {
  const user = await requireAuth();

  const [attendances, bookmarks] = await Promise.all([
    prisma.eventAttendance.findMany({
      where: { userId: user.id },
      orderBy: { event: { startAt: "asc" } },
      select: {
        event: {
          select: { id: true, title: true, description: true, location: true, startAt: true, endAt: true },
        },
      },
    }),
    prisma.eventBookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        event: {
          select: { id: true, title: true, description: true, location: true, startAt: true, endAt: true },
        },
      },
    }),
  ]);

  const attending = attendances.map((a) => ({
    id: a.event.id,
    title: a.event.title,
    description: a.event.description,
    location: a.event.location,
    startAt: a.event.startAt.toISOString(),
    endAt: a.event.endAt?.toISOString() ?? null,
  }));

  const bookmarked = bookmarks.map((b) => ({
    id: b.event.id,
    title: b.event.title,
    description: b.event.description,
    location: b.event.location,
    startAt: b.event.startAt.toISOString(),
    endAt: b.event.endAt?.toISOString() ?? null,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Home</Link>
        <h1 className="text-lg font-bold text-msu-white">My Events</h1>
      </header>

      <main className="max-w-lg mx-auto sm:py-6 space-y-4 sm:space-y-6">
        <MyEventsTabs attending={attending} bookmarked={bookmarked} />
      </main>
    </div>
  );
}
