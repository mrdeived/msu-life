import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import { computeDisplayName } from "@/lib/deriveNames";
import { Users } from "lucide-react";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const viewer = await requireAuth();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const users = query.length > 0
    ? await prisma.user.findMany({
        where: {
          AND: [
            { isActive: true, isBanned: false },
            { id: { not: viewer.id } },
            {
              OR: [
                { username: { contains: query, mode: "insensitive" } },
                { firstName: { contains: query, mode: "insensitive" } },
                { lastName: { contains: query, mode: "insensitive" } },
              ],
            },
          ],
        },
        orderBy: { username: "asc" },
        take: 40,
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
          _count: { select: { followers: true } },
        },
      })
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Home</Link>
        <h1 className="text-lg font-bold text-msu-white">Find People</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 sm:p-6 space-y-4">
        {/* Search form */}
        <form method="GET" className="flex gap-2">
          <input
            name="q"
            type="search"
            defaultValue={query}
            autoFocus
            placeholder="Search by name or username…"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-msu-red text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium rounded-md bg-msu-red text-msu-white hover:bg-msu-red/90 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Results */}
        {query.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Users size={44} className="text-gray-300 dark:text-gray-700" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Search for Beaver App users by name or username.</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
            <Users size={44} className="text-gray-300 dark:text-gray-700" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No users found for &ldquo;{query}&rdquo;.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {users.map((u) => {
              const name = computeDisplayName(u.firstName, u.lastName, u.email, u.username);
              const initial = (u.firstName ?? u.email).charAt(0).toUpperCase();
              return (
                <li key={u.id}>
                  <Link
                    href={u.username ? `/users/${u.username}` : "#"}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-msu-red/40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-msu-red flex items-center justify-center text-msu-white font-bold text-base shrink-0">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{name}</p>
                      {u.username ? (
                        <p className="text-xs text-msu-red truncate">@{u.username}</p>
                      ) : (
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic">No username set</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{u._count.followers} followers</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
