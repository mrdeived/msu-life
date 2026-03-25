export interface WordleStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;           // 0–100 integer
  currentStreak: number;
  bestStreak: number;
  avgAttemptsOnWin: number | null; // 1-decimal, null when no wins
}

interface ResultInput {
  puzzleDate: string; // YYYY-MM-DD
  won: boolean;
  attempts: number;
}

const DAY_MS = 86_400_000;

function dateMs(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getTime();
}

/**
 * Computes personal Beaver Wordle stats from the user's full result history.
 *
 * @param results  All saved WordleResult records for the user (any order)
 * @param todayStr UTC date string "YYYY-MM-DD" used to determine if the streak is still alive
 */
export function computeStats(results: ResultInput[], todayStr: string): WordleStats {
  if (results.length === 0) {
    return {
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      winRate: 0,
      currentStreak: 0,
      bestStreak: 0,
      avgAttemptsOnWin: null,
    };
  }

  const totalGames = results.length;
  const wins = results.filter((r) => r.won);
  const totalWins = wins.length;
  const totalLosses = totalGames - totalWins;
  const winRate = Math.round((totalWins / totalGames) * 100);
  const avgAttemptsOnWin =
    totalWins > 0
      ? Math.round((wins.reduce((s, r) => s + r.attempts, 0) / totalWins) * 10) / 10
      : null;

  // Unique completed dates, sorted ascending
  const dates = [...new Set(results.map((r) => r.puzzleDate))].sort();

  // ── Best streak ────────────────────────────────────────────────────────────
  // Walk forward through sorted dates, track longest consecutive run.
  let bestStreak = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = Math.round((dateMs(dates[i]) - dateMs(dates[i - 1])) / DAY_MS);
    if (diff === 1) {
      run++;
      if (run > bestStreak) bestStreak = run;
    } else {
      run = 1;
    }
  }

  // ── Current streak ─────────────────────────────────────────────────────────
  // The streak is "alive" only if the most recently completed day is today or
  // yesterday (the user hasn't missed a day yet).  Otherwise it is 0.
  const todayMs = dateMs(todayStr);
  const yesterdayMs = todayMs - DAY_MS;
  const mostRecentMs = dateMs(dates[dates.length - 1]);

  let currentStreak = 0;
  if (mostRecentMs >= yesterdayMs) {
    // Streak is still alive — count consecutive days backwards from the last
    const rev = [...dates].reverse();
    currentStreak = 1;
    for (let i = 1; i < rev.length; i++) {
      const diff = Math.round((dateMs(rev[i - 1]) - dateMs(rev[i])) / DAY_MS);
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return {
    totalGames,
    totalWins,
    totalLosses,
    winRate,
    currentStreak,
    bestStreak,
    avgAttemptsOnWin,
  };
}
