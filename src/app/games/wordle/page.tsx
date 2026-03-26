import { optionalAuth } from "@/lib/optionalAuth";
import { prisma } from "@/lib/prisma";
import { getTodayStr, getDailyAnswer } from "./words";
import { computeStats, type WordleStats } from "./stats";
import WordleClient, { type LeaderboardEntry, type HistoryEntry } from "./WordleClient";

export default async function BeaverWordlePage() {
  const user = await optionalAuth();
  const todayStr = getTodayStr();
  const answer = getDailyAnswer(todayStr);

  // Check if the authenticated user already completed today's puzzle
  let todayResult: { won: boolean; attempts: number; maxAttempts: number; guessPattern: string } | null = null;
  let stats: WordleStats | null = null;
  let history: HistoryEntry[] = [];

  if (user) {
    // Fetch all of the user's results in one query (reused for today-check, stats, and history)
    const allResults = await prisma.wordleResult.findMany({
      where: { userId: user.id },
      select: { puzzleDate: true, won: true, attempts: true, maxAttempts: true, guessPattern: true },
      orderBy: { puzzleDate: "asc" },
    });

    const todayRecord = allResults.find((r) => r.puzzleDate === todayStr);
    if (todayRecord) {
      todayResult = {
        won: todayRecord.won,
        attempts: todayRecord.attempts,
        maxAttempts: todayRecord.maxAttempts,
        guessPattern: todayRecord.guessPattern,
      };
    }

    stats = computeStats(allResults, todayStr);

    // History: most recent first, capped at 30
    history = allResults
      .slice()
      .reverse()
      .slice(0, 30)
      .map((r) => ({
        puzzleDate: r.puzzleDate,
        won: r.won,
        attempts: r.attempts,
        maxAttempts: r.maxAttempts,
      }));
  }

  // Leaderboard: today's puzzle results only
  const raw = await prisma.wordleResult.findMany({
    where: { puzzleDate: todayStr },
    take: 10,
    orderBy: [
      { won: "desc" },       // wins first
      { attempts: "asc" },   // fewer attempts rank higher among wins
      { createdAt: "desc" }, // most recent as tie-breaker
    ],
    include: {
      user: { select: { username: true, email: true } },
    },
  });

  const leaderboard: LeaderboardEntry[] = raw.map((r) => ({
    id: r.id,
    displayName: r.user.username
      ? `@${r.user.username}`
      : r.user.email.split("@")[0],
    won: r.won,
    attempts: r.attempts,
    maxAttempts: r.maxAttempts,
    createdAt: r.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }));

  return (
    <WordleClient
      userId={user?.id ?? null}
      todayStr={todayStr}
      answer={answer}
      todayResult={todayResult}
      stats={stats}
      history={history}
      leaderboard={leaderboard}
    />
  );
}
