import { requireAuth } from "@/lib/requireAuth";
import { mockEvents, mockAnnouncements } from "@/lib/mockData";
import LogoutButton from "@/components/LogoutButton";

export default async function HomePage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-green-700 dark:text-green-400">MSU Life</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">{user.email}</span>
          <LogoutButton />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-base font-semibold mb-4">Upcoming</h2>
            <ul className="space-y-3">
              {mockEvents.map((e) => (
                <li key={e.id} className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{e.location}</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{e.date}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Announcements */}
          <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-base font-semibold mb-4">Announcements</h2>
            <ul className="space-y-3">
              {mockAnnouncements.map((a) => (
                <li key={a.id}>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{a.body}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Quick Actions */}
        <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-base font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            {["Create Event", "Browse Events", "My Profile"].map((label) => (
              <button
                key={label}
                disabled
                className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              >
                {label}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
