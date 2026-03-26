import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

// ── Board cell styling ──────────────────────────────────────────────────────
type CellState = "correct" | "present" | "absent";

function cellClass(state: CellState): string {
  const base =
    "w-12 h-12 flex items-center justify-center text-lg font-bold border-2 rounded uppercase select-none";
  switch (state) {
    case "correct":
      return `${base} bg-green-600 border-green-600 text-white`;
    case "present":
      return `${base} bg-yellow-500 border-yellow-500 text-white`;
    case "absent":
      return `${base} bg-gray-500 border-gray-500 text-white`;
  }
}

function decodePattern(guessPattern: string): CellState[][] {
  if (!guessPattern) return [];
  return guessPattern
    .split("|")
    .filter(Boolean)
    .map((row) =>
      row
        .split("")
        .map((c) => (c === "C" ? "correct" : c === "P" ? "present" : "absent") as CellState)
    );
}

function decodeGuesses(guesses: string): string[] {
  if (!guesses) return [];
  return guesses.split("|").filter(Boolean);
}

// ── Page ────────────────────────────────────────────────────────────────────
export default async function WordleHistoryPage({
  params,
}: {
  params: Promise<{ resultId: string }>;
}) {
  const user = await requireAuth();
  const { resultId } = await params;

  const result = await prisma.wordleResult.findUnique({
    where: { id: resultId },
    select: {
      id: true,
      userId: true,
      puzzleDate: true,
      won: true,
      attempts: true,
      maxAttempts: true,
      guessPattern: true,
      guesses: true,
    },
  });

  // 404 for missing records or records owned by someone else
  if (!result || result.userId !== user.id) {
    notFound();
  }

  const patterns = decodePattern(result.guessPattern);
  const guessWords = decodeGuesses(result.guesses);
  const hasLetters = guessWords.length > 0;
  const hasBoard = patterns.length > 0;

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

      <main className="max-w-lg mx-auto flex flex-col items-center gap-5 px-4 py-6">
        {/* Label */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-semibold text-msu-red uppercase tracking-widest">
            Past Result
          </span>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
            {result.puzzleDate}
          </p>
        </div>

        {/* Outcome card */}
        <div className="w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 text-center">
          {result.won ? (
            <>
              <p className="text-xl font-bold text-green-600">Solved!</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {result.attempts} of {result.maxAttempts} attempts
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-bold text-red-500">Not solved</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Used all {result.maxAttempts} attempts
              </p>
            </>
          )}
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-600">
            Historical result · read-only
          </p>
        </div>

        {/* Completed board */}
        {hasBoard ? (
          <div className="flex flex-col gap-1.5">
            {patterns.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-1.5">
                {row.map((state, colIdx) => {
                  const letter = hasLetters ? (guessWords[rowIdx]?.[colIdx] ?? "") : "";
                  return (
                    <div key={colIdx} className={cellClass(state)}>
                      {letter}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Board data is not available for this result.
          </p>
        )}

        {/* Color legend */}
        {hasBoard && (
          <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-green-600 inline-block" /> Correct
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-yellow-500 inline-block" /> Wrong spot
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-gray-500 inline-block" /> Not in word
            </span>
          </div>
        )}
      </main>
    </div>
  );
}
