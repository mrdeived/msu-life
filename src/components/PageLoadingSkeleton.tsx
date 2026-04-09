interface Props {
  headerTitle?: string;
  backHref?: string;
  backLabel?: string;
  rows?: number;
  variant?: "cards" | "form" | "detail";
}

export default function PageLoadingSkeleton({
  headerTitle = "",
  backLabel = "Home",
  rows = 3,
  variant = "cards",
}: Props) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <span className="text-msu-white/80 text-sm">&larr; {backLabel}</span>
        {headerTitle && <span className="text-lg font-bold text-msu-white">{headerTitle}</span>}
      </header>

      <main className="max-w-lg mx-auto sm:py-6 space-y-4 sm:space-y-6 p-4 sm:p-0">
        {variant === "cards" && Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 border-y sm:border sm:rounded-lg border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="skeleton h-28 sm:h-40 w-full" />
            <div className="px-4 py-3 space-y-2">
              <div className="skeleton h-3 w-2/3 rounded" />
              <div className="skeleton h-3 w-1/3 rounded" />
            </div>
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex gap-4">
              <div className="skeleton h-7 w-16 rounded-md" />
              <div className="skeleton h-7 w-16 rounded-md" />
              <div className="skeleton h-7 w-16 rounded-md" />
            </div>
          </div>
        ))}

        {variant === "detail" && (
          <div className="bg-white dark:bg-gray-900 sm:rounded-lg border-y sm:border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="skeleton h-36 sm:h-52 w-full" />
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex gap-4">
              <div className="skeleton h-3 w-24 rounded" />
              <div className="skeleton h-3 w-20 rounded" />
            </div>
            <div className="px-5 py-4 flex gap-3 border-b border-gray-100 dark:border-gray-800">
              <div className="skeleton h-8 w-20 rounded-md" />
              <div className="skeleton h-8 w-20 rounded-md" />
              <div className="skeleton h-8 w-20 rounded-md" />
            </div>
            <div className="px-5 py-4 space-y-2 border-b border-gray-100 dark:border-gray-800">
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-5/6 rounded" />
              <div className="skeleton h-3 w-4/6 rounded" />
            </div>
          </div>
        )}

        {variant === "form" && (
          <div className="bg-white dark:bg-gray-900 sm:rounded-lg border-y sm:border border-gray-200 dark:border-gray-800 p-5 sm:p-6 space-y-4">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="skeleton h-3 w-20 rounded" />
                <div className="skeleton h-9 w-full rounded-md" />
              </div>
            ))}
            <div className="skeleton h-9 w-28 rounded-md mt-2" />
          </div>
        )}
      </main>
    </div>
  );
}
