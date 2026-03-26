import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

export default async function WordleArchivePage() {
  const user = await requireAuth();

  const results = await prisma.wordleResult.findMany({
    where: { userId: user.id },
    select: { id: true, puzzleDate: true, won: true, attempts: true, maxAttempts: true },
    orderBy: { puzzleDate: "desc" },
    take: 100,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      {/* Header */}
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center">
        <Link
          href="/games/wordle"
          className="text-sm text-msu-white/80 hover:text-msu-white mr-4"
        >
          ← Wordle
        </Link>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-msu-white italic">
          Beaver Wordle
        </h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Page title */}
        <div className="mb-5">
          <h2 className="text-base font-semibold text-msu-red">Your Archive</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            All your completed Beaver Wordle puzzles
          </p>
        </div>

        {results.length === 0 ? (
          /* Empty state */
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              No completed puzzles yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              Finish today&apos;s Beaver Wordle to start your archive.
            </p>
            <Link
              href="/games/wordle"
              className="inline-block text-xs font-medium text-msu-red hover:underline"
            >
              Play today&apos;s puzzle →
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            {results.map((r) => (
              <Link
                key={r.id}
                href={`/games/wordle/history/${r.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {/* Date */}
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono shrink-0 w-24">
                  {r.puzzleDate}
                </span>

                {/* Win / Loss badge */}
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                    r.won
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {r.won ? "Win" : "Loss"}
                </span>

                {/* Attempts */}
                <span className="flex-1 text-xs text-gray-500 dark:text-gray-400">
                  {r.won
                    ? `${r.attempts}/${r.maxAttempts} attempts`
                    : "Not solved"}
                </span>

                {/* Chevron */}
                <span className="text-gray-300 dark:text-gray-600 text-sm">›</span>
              </Link>
            ))}
          </div>
        )}

        {results.length === 100 && (
          <p className="mt-3 text-xs text-center text-gray-400 dark:text-gray-600">
            Showing your 100 most recent results
          </p>
        )}
      </main>
    </div>
  );
}
