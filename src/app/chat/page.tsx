import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import { computeDisplayName } from "@/lib/deriveNames";
import { MessageCircle, Users } from "lucide-react";
import NewChatButton from "./NewChatButton";

export default async function SocialPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const user = await requireAuth();
  const { tab, q } = await searchParams;
  const activeTab = tab === "people" ? "people" : "chat";
  const query = (q ?? "").trim();

  // Always fetch conversations
  const participations = await prisma.conversationParticipant.findMany({
    where: { userId: user.id },
    orderBy: { conversation: { updatedAt: "desc" } },
    select: {
      conversationId: true,
      conversation: {
        select: {
          id: true,
          updatedAt: true,
          participants: {
            where: { userId: { not: user.id } },
            select: {
              user: {
                select: { id: true, firstName: true, lastName: true, username: true, email: true },
              },
            },
            take: 1,
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { content: true, createdAt: true, senderId: true },
          },
        },
      },
    },
  });

  const conversations = participations.map((p) => {
    const other = p.conversation.participants[0]?.user;
    const latest = p.conversation.messages[0];
    return {
      id: p.conversation.id,
      updatedAt: p.conversation.updatedAt,
      other: other
        ? {
            name: computeDisplayName(other.firstName, other.lastName, other.email, other.username),
            username: other.username,
            initial: (other.firstName ?? other.email).charAt(0).toUpperCase(),
          }
        : null,
      latest: latest
        ? {
            content: latest.content,
            mine: latest.senderId === user.id,
            time: latest.createdAt,
          }
        : null,
    };
  });

  // People search (only when tab=people and a query is provided)
  const people =
    activeTab === "people" && query.length > 0
      ? await prisma.user.findMany({
          where: {
            AND: [
              { isActive: true, isBanned: false },
              { id: { not: user.id } },
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
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-msu-white">Social</h1>
        {activeTab === "chat" && <NewChatButton />}
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-lg mx-auto flex">
          <Link
            href="/chat"
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "chat"
                ? "border-msu-red text-msu-red"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <MessageCircle size={15} />
            Chat
          </Link>
          <Link
            href="/chat?tab=people"
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "people"
                ? "border-msu-red text-msu-red"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Users size={15} />
            People
          </Link>
        </div>
      </div>

      <main className="max-w-lg mx-auto sm:py-6">
        {/* ── Chat Tab ── */}
        {activeTab === "chat" && (
          <>
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-4">
                <MessageCircle size={44} className="text-gray-300 dark:text-gray-700" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet.</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Tap <span className="font-medium text-msu-red">New Chat</span> to start a conversation.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 border-y sm:border sm:rounded-lg border-gray-200 dark:border-gray-800">
                {conversations.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/chat/${c.id}`}
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="h-11 w-11 rounded-full bg-msu-red flex items-center justify-center text-msu-white font-bold text-base shrink-0">
                        {c.other?.initial ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {c.other?.name ?? "Unknown"}
                          </span>
                          {c.latest && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                              {new Date(c.latest.time).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                        {c.latest ? (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {c.latest.mine ? "You: " : ""}{c.latest.content}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 dark:text-gray-500 italic">No messages yet</p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* ── People Tab ── */}
        {activeTab === "people" && (
          <div className="p-4 sm:p-6 space-y-4">
            <form method="GET" action="/chat" className="flex gap-2">
              <input type="hidden" name="tab" value="people" />
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

            {query.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <Users size={44} className="text-gray-300 dark:text-gray-700" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Search for Beaver App users by name or username.</p>
              </div>
            ) : people.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                <Users size={44} className="text-gray-300 dark:text-gray-700" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No users found for &ldquo;{query}&rdquo;.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {people.map((u) => {
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
          </div>
        )}
      </main>
    </div>
  );
}
