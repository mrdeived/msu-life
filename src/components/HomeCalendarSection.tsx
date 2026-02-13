import { prisma } from "@/lib/prisma";
import CalendarViewSwitcher from "./CalendarViewSwitcher";

export default async function HomeCalendarSection() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const startRange = new Date(currentYear, currentMonth - 1, 1);
  const endRange = new Date(currentYear, currentMonth + 2, 0, 23, 59, 59, 999);

  const events = await prisma.event.findMany({
    where: {
      isPublished: true,
      startAt: { gte: startRange, lte: endRange },
    },
    orderBy: { startAt: "asc" },
    select: { id: true, title: true, location: true, description: true, startAt: true, endAt: true },
  });

  const serializedEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    location: e.location,
    description: e.description,
    startAt: e.startAt.toISOString(),
    endAt: e.endAt?.toISOString() ?? null,
  }));

  return (
    <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
      <h2 className="text-base font-semibold mb-4 text-msu-red">Calendar</h2>
      <CalendarViewSwitcher
        events={serializedEvents}
        initialYear={currentYear}
        initialMonth={currentMonth}
        minYear={startRange.getFullYear()}
        minMonth={startRange.getMonth()}
        maxYear={endRange.getFullYear()}
        maxMonth={endRange.getMonth()}
      />
    </section>
  );
}
