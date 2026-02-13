import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

export default async function CreateEventPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAuth();
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Home</Link>
        <h1 className="text-lg font-bold text-msu-white">Create Event</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 sm:p-6">
        <form
          action={createEvent}
          className="bg-white dark:bg-gray-900 sm:rounded-lg border-y sm:border border-gray-200 dark:border-gray-800 p-5 sm:p-6 space-y-4"
        >
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
              placeholder="Event name"
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
              placeholder="Where is it?"
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
              placeholder="Tell people about the event…"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-msu-red/50 focus:border-msu-red resize-y"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium rounded-md bg-msu-red text-msu-white hover:bg-msu-red/90 transition-colors"
            >
              Create Event
            </button>
            <Link
              href="/home"
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

async function createEvent(formData: FormData) {
  "use server";

  const { requireAuth: requireAuthServer } = await import("@/lib/requireAuth");
  const { prisma: db } = await import("@/lib/prisma");
  const { redirect: redirectServer } = await import("next/navigation");

  await requireAuthServer();

  const title = (formData.get("title") as string | null)?.trim();
  const location = (formData.get("location") as string | null)?.trim() || null;
  const description = (formData.get("description") as string | null)?.trim() || null;
  const startAtRaw = formData.get("startAt") as string | null;
  const endAtRaw = (formData.get("endAt") as string | null)?.trim() || null;

  if (!title || title.length === 0) {
    redirectServer("/events/new?error=Title+is+required");
  }
  if (title!.length > 120) {
    redirectServer("/events/new?error=Title+is+too+long");
  }

  if (!startAtRaw) {
    redirectServer("/events/new?error=Start+date+is+required");
  }

  const startAt = new Date(startAtRaw!);
  if (isNaN(startAt.getTime())) {
    redirectServer("/events/new?error=Invalid+start+date");
  }

  let endAt: Date | null = null;
  if (endAtRaw) {
    endAt = new Date(endAtRaw);
    if (isNaN(endAt.getTime())) {
      redirectServer("/events/new?error=Invalid+end+date");
    }
    if (endAt <= startAt) {
      redirectServer("/events/new?error=End+must+be+after+start");
    }
  }

  const event = await db.event.create({
    data: {
      title: title!,
      location,
      description,
      startAt,
      endAt,
      isPublished: true,
    },
    select: { id: true },
  });

  redirectServer(`/event/${event.id}`);
}
