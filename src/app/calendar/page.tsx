import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import CalendarViewSwitcher from "@/components/CalendarViewSwitcher";

export default async function CalendarPage() {
  await requireAuth();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // 3-month window: previous month through next month
  const startRange = new Date(currentYear, currentMonth - 1, 1);
  const endRange = new Date(currentYear, currentMonth + 2, 0, 23, 59, 59, 999);

  const minDate = startRange;
  const maxDate = endRange;

  const events = await prisma.event.findMany({
    where: {
      isPublished: true,
      startAt: { gte: startRange, lte: endRange },
    },
    orderBy: { startAt: "asc" },
    select: { id: true, title: true, location: true, description: true, startAt: true, endAt: true },
  });

  // Serialize dates for client component
  const serializedEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    location: e.location,
    description: e.description,
    startAt: e.startAt.toISOString(),
    endAt: e.endAt?.toISOString() ?? null,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Home</Link>
        <h1 className="text-lg font-bold text-msu-white">Calendar</h1>
      </header>

      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        <CalendarViewSwitcher
          events={serializedEvents}
          initialYear={currentYear}
          initialMonth={currentMonth}
          minYear={minDate.getFullYear()}
          minMonth={minDate.getMonth()}
          maxYear={maxDate.getFullYear()}
          maxMonth={maxDate.getMonth()}
        />
      </main>
    </div>
  );
}
