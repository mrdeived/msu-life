import Link from "next/link";
import { GAMES } from "@/lib/games";
import GameCard from "@/components/GameCard";

export default function GamesHubPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center">
        <Link
          href="/home"
          className="text-sm text-msu-white/80 hover:text-msu-white mr-4"
        >
          ← Home
        </Link>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-msu-white italic">
          Mini Games
        </h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-msu-red">Available Games</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Daily challenges and campus games
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {GAMES.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </main>
    </div>
  );
}
