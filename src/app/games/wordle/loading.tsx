export default function WordleLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-28">
      {/* Header skeleton */}
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center">
        <div className="w-14 h-4 bg-red-400/40 rounded" />
        <div className="absolute left-1/2 -translate-x-1/2 w-32 h-5 bg-red-400/40 rounded" />
      </header>

      <main className="max-w-lg mx-auto flex flex-col items-center gap-5 px-4 py-6 animate-pulse">
        {/* Date label */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-40 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Board skeleton — 6 rows × 5 tiles */}
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 6 }, (_, r) => (
            <div key={r} className="flex gap-1.5">
              {Array.from({ length: 5 }, (_, c) => (
                <div
                  key={c}
                  className="w-12 h-12 rounded border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                />
              ))}
            </div>
          ))}
        </div>

        {/* Keyboard skeleton */}
        <div className="w-full max-w-sm flex flex-col gap-1 px-0.5">
          {[10, 9, 9].map((count, row) => (
            <div key={row} className="flex justify-center gap-1">
              {Array.from({ length: count }, (_, i) => (
                <div
                  key={i}
                  className="h-14 flex-1 min-w-0 rounded bg-gray-200 dark:bg-gray-700"
                />
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
