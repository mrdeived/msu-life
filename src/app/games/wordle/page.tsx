import { optionalAuth } from "@/lib/optionalAuth";
import { prisma } from "@/lib/prisma";
import { getTodayStr, getDailyAnswer } from "./words";
import WordleClient, { type LeaderboardEntry } from "./WordleClient";

export default async function BeaverWordlePage() {
  const user = await optionalAuth();
  const todayStr = getTodayStr();
  const answer = getDailyAnswer(todayStr);

  // Check if the authenticated user already completed today's puzzle
  let todayResult: { won: boolean; attempts: number; maxAttempts: number } | null = null;
  if (user) {
    const record = await prisma.wordleResult.findFirst({
      where: { userId: user.id, puzzleDate: todayStr },
      select: { won: true, attempts: true, maxAttempts: true },
    });
    if (record) todayResult = record;
  }

  // Leaderboard: today's puzzle results only
  const raw = await prisma.wordleResult.findMany({
    where: { puzzleDate: todayStr },
    take: 10,
    orderBy: [
      { won: "desc" },      // wins first
      { attempts: "asc" },  // fewer attempts rank higher among wins
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
      leaderboard={leaderboard}
    />
  );
}
