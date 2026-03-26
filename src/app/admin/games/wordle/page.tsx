import Link from "next/link";
import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import WordleScheduleManager, { type ScheduledEntry } from "./WordleScheduleManager";

export default async function AdminWordlePage() {
  const { allowed } = await requireAdmin();

  if (!allowed) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
          <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">
            &larr; Home
          </Link>
          <h1 className="text-lg font-bold text-msu-white">Wordle Admin</h1>
        </header>
        <main className="max-w-lg mx-auto p-4 sm:p-6">
          <div className="text-center py-12 space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Admin access required.</p>
            <Link href="/home" className="text-sm text-msu-red hover:underline">
              &larr; Back to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const raw = await prisma.wordleScheduledWord.findMany({
    orderBy: { puzzleDate: "desc" },
    select: { id: true, puzzleDate: true, answer: true, updatedAt: true },
  });

  const entries: ScheduledEntry[] = raw.map((r) => ({
    id: r.id,
    puzzleDate: r.puzzleDate,
    answer: r.answer,
    updatedAt: r.updatedAt.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">
          &larr; Home
        </Link>
        <h1 className="text-lg font-bold text-msu-white">Wordle Admin</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-2">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-msu-red">Beaver Wordle — Daily Word Schedule</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Schedule a specific answer for any puzzle date. If no word is scheduled for a day,
            Beaver Wordle automatically uses its built-in fallback word for that date.
          </p>
        </div>

        <WordleScheduleManager entries={entries} />
      </main>
    </div>
  );
}
