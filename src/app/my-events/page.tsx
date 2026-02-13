import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

export default async function MyEventsPage() {
  const user = await requireAuth();

  const attendances = await prisma.eventAttendance.findMany({
    where: { userId: user.id },
    orderBy: { event: { startAt: "asc" } },
    select: {
      createdAt: true,
      event: {
        select: { id: true, title: true, description: true, location: true, startAt: true, endAt: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Home</Link>
        <h1 className="text-lg font-bold text-msu-white">My Events</h1>
      </header>

      <main className="max-w-lg mx-auto sm:py-6 space-y-4 sm:space-y-6">
        {attendances.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-12">You&apos;re not attending any events yet.</p>
        ) : (
          attendances.map((a) => (
            <Link
              key={a.event.id}
              href={`/event/${a.event.id}`}
              aria-label={`View details for ${a.event.title}`}
              className="block bg-white dark:bg-gray-900 border-y sm:border sm:rounded-lg border-gray-200 dark:border-gray-800 overflow-hidden hover:ring-2 hover:ring-msu-red/30 transition-shadow"
            >
              <article>
                {/* Banner */}
                <div className="relative bg-gradient-to-br from-msu-red to-msu-red/70 flex items-end h-28 sm:h-auto sm:aspect-[4/5]">
                  <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,.15)_10px,rgba(255,255,255,.15)_20px)]" />
                  <h2 className="relative px-4 pb-3 text-base sm:text-lg font-bold text-msu-white leading-tight drop-shadow-sm line-clamp-2">
                    {a.event.title}
                  </h2>
                </div>

                {/* Meta */}
                <div className="px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <span>
                    {a.event.startAt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                  <span>
                    {a.event.startAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {a.event.endAt && ` – ${a.event.endAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                  </span>
                  {a.event.location && <span>{a.event.location}</span>}
                </div>

                {/* Snippet */}
                {a.event.description && (
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                      {a.event.description.length > 140 ? a.event.description.slice(0, 140) + "…" : a.event.description}
                    </p>
                  </div>
                )}
              </article>
            </Link>
          ))
        )}
      </main>
    </div>
  );
}
