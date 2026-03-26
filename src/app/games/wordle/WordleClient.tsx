"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { evaluateGuess, type EvaluatedLetter, type LetterState } from "./evaluate";
import type { WordleStats } from "./stats";

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

// ── Keyboard layout ────────────────────────────────────────────────────────
const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

// ── Types ──────────────────────────────────────────────────────────────────
type CellState = "correct" | "present" | "absent" | "empty" | "active";

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

export interface HistoryEntry {
  puzzleDate: string;
  won: boolean;
  attempts: number;
  maxAttempts: number;
}

interface TodayResult {
  won: boolean;
  attempts: number;
  maxAttempts: number;
  guessPattern: string;
}

interface WordleClientProps {
  userId: string | null;
  todayStr: string;
  answer: string;
  todayResult: TodayResult | null;
  stats: WordleStats | null;
  history: HistoryEntry[];
  leaderboard: LeaderboardEntry[];
}

// ── Keyboard state derivation ──────────────────────────────────────────────
// Returns the strongest known state for each letter.
// Priority: correct (3) > present (2) > absent (1)
function deriveKeyboardState(submitted: SubmittedRow[]): Record<string, LetterState> {
  const priority: Record<LetterState, number> = { correct: 3, present: 2, absent: 1 };
  const result: Record<string, LetterState> = {};
  for (const row of submitted) {
    for (const cell of row.letters) {
      const existing = result[cell.letter];
      if (!existing || priority[cell.state] > priority[existing]) {
        result[cell.letter] = cell.state;
      }
    }
  }
  return result;
}

// ── Guess pattern helpers ──────────────────────────────────────────────────
// Compact encoding: one char per letter (C=correct, P=present, A=absent),
// rows separated by "|".  Example: "AAPAP|CCCCC"

function encodeGuessPattern(submitted: SubmittedRow[]): string {
  return submitted
    .map((row) =>
      row.letters
        .map((l) => (l.state === "correct" ? "C" : l.state === "present" ? "P" : "A"))
        .join("")
    )
    .join("|");
}

const PATTERN_EMOJI: Record<string, string> = { C: "🟩", P: "🟨", A: "⬛" };

function buildShareText(
  puzzleDate: string,
  won: boolean,
  attempts: number,
  maxAttempts: number,
  guessPattern: string
): string {
  const result = won ? `${attempts}/${maxAttempts}` : `X/${maxAttempts}`;
  const rows = guessPattern
    .split("|")
    .filter(Boolean)
    .map((row) => row.split("").map((c) => PATTERN_EMOJI[c] ?? "⬛").join(""));
  return [`Beaver Wordle ${puzzleDate}`, result, "", ...rows].join("\n");
}

// ── Countdown helpers ──────────────────────────────────────────────────────

function getMsUntilNextPuzzle(): number {
  const now = new Date();
  const nextMidnightUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  );
  return Math.max(0, nextMidnightUTC - Date.now());
}

function NextPuzzleCountdown() {
  const [ms, setMs] = useState(getMsUntilNextPuzzle);

  useEffect(() => {
    const id = setInterval(() => setMs(getMsUntilNextPuzzle()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  const fmt = (n: number) => String(n).padStart(2, "0");

  return (
    <p className="text-xs text-gray-500 dark:text-gray-400">
      Next puzzle in{" "}
      <span className="font-mono font-semibold text-gray-700 dark:text-gray-200">
        {fmt(h)}:{fmt(m)}:{fmt(s)}
      </span>
    </p>
  );
}

// ── Share button ───────────────────────────────────────────────────────────

function ShareButton({ shareText }: { shareText: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (status === "idle") return;
    const t = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(t);
  }, [status]);

  function handleCopy() {
    navigator.clipboard
      .writeText(shareText)
      .then(() => setStatus("copied"))
      .catch(() => setStatus("failed"));
  }

  return (
    <button
      onClick={handleCopy}
      className={`px-4 py-1.5 rounded-md text-sm font-medium border transition-colors ${
        status === "copied"
          ? "bg-green-600 border-green-600 text-white"
          : status === "failed"
          ? "bg-red-500 border-red-500 text-white"
          : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-msu-red hover:text-msu-red"
      }`}
    >
      {status === "copied" ? "Copied!" : status === "failed" ? "Copy failed" : "Copy Result"}
    </button>
  );
}

// ── Cell styling ───────────────────────────────────────────────────────────
function cellStyle(state: CellState, hasLetter = false): string {
  const base =
    "w-12 h-12 flex items-center justify-center text-lg font-bold border-2 rounded uppercase select-none transition-colors duration-150";
  switch (state) {
    case "correct":
      return `${base} bg-green-600 border-green-600 text-white`;
    case "present":
      return `${base} bg-yellow-500 border-yellow-500 text-white`;
    case "absent":
      return `${base} bg-gray-500 border-gray-500 text-white`;
    case "active":
      return `${base} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
        hasLetter
          ? "border-gray-600 dark:border-gray-300 ring-1 ring-gray-400 dark:ring-gray-400"
          : "border-gray-400 dark:border-gray-500"
      }`;
    case "empty":
    default:
      return `${base} bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100`;
  }
}

// ── Key styling ────────────────────────────────────────────────────────────
function keyStyle(state: LetterState | undefined, isWide: boolean): string {
  const base = `flex items-center justify-center rounded font-bold text-xs sm:text-sm transition-colors duration-150 select-none cursor-pointer h-14 ${
    isWide ? "px-2 sm:px-3 min-w-[3rem] sm:min-w-[3.5rem]" : "flex-1 min-w-0"
  }`;
  switch (state) {
    case "correct":
      return `${base} bg-green-600 text-white`;
    case "present":
      return `${base} bg-yellow-500 text-white`;
    case "absent":
      return `${base} bg-gray-500 dark:bg-gray-600 text-white`;
    default:
      return `${base} bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 active:opacity-70`;
  }
}

// ── GameBoard ─────────────────────────────────────────────────────────────
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
          // Submitted row — show evaluation colors
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
          // Active row — show current input with stronger border
          return (
            <div key={rowIdx} className="flex gap-1.5">
              {Array.from({ length: WORD_LENGTH }, (_, colIdx) => {
                const letter = currentGuess[colIdx] ?? "";
                return (
                  <div key={colIdx} className={cellStyle("active", !!letter)}>
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        }

        // Future empty row
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

// ── OnScreenKeyboard ──────────────────────────────────────────────────────
function OnScreenKeyboard({
  keyStates,
  onKey,
  disabled,
}: {
  keyStates: Record<string, LetterState>;
  onKey: (key: string) => void;
  disabled: boolean;
}) {
  return (
    <div
      className={`w-full max-w-sm flex flex-col gap-1 px-0.5 ${
        disabled ? "pointer-events-none opacity-40" : ""
      }`}
    >
      {KEYBOARD_ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex justify-center gap-1">
          {/* Spacer to centre row 2 (ASDFGHJKL) */}
          {rowIdx === 1 && <div className="flex-[0.5]" />}
          {row.map((key) => {
            const isWide = key === "ENTER" || key === "⌫";
            return (
              <button
                key={key}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault(); // prevent focus shift
                  onKey(key);
                }}
                className={keyStyle(isWide ? undefined : keyStates[key], isWide)}
                aria-label={key === "⌫" ? "Backspace" : key}
              >
                {key}
              </button>
            );
          })}
          {rowIdx === 1 && <div className="flex-[0.5]" />}
        </div>
      ))}
    </div>
  );
}

// ── PersonalStats ─────────────────────────────────────────────────────────
function PersonalStats({ stats }: { stats: WordleStats }) {
  return (
    <section className="w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
      <h2 className="text-base font-semibold mb-4 text-msu-red">Your Stats</h2>

      <div className="flex justify-around mb-4">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {stats.currentStreak}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight">
            Current<br />Streak
          </span>
        </div>
        <div className="w-px bg-gray-200 dark:bg-gray-700" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {stats.bestStreak}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight">
            Best<br />Streak
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: "Played", value: stats.totalGames },
          { label: "Wins", value: stats.totalWins },
          { label: "Losses", value: stats.totalLosses },
          { label: "Win %", value: `${stats.winRate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <span className="text-lg font-bold text-gray-800 dark:text-gray-100">{value}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      {stats.avgAttemptsOnWin !== null && (
        <p className="mt-3 text-xs text-gray-400 text-center">
          Avg attempts on wins:{" "}
          <span className="font-medium text-gray-600 dark:text-gray-300">
            {stats.avgAttemptsOnWin}
          </span>
        </p>
      )}
    </section>
  );
}

// ── PersonalHistory ───────────────────────────────────────────────────────
function PersonalHistory({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <section className="w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
      <h2 className="text-base font-semibold mb-1 text-msu-red">Your History</h2>
      <p className="text-xs text-gray-400 mb-4">Last {entries.length} puzzle{entries.length !== 1 ? "s" : ""}</p>
      <ol className="space-y-2">
        {entries.map((entry) => (
          <li key={entry.puzzleDate} className="flex items-center justify-between text-sm gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono shrink-0">
              {entry.puzzleDate}
            </span>
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                entry.won
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {entry.won ? "Win" : "Loss"}
            </span>
            <span className="flex-1 text-right text-xs text-gray-500 dark:text-gray-400">
              {entry.won
                ? `${entry.attempts}/${entry.maxAttempts} attempts`
                : "Not solved"}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ── Leaderboard ───────────────────────────────────────────────────────────
function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <section className="w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
      <h2 className="text-base font-semibold mb-1 text-msu-red">Today&apos;s Leaderboard</h2>
      <p className="text-xs text-gray-400 mb-4">Results for today&apos;s puzzle only</p>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No results yet. Be the first to finish!
        </p>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry, i) => (
            <li key={entry.id} className="flex items-center justify-between text-sm gap-2">
              <span className="w-5 text-xs text-gray-400 font-medium shrink-0">{i + 1}.</span>
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
              <span className="text-xs text-gray-400 whitespace-nowrap">{entry.createdAt}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function WordleClient({
  userId,
  todayStr,
  answer,
  todayResult,
  stats,
  history,
  leaderboard,
}: WordleClientProps) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState<SubmittedRow[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const savedRef = useRef(false);

  // Stable refs used by the physical keyboard listener (no stale closure risk)
  const submitGuessRef = useRef<() => void>(() => {});
  const gameActiveRef = useRef(false);

  const showAlreadyCompleted =
    todayResult !== null && submitted.length === 0 && !gameOver;

  // Keep refs in sync after each render (not during render)
  useEffect(() => {
    gameActiveRef.current = !gameOver && !showAlreadyCompleted;
  });

  // Derive keyboard state from submitted guesses
  const keyStates = deriveKeyboardState(submitted);

  // ── Auto-dismiss validation messages ──────────────────────────────────
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 1800);
    return () => clearTimeout(t);
  }, [message]);

  // ── Physical keyboard input ────────────────────────────────────────────
  // Registered once with empty deps; uses refs to read latest state safely.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!gameActiveRef.current) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Ignore if focused on an input element
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      )
        return;

      if (e.key === "Enter") {
        e.preventDefault();
        submitGuessRef.current();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setCurrentGuess((prev) => prev.slice(0, -1));
        setMessage(null);
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        setCurrentGuess((prev) =>
          prev.length < WORD_LENGTH ? prev + e.key.toUpperCase() : prev
        );
        setMessage(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []); // stable listener — reads state through refs

  // ── On-screen key handler ──────────────────────────────────────────────
  function handleOnScreenKey(key: string) {
    if (!gameActiveRef.current) return;
    if (key === "ENTER") {
      submitGuessRef.current();
    } else if (key === "⌫") {
      setCurrentGuess((prev) => prev.slice(0, -1));
      setMessage(null);
    } else {
      setCurrentGuess((prev) =>
        prev.length < WORD_LENGTH ? prev + key : prev
      );
      setMessage(null);
    }
  }

  // ── Persist result ─────────────────────────────────────────────────────
  async function saveResult(isWin: boolean, attemptsUsed: number, guessPattern: string) {
    if (!userId) return;
    try {
      await fetch("/api/games/wordle/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          puzzleDate: todayStr,
          answer,
          won: isWin,
          attempts: attemptsUsed,
          maxAttempts: MAX_GUESSES,
          guessPattern,
        }),
      });
      router.refresh();
    } catch {
      // silent — game continues regardless
    }
  }

  // ── Submit guess ───────────────────────────────────────────────────────
  function submitGuess() {
    if (gameOver) return;

    if (currentGuess.length < WORD_LENGTH) {
      setMessage(`Word must be exactly ${WORD_LENGTH} letters.`);
      return;
    }

    const evaluated = evaluateGuess(currentGuess, answer);
    const newSubmitted = [...submitted, { letters: evaluated }];
    setSubmitted(newSubmitted);
    setCurrentGuess("");
    setMessage(null);

    const isWin = evaluated.every((l) => l.state === "correct");
    const isLoss = !isWin && newSubmitted.length >= MAX_GUESSES;

    if (isWin || isLoss) {
      setGameOver(true);
      if (isWin) setWon(true);
      if (!savedRef.current) {
        savedRef.current = true;
        saveResult(isWin, newSubmitted.length, encodeGuessPattern(newSubmitted));
      }
    }
  }

  // Keep submitGuessRef current so the stable keydown listener always calls
  // the latest version of submitGuess without needing to re-register.
  useEffect(() => {
    submitGuessRef.current = submitGuess;
  });

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-28">
      {/* Header */}
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center">
        <Link href="/home" className="text-sm text-msu-white/80 hover:text-msu-white mr-4">
          ← Home
        </Link>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-msu-white italic">
          Beaver Wordle
        </h1>
      </header>

      <main className="max-w-lg mx-auto flex flex-col items-center gap-5 px-4 py-6">
        {/* Daily label */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-semibold text-msu-red uppercase tracking-widest">
            Daily Puzzle
          </span>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {todayStr} · 5 letters · 6 tries
          </p>
        </div>

        {showAlreadyCompleted ? (
          /* ── Already completed today ─────────────────────────────── */
          <div className="w-full flex flex-col gap-4">
            <div className="w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 text-center">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Today&apos;s puzzle — completed
              </p>
              {todayResult.won ? (
                <>
                  <p className="text-xl font-bold text-green-600">Solved!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {todayResult.attempts} of {todayResult.maxAttempts} attempts
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold text-red-500">Not this time.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    The word was{" "}
                    <span className="font-bold text-gray-700 dark:text-gray-200 uppercase">
                      {answer}
                    </span>
                  </p>
                </>
              )}
              <div className="mt-4 flex flex-col items-center gap-2">
                <NextPuzzleCountdown />
                {todayResult.guessPattern && (
                  <ShareButton
                    shareText={buildShareText(
                      todayStr,
                      todayResult.won,
                      todayResult.attempts,
                      todayResult.maxAttempts,
                      todayResult.guessPattern
                    )}
                  />
                )}
              </div>
            </div>
            {stats && <PersonalStats stats={stats} />}
            <Leaderboard entries={leaderboard} />
            <PersonalHistory entries={history} />
          </div>
        ) : (
          /* ── Active game ─────────────────────────────────────────── */
          <>
            <GameBoard
              submitted={submitted}
              currentGuess={currentGuess}
              currentRow={submitted.length}
            />

            {/* Inline validation / end-state message */}
            <div className="h-7 flex items-center justify-center">
              {message && !gameOver && (
                <p className="text-sm font-medium text-white bg-gray-800 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {message}
                </p>
              )}
              {gameOver && (
                <div className="text-center">
                  {won ? (
                    <p className="text-base font-bold text-green-600">
                      Solved in {submitted.length}!
                    </p>
                  ) : (
                    <p className="text-base font-bold text-red-500">
                      The word was{" "}
                      <span className="uppercase text-gray-700 dark:text-gray-200">{answer}</span>
                    </p>
                  )}
                </div>
              )}
              {!gameOver && !message && (
                <p className="text-xs text-gray-400">
                  Attempt {submitted.length + 1} of {MAX_GUESSES}
                </p>
              )}
            </div>

            {/* On-screen keyboard */}
            <OnScreenKeyboard
              keyStates={keyStates}
              onKey={handleOnScreenKey}
              disabled={gameOver}
            />

            {/* Post-game: countdown + share */}
            {gameOver && (
              <div className="flex flex-col items-center gap-2 -mt-1">
                <NextPuzzleCountdown />
                <ShareButton
                  shareText={buildShareText(
                    todayStr,
                    won,
                    submitted.length,
                    MAX_GUESSES,
                    encodeGuessPattern(submitted)
                  )}
                />
                {!userId && (
                  <p className="text-xs text-gray-400 text-center">
                    <Link href="/login" className="underline hover:text-msu-red">
                      Log in
                    </Link>{" "}
                    to save your result and appear on the leaderboard.
                  </p>
                )}
              </div>
            )}

            {/* Color legend */}
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

            {stats && <PersonalStats stats={stats} />}
            <Leaderboard entries={leaderboard} />
            <PersonalHistory entries={history} />
          </>
        )}
      </main>
    </div>
  );
}
