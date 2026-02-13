import { requireAuth } from "@/lib/requireAuth";
import LogoutButton from "@/components/LogoutButton";

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-msu-white">Profile</h1>
        <LogoutButton />
      </header>

      <main className="max-w-lg mx-auto p-6 space-y-6">
        <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-msu-red flex items-center justify-center text-white text-xl font-bold">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{user.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
        </section>

        <div className="flex justify-center">
          <LogoutButton />
        </div>
      </main>
    </div>
  );
}
