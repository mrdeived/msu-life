"use client";

import Link from "next/link";

interface CalendarEvent {
  id: string;
  title: string;
  startAt: string;
}

interface Props {
  events: CalendarEvent[];
  year: number;
  month: number;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarMonthView({ events, year, month }: Props) {
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build a map: day number -> events on that day
  const eventsByDay = new Map<number, CalendarEvent[]>();
  for (const e of events) {
    const d = new Date(e.startAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!eventsByDay.has(day)) eventsByDay.set(day, []);
      eventsByDay.get(day)!.push(e);
    }
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  // Build grid cells: leading blanks + day cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`blank-${i}`} className="bg-gray-50 dark:bg-gray-950 min-h-[4.5rem] sm:min-h-[5.5rem]" />;
          }

          const dayEvents = eventsByDay.get(day) ?? [];
          const isToday = isCurrentMonth && day === todayDate;
          const shown = dayEvents.slice(0, 2);
          const extra = dayEvents.length - 2;

          return (
            <div
              key={day}
              className="bg-white dark:bg-gray-900 min-h-[4.5rem] sm:min-h-[5.5rem] p-1 flex flex-col"
            >
              <span
                className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-0.5 ${
                  isToday
                    ? "bg-msu-red text-msu-white"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {day}
              </span>
              <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                {shown.map((e) => (
                  <Link
                    key={e.id}
                    href={`/event/${e.id}`}
                    className="block text-[10px] leading-tight px-1 py-0.5 rounded bg-msu-red/10 text-msu-red dark:bg-msu-red/20 dark:text-red-300 truncate hover:bg-msu-red/20"
                  >
                    {e.title}
                  </Link>
                ))}
                {extra > 0 && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1">
                    +{extra} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
