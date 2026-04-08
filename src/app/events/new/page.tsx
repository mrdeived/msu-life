import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import CreateEventForm from "./CreateEventForm";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default async function CreateEventPage() {
  const user = await requireAuth();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, isAdmin: true, isActive: true, isBanned: true },
  });

  const isAdminAllowed =
    dbUser && dbUser.isActive && !dbUser.isBanned &&
    (dbUser.isAdmin || ADMIN_EMAILS.includes(dbUser.email.toLowerCase()));

  if (!isAdminAllowed) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
          <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Home</Link>
          <h1 className="text-lg font-bold text-msu-white">Create Event</h1>
        </header>
        <main className="max-w-lg mx-auto p-4 sm:p-6">
          <div className="text-center py-12 space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Only admins can create events.</p>
            <Link href="/home" className="text-sm text-msu-red hover:underline">&larr; Back to Home</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Home</Link>
        <h1 className="text-lg font-bold text-msu-white">Create Event</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 sm:p-6">
        <CreateEventForm />
      </main>
    </div>
  );
}
