import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

export default async function AnnouncementsPage() {
  await requireAuth();

  const announcements = await prisma.announcement.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, body: true, createdAt: true },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Home</Link>
        <h1 className="text-lg font-bold text-msu-white">Announcements</h1>
      </header>

      <main className="max-w-lg mx-auto sm:py-6 space-y-4 sm:space-y-6">
        {announcements.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-12">No announcements yet.</p>
        ) : (
          announcements.map((a) => (
            <Link
              key={a.id}
              href={`/announcements/${a.id}`}
              className="block bg-white dark:bg-gray-900 border-y sm:border sm:rounded-lg border-gray-200 dark:border-gray-800 overflow-hidden hover:ring-2 hover:ring-msu-red/30 transition-shadow"
            >
              <article className="p-4 sm:p-5 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h2 className="text-sm font-semibold text-msu-red leading-tight">{a.title}</h2>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {a.createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                  {a.body.length > 160 ? a.body.slice(0, 160) + "…" : a.body}
                </p>
              </article>
            </Link>
          ))
        )}
      </main>
    </div>
  );
}
