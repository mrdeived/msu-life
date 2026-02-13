import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/requireAdmin";

export default async function AdminPage() {
  const { allowed } = await requireAdmin();

  if (allowed) {
    redirect("/my-created-events");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Home</Link>
        <h1 className="text-lg font-bold text-msu-white">Admin</h1>
      </header>
      <main className="max-w-lg mx-auto p-4 sm:p-6">
        <div className="text-center py-12 space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">Admin access required.</p>
          <Link href="/home" className="text-sm text-msu-red hover:underline">&larr; Back to Home</Link>
        </div>
      </main>
    </div>
  );
}
