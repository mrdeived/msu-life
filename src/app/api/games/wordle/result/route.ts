import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { evaluateGuess, type EvaluatedLetter } from "@/app/games/wordle/evaluate";
import { getTodayStr, getDailyAnswer } from "@/app/games/wordle/words";

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

function encodeGuessPattern(evaluations: EvaluatedLetter[][]): string {
  return evaluations
    .map((row) =>
      row.map((l) => (l.state === "correct" ? "C" : l.state === "present" ? "P" : "A")).join("")
    )
    .join("|");
}

export async function POST(request: Request) {
  // ── Auth ────────────────────────────────────────────────────────────────
  const session = getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { id: true, isActive: true, isBanned: true },
  });
  if (!user || !user.isActive || user.isBanned) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  // ── Parse body ───────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { puzzleDate, guesses: rawGuesses } = body;

  // ── Validate puzzleDate ──────────────────────────────────────────────────
  if (typeof puzzleDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(puzzleDate)) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Server is the authoritative source of today's date
  if (puzzleDate !== getTodayStr()) {
    return Response.json({ error: "Invalid puzzle date" }, { status: 400 });
  }

  // ── Validate guesses string ──────────────────────────────────────────────
  if (typeof rawGuesses !== "string" || !rawGuesses.trim()) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const guessWords = rawGuesses.split("|").filter(Boolean);

  if (guessWords.length < 1 || guessWords.length > MAX_GUESSES) {
    return Response.json({ error: "Invalid guess count" }, { status: 400 });
  }

  // Normalize to uppercase and validate each guess shape
  const normalized: string[] = [];
  for (const word of guessWords) {
    const upper = word.toUpperCase();
    if (upper.length !== WORD_LENGTH || !/^[A-Z]+$/.test(upper)) {
      return Response.json({ error: "Invalid guess format" }, { status: 400 });
    }
    normalized.push(upper);
  }

  // ── Server-side game evaluation ──────────────────────────────────────────
  const answer = getDailyAnswer(puzzleDate);
  const evaluations = normalized.map((g) => evaluateGuess(g, answer));

  const lastRow = evaluations[evaluations.length - 1];
  const isWin = lastRow.every((l) => l.state === "correct");
  const isLoss = !isWin && normalized.length === MAX_GUESSES;

  // Reject if the game is not in a valid terminal state
  if (!isWin && !isLoss) {
    return Response.json({ error: "Game is not in a terminal state" }, { status: 400 });
  }

  // ── Compute persisted fields from server-validated data ──────────────────
  const won = isWin;
  const attempts = normalized.length;
  const guessPattern = encodeGuessPattern(evaluations);
  const guesses = normalized.join("|");

  // ── One result per user per day ──────────────────────────────────────────
  const existing = await prisma.wordleResult.findFirst({
    where: { userId: user.id, puzzleDate },
  });
  if (existing) {
    return Response.json({ ok: true, alreadyExists: true });
  }

  const result = await prisma.wordleResult.create({
    data: {
      userId: user.id,
      puzzleDate,
      answer,
      won,
      attempts,
      maxAttempts: MAX_GUESSES,
      guessPattern,
      guesses,
    },
  });

  return Response.json({ ok: true, id: result.id });
}
