"use client";

import Link from "next/link";

interface CalendarEvent {
  id: string;
  title: string;
  location?: string | null;
  description?: string | null;
  startAt: string;
  endAt?: string | null;
}

interface Props {
  events: CalendarEvent[];
}

export default function CalendarListView({ events }: Props) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No events in this period.</p>
    );
  }

  // Group events by date string
  const grouped = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const dateKey = new Date(e.startAt).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    if (!grouped.has(dateKey)) grouped.set(dateKey, []);
    grouped.get(dateKey)!.push(e);
  }

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([dateLabel, dayEvents]) => (
        <div key={dateLabel}>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1 mb-2">
            {dateLabel}
          </h3>
          <div className="space-y-2">
            {dayEvents.map((e) => {
              const start = new Date(e.startAt);
              const end = e.endAt ? new Date(e.endAt) : null;
              return (
                <Link
                  key={e.id}
                  href={`/event/${e.id}`}
                  className="block bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3 hover:border-msu-red/40 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-msu-red leading-tight">{e.title}</h4>
                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {end && ` – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                    </span>
                  </div>
                  {e.location && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{e.location}</p>
                  )}
                  {e.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {e.description.length > 120 ? e.description.slice(0, 120) + "…" : e.description}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
