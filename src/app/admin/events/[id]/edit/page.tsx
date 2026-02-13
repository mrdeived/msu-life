import Link from "next/link";
import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";

function toLocalInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
}

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { allowed, user: admin } = await requireAdmin();

  if (!allowed || !admin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
          <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Home</Link>
          <h1 className="text-lg font-bold text-msu-white">Edit Event</h1>
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

  const { id } = await params;
  const { error } = await searchParams;

  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      startAt: true,
      endAt: true,
      createdById: true,
      isPublished: true,
    },
  });

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
          <Link href="/admin" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Admin</Link>
          <h1 className="text-lg font-bold text-msu-white">Edit Event</h1>
        </header>
        <main className="max-w-lg mx-auto p-4 sm:p-6">
          <div className="text-center py-12 space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Event not found.</p>
            <Link href="/admin" className="text-sm text-msu-red hover:underline">&larr; Back to Admin</Link>
          </div>
        </main>
      </div>
    );
  }

  if (event.createdById !== admin.id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
          <Link href="/admin" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Admin</Link>
          <h1 className="text-lg font-bold text-msu-white">Edit Event</h1>
        </header>
        <main className="max-w-lg mx-auto p-4 sm:p-6">
          <div className="text-center py-12 space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Not allowed — you can only edit your own events.</p>
            <Link href="/admin" className="text-sm text-msu-red hover:underline">&larr; Back to Admin</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <Link href="/admin" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Admin</Link>
        <h1 className="text-lg font-bold text-msu-white">Edit Event</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 sm:p-6">
        <form
          action={updateEvent}
          className="bg-white dark:bg-gray-900 sm:rounded-lg border-y sm:border border-gray-200 dark:border-gray-800 p-5 sm:p-6 space-y-4"
        >
          <input type="hidden" name="eventId" value={event.id} />

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={120}
              defaultValue={event.title}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-msu-red/50 focus:border-msu-red"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              maxLength={120}
              defaultValue={event.location ?? ""}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-msu-red/50 focus:border-msu-red"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="startAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Start <span className="text-red-500">*</span>
              </label>
              <input
                id="startAt"
                name="startAt"
                type="datetime-local"
                required
                defaultValue={toLocalInput(event.startAt)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-msu-red/50 focus:border-msu-red"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="endAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                End
              </label>
              <input
                id="endAt"
                name="endAt"
                type="datetime-local"
                defaultValue={event.endAt ? toLocalInput(event.endAt) : ""}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-msu-red/50 focus:border-msu-red"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              maxLength={2000}
              rows={4}
              defaultValue={event.description ?? ""}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-msu-red/50 focus:border-msu-red resize-y"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium rounded-md bg-msu-red text-msu-white hover:bg-msu-red/90 transition-colors"
            >
              Save Changes
            </button>
            <Link
              href="/admin"
              className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

async function updateEvent(formData: FormData) {
  "use server";

  const { requireAdmin: requireAdminServer } = await import("@/lib/requireAdmin");
  const { prisma: db } = await import("@/lib/prisma");
  const { revalidatePath: revalidate } = await import("next/cache");
  const { redirect: redirectServer } = await import("next/navigation");

  const { allowed, user: adminUser } = await requireAdminServer();
  if (!allowed || !adminUser) {
    redirectServer("/home");
  }

  const eventId = formData.get("eventId") as string;
  if (!eventId) {
    redirectServer("/admin");
  }

  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { createdById: true },
  });

  if (!event || event.createdById !== adminUser!.id) {
    redirectServer("/admin");
  }

  const title = (formData.get("title") as string | null)?.trim();
  const location = (formData.get("location") as string | null)?.trim() || null;
  const description = (formData.get("description") as string | null)?.trim() || null;
  const startAtRaw = formData.get("startAt") as string | null;
  const endAtRaw = (formData.get("endAt") as string | null)?.trim() || null;

  if (!title || title.length === 0) {
    redirectServer(`/admin/events/${eventId}/edit?error=Title+is+required`);
  }
  if (title!.length > 120) {
    redirectServer(`/admin/events/${eventId}/edit?error=Title+is+too+long`);
  }

  if (!startAtRaw) {
    redirectServer(`/admin/events/${eventId}/edit?error=Start+date+is+required`);
  }

  const startAt = new Date(startAtRaw!);
  if (isNaN(startAt.getTime())) {
    redirectServer(`/admin/events/${eventId}/edit?error=Invalid+start+date`);
  }

  let endAt: Date | null = null;
  if (endAtRaw) {
    endAt = new Date(endAtRaw);
    if (isNaN(endAt.getTime())) {
      redirectServer(`/admin/events/${eventId}/edit?error=Invalid+end+date`);
    }
    if (endAt <= startAt) {
      redirectServer(`/admin/events/${eventId}/edit?error=End+must+be+after+start`);
    }
  }

  await db.event.update({
    where: { id: eventId },
    data: {
      title: title!,
      description,
      location,
      startAt,
      endAt,
    },
  });

  revalidate("/admin");
  revalidate("/feed");
  revalidate(`/event/${eventId}`);
  revalidate("/calendar");

  redirectServer("/admin");
}
