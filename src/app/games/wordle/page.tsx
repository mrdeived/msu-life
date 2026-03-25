import { optionalAuth } from "@/lib/optionalAuth";
import { prisma } from "@/lib/prisma";
import WordleClient, { type LeaderboardEntry } from "./WordleClient";

export default async function BeaverWordlePage() {
  const user = await optionalAuth();

  const raw = await prisma.wordleResult.findMany({
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
    createdAt: r.createdAt.toLocaleDateString(),
  }));

  return <WordleClient userId={user?.id ?? null} leaderboard={leaderboard} />;
}
