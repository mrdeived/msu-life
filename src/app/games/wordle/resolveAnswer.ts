import { prisma } from "@/lib/prisma";
import { getDailyAnswer } from "./words";

/**
 * Resolves the official answer for a given puzzle date.
 *
 * Resolution order:
 *   1. Admin-scheduled word for that date (if one exists in the DB)
 *   2. Deterministic fallback word from the built-in word list
 *
 * This is the single authoritative source used by the game page,
 * the result-save API, and server-side validation.
 */
export async function resolveOfficialAnswer(dateStr: string): Promise<string> {
  const scheduled = await prisma.wordleScheduledWord.findUnique({
    where: { puzzleDate: dateStr },
    select: { answer: true },
  });
  return scheduled?.answer ?? getDailyAnswer(dateStr);
}
