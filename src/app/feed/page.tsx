import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

export default async function FeedPage() {
  await requireAuth();

  const events = await prisma.event.findMany({
    where: { isPublished: true, startAt: { gt: new Date() } },
    orderBy: { startAt: "asc" },
    take: 20,
    select: { id: true, title: true, description: true, location: true, startAt: true, endAt: true },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Home</Link>
        <h1 className="text-lg font-bold text-msu-white">Events</h1>
      </header>

      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        {events.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-12">No upcoming events yet.</p>
        ) : (
          <ul className="space-y-4">
            {events.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/event/${e.id}`}
                  className="block bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-msu-red/40 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h2 className="text-sm font-semibold text-msu-red">{e.title}</h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {e.startAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {e.location && <span>{e.location}</span>}
                    <span>{e.startAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {e.endAt && (
                      <span>– {e.endAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    )}
                  </div>
                  {e.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {e.description.length > 120 ? e.description.slice(0, 120) + "…" : e.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
