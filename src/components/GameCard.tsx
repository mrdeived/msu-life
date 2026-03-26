import Link from "next/link";
import type { GameMeta } from "@/lib/games";

export default function GameCard({ game }: { game: GameMeta }) {
  const badge = (
    <span
      className={`text-xs font-medium px-1.5 py-0.5 rounded shrink-0 ${
        game.available
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500"
      }`}
    >
      {game.label}
    </span>
  );

  if (!game.available) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-4 bg-white dark:bg-gray-900 opacity-55 cursor-default">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{game.name}</p>
            {badge}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">{game.description}</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={game.route}
      className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{game.name}</p>
          {badge}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{game.description}</p>
      </div>
      <span className="text-msu-red font-bold text-lg shrink-0">→</span>
    </Link>
  );
}
