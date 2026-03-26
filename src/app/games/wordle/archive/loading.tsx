export default function WordleArchiveLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      {/* Header skeleton */}
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center">
        <div className="w-16 h-4 bg-red-400/40 rounded" />
        <div className="absolute left-1/2 -translate-x-1/2 w-32 h-5 bg-red-400/40 rounded" />
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 animate-pulse">
        {/* Page title */}
        <div className="mb-5 flex flex-col gap-1">
          <div className="w-28 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-48 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Archive list skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded shrink-0" />
              <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
