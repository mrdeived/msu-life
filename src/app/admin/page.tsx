import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const { allowed } = await requireAdmin();

  if (!allowed) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
          <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Home</Link>
          <h1 className="text-lg font-bold text-msu-white">Admin</h1>
        </header>
        <main className="max-w-lg mx-auto p-4 sm:p-6">
          <div className="text-center py-12 space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Admin access required.</p>
            <Link href="/home" className="text-sm text-msu-red hover:underline">&larr; Back to Home</Link>
          </div>
        </main>
      </div>
    );
  }

  const events = await prisma.event.findMany({
    orderBy: [{ isPublished: "desc" }, { startAt: "asc" }],
    select: {
      id: true,
      title: true,
      location: true,
      startAt: true,
      endAt: true,
      isPublished: true,
      createdAt: true,
      createdBy: { select: { email: true } },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Home</Link>
        <h1 className="text-lg font-bold text-msu-white">Admin</h1>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              All Events ({events.length})
            </h2>
          </div>

          {events.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No events yet.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {events.map((e) => (
                <div key={e.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Link
                        href={`/event/${e.id}`}
                        className="text-sm font-medium text-msu-red hover:underline truncate"
                      >
                        {e.title}
                      </Link>
                      <span
                        className={`shrink-0 px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                          e.isPublished
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {e.isPublished ? "Published" : "Hidden"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-400 dark:text-gray-500">
                      <span>
                        {e.startAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        {" "}
                        {e.startAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {e.location && <span>{e.location}</span>}
                      {e.createdBy && <span>by {e.createdBy.email}</span>}
                    </div>
                  </div>

                  {/* Action */}
                  <form action={e.isPublished ? unpublishEvent : publishEvent}>
                    <input type="hidden" name="eventId" value={e.id} />
                    <button
                      type="submit"
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                        e.isPublished
                          ? "border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                          : "border-msu-green text-msu-green hover:bg-msu-green hover:text-msu-white"
                      }`}
                    >
                      {e.isPublished ? "Unpublish" : "Publish"}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

async function publishEvent(formData: FormData) {
  "use server";

  const { requireAdmin: requireAdminServer } = await import("@/lib/requireAdmin");
  const { prisma: db } = await import("@/lib/prisma");
  const { revalidatePath: revalidate } = await import("next/cache");

  const { allowed } = await requireAdminServer();
  if (!allowed) return;

  const eventId = formData.get("eventId") as string;
  if (!eventId) return;

  await db.event.update({ where: { id: eventId }, data: { isPublished: true } });

  revalidate("/admin");
  revalidate("/feed");
  revalidate(`/event/${eventId}`);
  revalidate("/calendar");
}

async function unpublishEvent(formData: FormData) {
  "use server";

  const { requireAdmin: requireAdminServer } = await import("@/lib/requireAdmin");
  const { prisma: db } = await import("@/lib/prisma");
  const { revalidatePath: revalidate } = await import("next/cache");

  const { allowed } = await requireAdminServer();
  if (!allowed) return;

  const eventId = formData.get("eventId") as string;
  if (!eventId) return;

  await db.event.update({ where: { id: eventId }, data: { isPublished: false } });

  revalidate("/admin");
  revalidate("/feed");
  revalidate(`/event/${eventId}`);
  revalidate("/calendar");
}
