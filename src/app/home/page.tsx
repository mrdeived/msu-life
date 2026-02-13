import Link from "next/link";
import { optionalAuth } from "@/lib/optionalAuth";
import { prisma } from "@/lib/prisma";
import { computeDisplayName } from "@/lib/deriveNames";
import HomeCalendarSection from "@/components/HomeCalendarSection";

export default async function HomePage() {
  const user = await optionalAuth();

  let displayName: string | null = null;
  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { firstName: true, lastName: true },
    });
    displayName = computeDisplayName(dbUser?.firstName ?? null, dbUser?.lastName ?? null, user.email);
  }

  const [events, announcements] = await Promise.all([
    prisma.event.findMany({
      where: { isPublished: true, startAt: { gt: new Date() } },
      orderBy: { startAt: "asc" },
      take: 10,
      select: { id: true, title: true, location: true, startAt: true },
    }),
    prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, body: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-msu-white">MSU Life</h1>
        <div className="flex items-center gap-3">
          {user ? (
            <span className="text-sm text-msu-white/80 hidden sm:inline">Hi, {displayName}</span>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-msu-white/90 hover:text-msu-white px-3 py-1 rounded-md border border-msu-white/30 hover:border-msu-white/60 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-base font-semibold mb-4 text-msu-red">Upcoming</h2>
            {events.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming events yet.</p>
            ) : (
              <ul className="space-y-3">
                {events.map((e) => (
                  <li key={e.id} className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-sm font-medium">{e.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{e.location}</p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {e.startAt.toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Announcements */}
          <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-base font-semibold mb-4 text-msu-red">Announcements</h2>
            {announcements.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No announcements.</p>
            ) : (
              <ul className="space-y-3">
                {announcements.map((a) => (
                  <li key={a.id}>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{a.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Calendar */}
        <HomeCalendarSection />
      </main>
    </div>
  );
}
