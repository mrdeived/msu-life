/**
 * Curated 5-letter word list for Beaver Wordle daily puzzles.
 * Add more words here to extend the rotation.
 */
export const DAILY_WORDS: string[] = [
  "BEARS", "PLANT", "CRANE", "FLASK", "GLOBE",
  "STACK", "BLAZE", "GRIND", "FLUTE", "BRAVE",
  "CHEST", "BRICK", "CRIMP", "DRAPE", "EARTH",
  "FLAME", "GRAFT", "HORSE", "INDEX", "KNACK",
  "LEAPT", "MONTH", "NURSE", "OLIVE", "PRIDE",
  "QUEST", "RAISE", "SHIRT", "TOAST", "ULTRA",
  "VIVID", "WHEAT", "YOUTH", "ZONES", "ABBEY",
];

// Fixed UTC epoch used for day-index calculation.
const EPOCH_MS = Date.UTC(2026, 0, 1); // 2026-01-01 00:00:00 UTC

/**
 * Returns the UTC calendar date string for "today" in YYYY-MM-DD format.
 * Using UTC ensures every user resolves the same puzzle day regardless of timezone.
 */
export function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Deterministically maps a YYYY-MM-DD date string to a word from DAILY_WORDS.
 * The same date always returns the same word; different dates return different words.
 */
export function getDailyAnswer(dateStr: string): string {
  const dateMs = new Date(`${dateStr}T00:00:00Z`).getTime();
  const dayIndex = Math.floor((dateMs - EPOCH_MS) / 86_400_000);
  const idx = ((dayIndex % DAILY_WORDS.length) + DAILY_WORDS.length) % DAILY_WORDS.length;
  return DAILY_WORDS[idx];
}
