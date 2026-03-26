export default function WordleHistoryDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      {/* Header skeleton */}
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center">
        <div className="w-16 h-4 bg-red-400/40 rounded" />
        <div className="absolute left-1/2 -translate-x-1/2 w-32 h-5 bg-red-400/40 rounded" />
      </header>

      <main className="max-w-lg mx-auto flex flex-col items-center gap-5 px-4 py-6 animate-pulse">
        {/* Label + date */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Outcome card skeleton */}
        <div className="w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 flex flex-col items-center gap-2">
          <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-36 h-3 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>

        {/* Board skeleton */}
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 6 }, (_, r) => (
            <div key={r} className="flex gap-1.5">
              {Array.from({ length: 5 }, (_, c) => (
                <div
                  key={c}
                  className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-700"
                />
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
