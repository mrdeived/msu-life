"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface ScheduledEntry {
  id: string;
  puzzleDate: string;
  answer: string;
  updatedAt: string;
}

export default function WordleScheduleManager({
  entries,
}: {
  entries: ScheduledEntry[];
}) {
  const router = useRouter();
  const [puzzleDate, setPuzzleDate] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingDate, setDeletingDate] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/games/wordle/word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puzzleDate, answer }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Failed to save");
        return;
      }

      setStatus("success");
      setPuzzleDate("");
      setAnswer("");
      router.refresh();
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setErrorMsg("Network error — please try again");
    }
  }

  async function handleDelete(date: string) {
    setDeletingDate(date);
    try {
      const res = await fetch(
        `/api/admin/games/wordle/word?date=${encodeURIComponent(date)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setDeletingDate(null);
    }
  }

  function handleRowClick(entry: ScheduledEntry) {
    setPuzzleDate(entry.puzzleDate);
    setAnswer(entry.answer);
    setStatus("idle");
    setErrorMsg("");
  }

  return (
    <div className="space-y-8">
      {/* ── Add / Update form ── */}
      <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
          Schedule a Word
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          If a word already exists for the selected date, it will be updated.
          Click a row below to pre-fill this form.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Puzzle date
            </label>
            <input
              type="date"
              value={puzzleDate}
              onChange={(e) => setPuzzleDate(e.target.value)}
              required
              className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-msu-red/50"
            />
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Answer word (5 letters)
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value.toUpperCase().slice(0, 5))}
              required
              minLength={5}
              maxLength={5}
              pattern="[A-Za-z]{5}"
              placeholder="CRANE"
              className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-mono uppercase text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-msu-red/50"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={status === "saving"}
              className="px-4 py-1.5 rounded bg-msu-red text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {status === "saving" ? "Saving…" : "Save Word"}
            </button>
          </div>
        </form>

        {status === "success" && (
          <p className="mt-2 text-xs text-green-600 dark:text-green-400">Saved successfully.</p>
        )}
        {status === "error" && errorMsg && (
          <p className="mt-2 text-xs text-red-500 dark:text-red-400">{errorMsg}</p>
        )}
      </section>

      {/* ── Scheduled words list ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Scheduled Words{entries.length > 0 ? ` (${entries.length})` : ""}
        </h2>

        {entries.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No scheduled words yet. Add one above.
          </p>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => handleRowClick(entry)}
                  className="flex-1 flex items-center gap-3 text-left"
                  title="Click to edit"
                >
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-24 shrink-0">
                    {entry.puzzleDate}
                  </span>
                  <span className="text-sm font-mono font-semibold text-gray-800 dark:text-gray-100 tracking-widest">
                    {entry.answer}
                  </span>
                  <span className="flex-1 text-xs text-gray-400 text-right">
                    updated {entry.updatedAt}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(entry.puzzleDate)}
                  disabled={deletingDate === entry.puzzleDate}
                  className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors shrink-0"
                >
                  {deletingDate === entry.puzzleDate ? "…" : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
