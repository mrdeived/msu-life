import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();

  const { id } = await params;

  const announcement = await prisma.announcement.findFirst({
    where: { id, isActive: true },
    select: { id: true, title: true, body: true, createdAt: true },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <Link href="/announcements" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Announcements</Link>
        <h1 className="text-lg font-bold text-msu-white">Announcement</h1>
      </header>

      <main className="max-w-lg mx-auto sm:py-6">
        {!announcement ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Announcement not found.</p>
            <Link href="/announcements" className="text-sm text-msu-red hover:underline">&larr; Back to announcements</Link>
          </div>
        ) : (
          <article className="bg-white dark:bg-gray-900 sm:rounded-lg border-y sm:border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-5 sm:p-6 space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-msu-red">{announcement.title}</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {announcement.createdAt.toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {announcement.body}
              </p>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
