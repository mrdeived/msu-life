"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { evaluateGuess, type EvaluatedLetter } from "./evaluate";

const ANSWER = "BEARS";
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

type CellState = "correct" | "present" | "absent" | "empty";

interface SubmittedRow {
  letters: EvaluatedLetter[];
}

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  won: boolean;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
}

function cellStyle(state: CellState): string {
  const base =
    "w-12 h-12 flex items-center justify-center text-lg font-bold border-2 uppercase select-none";
  switch (state) {
    case "correct":
      return `${base} bg-green-600 border-green-600 text-white`;
    case "present":
      return `${base} bg-yellow-500 border-yellow-500 text-white`;
    case "absent":
      return `${base} bg-gray-500 border-gray-500 text-white`;
    case "empty":
      return `${base} bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100`;
  }
}

function GameBoard({
  submitted,
  currentGuess,
  currentRow,
}: {
  submitted: SubmittedRow[];
  currentGuess: string;
  currentRow: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {Array.from({ length: MAX_GUESSES }, (_, rowIdx) => {
        if (rowIdx < submitted.length) {
          return (
            <div key={rowIdx} className="flex gap-1.5">
              {submitted[rowIdx].letters.map((cell, colIdx) => (
                <div key={colIdx} className={cellStyle(cell.state)}>
                  {cell.letter}
                </div>
              ))}
            </div>
          );
        }
        if (rowIdx === currentRow) {
          return (
            <div key={rowIdx} className="flex gap-1.5">
              {Array.from({ length: WORD_LENGTH }, (_, colIdx) => {
                const letter = currentGuess[colIdx] ?? "";
                return (
                  <div
                    key={colIdx}
                    className={`${cellStyle("empty")} ${letter ? "border-gray-500 dark:border-gray-400" : ""}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        }
        return (
          <div key={rowIdx} className="flex gap-1.5">
            {Array.from({ length: WORD_LENGTH }, (_, colIdx) => (
              <div key={colIdx} className={cellStyle("empty")} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default function WordleClient({
  userId,
  leaderboard,
}: {
  userId: string | null;
  leaderboard: LeaderboardEntry[];
}) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState<SubmittedRow[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Prevent duplicate saves for the same completed session
  const savedRef = useRef(false);

  async function saveResult(isWin: boolean, attemptsUsed: number) {
    if (!userId) return;
    try {
      await fetch("/api/games/wordle/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: ANSWER,
          won: isWin,
          attempts: attemptsUsed,
          maxAttempts: MAX_GUESSES,
        }),
      });
      router.refresh();
    } catch {
      // save failure is silent — game still works
    }
  }

  function resetGame() {
    setSubmitted([]);
    setCurrentGuess("");
    setError(null);
    setGameOver(false);
    setWon(false);
    savedRef.current = false;
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
    if (value.length <= WORD_LENGTH) {
      setCurrentGuess(value);
      setError(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (gameOver) return;

    if (currentGuess.length < WORD_LENGTH) {
      setError(`Word must be exactly ${WORD_LENGTH} letters.`);
      return;
    }

    const evaluated = evaluateGuess(currentGuess, ANSWER);
    const newSubmitted = [...submitted, { letters: evaluated }];
    setSubmitted(newSubmitted);
    setCurrentGuess("");

    const isWin = evaluated.every((l) => l.state === "correct");
    const isLoss = !isWin && newSubmitted.length >= MAX_GUESSES;

    if (isWin || isLoss) {
      setGameOver(true);
      if (isWin) setWon(true);
      // Save exactly once per completed session
      if (!savedRef.current) {
        savedRef.current = true;
        saveResult(isWin, newSubmitted.length);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-28">
      {/* Header */}
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center">
        <Link
          href="/home"
          className="text-sm text-msu-white/80 hover:text-msu-white mr-4"
        >
          ← Home
        </Link>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-msu-white italic">
          Beaver Wordle
        </h1>
      </header>

      <main className="max-w-lg mx-auto flex flex-col items-center gap-6 px-4 py-8">
        {/* Subtitle */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Guess the 5-letter word in 6 tries.
        </p>

        {/* Board */}
        <GameBoard
          submitted={submitted}
          currentGuess={currentGuess}
          currentRow={submitted.length}
        />

        {/* Input / End state */}
        {!gameOver ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-3 w-full max-w-xs"
          >
            <div className="flex gap-2 w-full">
              <input
                ref={inputRef}
                type="text"
                value={currentGuess}
                onChange={handleInput}
                maxLength={WORD_LENGTH}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="Type a word…"
                className="flex-1 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm uppercase tracking-widest bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-msu-red"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-msu-red text-white text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
              >
                Enter
              </button>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <p className="text-xs text-gray-400">
              Attempt {submitted.length + 1} of {MAX_GUESSES}
            </p>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            {won ? (
              <p className="text-base font-semibold text-green-600">
                You got it! Great job.
              </p>
            ) : (
              <>
                <p className="text-base font-semibold text-red-500">
                  Better luck next time.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  The word was{" "}
                  <span className="font-bold text-gray-700 dark:text-gray-200">
                    {ANSWER}
                  </span>
                  .
                </p>
              </>
            )}
            <button
              onClick={resetGame}
              className="mt-1 px-5 py-2 bg-msu-red text-white text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
            >
              Play Again
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-green-600 inline-block" /> Correct
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-yellow-500 inline-block" /> Wrong position
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-gray-500 inline-block" /> Not in word
          </span>
        </div>

        {/* Leaderboard */}
        <section className="w-full mt-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-base font-semibold mb-4 text-msu-red">Leaderboard</h2>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No results yet. Be the first to finish!
            </p>
          ) : (
            <ol className="space-y-2">
              {leaderboard.map((entry, i) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between text-sm gap-2"
                >
                  <span className="w-5 text-xs text-gray-400 font-medium shrink-0">
                    {i + 1}.
                  </span>
                  <span className="flex-1 truncate font-medium text-gray-800 dark:text-gray-100">
                    {entry.displayName}
                  </span>
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                      entry.won
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {entry.won ? "Win" : "Loss"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {entry.attempts}/{entry.maxAttempts}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {entry.createdAt}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
    </div>
  );
}
