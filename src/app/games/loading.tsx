export default function GamesHubLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center">
        <div className="w-14 h-4 bg-red-400/40 rounded" />
        <div className="absolute left-1/2 -translate-x-1/2 w-28 h-5 bg-red-400/40 rounded" />
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 animate-pulse">
        <div className="mb-5 flex flex-col gap-1">
          <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-48 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-4 bg-white dark:bg-gray-900"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-28 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-12 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
              <div className="w-48 h-3 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
