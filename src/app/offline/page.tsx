"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center space-y-4 p-6">
        <h1 className="text-2xl font-bold text-msu-red">You&apos;re offline</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Check your connection and try again.
        </p>
        <button
          onClick={() => location.reload()}
          className="px-4 py-2 text-sm bg-msu-red text-msu-white rounded-md hover:bg-msu-red/85"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
