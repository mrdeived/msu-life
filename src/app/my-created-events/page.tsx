import Link from "next/link";
import { Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import DeleteEventButton from "@/components/DeleteEventButton";

export default async function MyCreatedEventsPage() {
  const { allowed, user: admin } = await requireAdmin();

  if (!allowed || !admin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
          <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Home</Link>
          <h1 className="text-lg font-bold text-msu-white">My Created Events</h1>
        </header>
        <main className="max-w-lg mx-auto p-4 sm:p-6">
          <div className="text-center py-12 space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Only admins can manage events.</p>
            <Link href="/home" className="text-sm text-msu-red hover:underline">&larr; Back to Home</Link>
          </div>
        </main>
      </div>
    );
  }

  const events = await prisma.event.findMany({
    where: { createdById: admin.id },
    orderBy: [{ isPublished: "desc" }, { startAt: "asc" }],
    select: {
      id: true,
      title: true,
      location: true,
      description: true,
      startAt: true,
      endAt: true,
      isPublished: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Home</Link>
        <h1 className="text-lg font-bold text-msu-white">My Created Events</h1>
      </header>

      <main className="max-w-lg mx-auto sm:py-6 space-y-4 sm:space-y-6">
        {events.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">You haven&apos;t created any events yet.</p>
            <Link href="/events/new" className="text-sm text-msu-red hover:underline">Create your first event &rarr;</Link>
          </div>
        ) : (
          events.map((e) => (
            <div
              key={e.id}
              className="bg-white dark:bg-gray-900 border-y sm:border sm:rounded-lg border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              {/* Clickable card body → detail page */}
              <Link
                href={`/event/${e.id}`}
                aria-label={`View details for ${e.title}`}
                className="block hover:ring-2 hover:ring-msu-red/30 transition-shadow"
              >
                <article>
                  {/* Banner */}
                  <div className="relative bg-gradient-to-br from-msu-red to-msu-red/70 flex items-end h-28 sm:h-auto sm:aspect-[4/5]">
                    <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,.15)_10px,rgba(255,255,255,.15)_20px)]" />
                    <div className="relative flex items-end justify-between w-full px-4 pb-3">
                      <h2 className="text-base sm:text-lg font-bold text-msu-white leading-tight drop-shadow-sm line-clamp-2">
                        {e.title}
                      </h2>
                      <span
                        className={`shrink-0 ml-2 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          e.isPublished
                            ? "bg-msu-green/90 text-msu-white"
                            : "bg-gray-800/60 text-gray-200"
                        }`}
                      >
                        {e.isPublished ? "Published" : "Hidden"}
                      </span>
                    </div>
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
                </article>
              </Link>

              {/* Admin action row — outside the Link */}
              <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                {/* Edit */}
                <Link
                  href={`/admin/events/${e.id}/edit`}
                  className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-msu-red hover:bg-msu-red/10 transition-colors"
                  aria-label="Edit event"
                >
                  <Pencil className="w-4 h-4" />
                </Link>

                {/* Publish / Unpublish */}
                <form action={e.isPublished ? unpublishEvent : publishEvent}>
                  <input type="hidden" name="eventId" value={e.id} />
                  <button
                    type="submit"
                    className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors ${
                      e.isPublished
                        ? "border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        : "border-msu-green text-msu-green hover:bg-msu-green hover:text-msu-white"
                    }`}
                  >
                    {e.isPublished ? "Unpublish" : "Publish"}
                  </button>
                </form>

                {/* Delete */}
                <div className="ml-auto">
                  <DeleteEventButton eventId={e.id} action={deleteEvent} />
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

async function publishEvent(formData: FormData) {
  "use server";

  const { requireAdmin: req } = await import("@/lib/requireAdmin");
  const { prisma: db } = await import("@/lib/prisma");
  const { revalidatePath: r } = await import("next/cache");

  const { allowed, user: admin } = await req();
  if (!allowed || !admin) return;

  const eventId = formData.get("eventId") as string;
  if (!eventId) return;

  const event = await db.event.findUnique({ where: { id: eventId }, select: { createdById: true } });
  if (!event || event.createdById !== admin.id) return;

  await db.event.update({ where: { id: eventId }, data: { isPublished: true } });

  r("/my-created-events");
  r("/feed");
  r(`/event/${eventId}`);
  r("/calendar");
}

async function unpublishEvent(formData: FormData) {
  "use server";

  const { requireAdmin: req } = await import("@/lib/requireAdmin");
  const { prisma: db } = await import("@/lib/prisma");
  const { revalidatePath: r } = await import("next/cache");

  const { allowed, user: admin } = await req();
  if (!allowed || !admin) return;

  const eventId = formData.get("eventId") as string;
  if (!eventId) return;

  const event = await db.event.findUnique({ where: { id: eventId }, select: { createdById: true } });
  if (!event || event.createdById !== admin.id) return;

  await db.event.update({ where: { id: eventId }, data: { isPublished: false } });

  r("/my-created-events");
  r("/feed");
  r(`/event/${eventId}`);
  r("/calendar");
}

async function deleteEvent(formData: FormData) {
  "use server";

  const { requireAdmin: req } = await import("@/lib/requireAdmin");
  const { prisma: db } = await import("@/lib/prisma");
  const { revalidatePath: r } = await import("next/cache");

  const { allowed, user: admin } = await req();
  if (!allowed || !admin) return;

  const eventId = formData.get("eventId") as string;
  if (!eventId) return;

  const event = await db.event.findUnique({ where: { id: eventId }, select: { createdById: true } });
  if (!event || event.createdById !== admin.id) return;

  await db.event.delete({ where: { id: eventId } });

  r("/my-created-events");
  r("/feed");
  r(`/event/${eventId}`);
  r("/calendar");
}
