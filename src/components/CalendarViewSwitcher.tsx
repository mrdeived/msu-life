"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CalendarMonthView from "./CalendarMonthView";
import CalendarListView from "./CalendarListView";

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
  initialYear: number;
  initialMonth: number;
  minMonth: number;
  minYear: number;
  maxMonth: number;
  maxYear: number;
}

type View = "month" | "list";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarViewSwitcher({
  events,
  initialYear,
  initialMonth,
  minMonth,
  minYear,
  maxMonth,
  maxYear,
}: Props) {
  const [view, setView] = useState<View>("month");
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  const canPrev = year > minYear || (year === minYear && month > minMonth);
  const canNext = year < maxYear || (year === maxYear && month < maxMonth);

  function goPrev() {
    if (!canPrev) return;
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function goNext() {
    if (!canNext) return;
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  // Filter events for current month (month view) or all (list view)
  const monthEvents = events.filter((e) => {
    const d = new Date(e.startAt);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* View toggle */}
        <div className="flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => setView("month")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "month"
                ? "bg-msu-red text-msu-white"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "list"
                ? "bg-msu-red text-msu-white"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            List
          </button>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={!canPrev}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[8rem] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={goNext}
            disabled={!canNext}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* View */}
      {view === "month" ? (
        <CalendarMonthView events={monthEvents} year={year} month={month} />
      ) : (
        <CalendarListView events={monthEvents} />
      )}
    </div>
  );
}
