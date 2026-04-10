import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import { computeDisplayName } from "@/lib/deriveNames";
import { MessageCircle } from "lucide-react";
import NewChatButton from "./NewChatButton";

export default async function ChatPage() {
  const user = await requireAuth();

  // Fetch user's conversations with other participant + latest message
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-msu-white">Chat</h1>
        <NewChatButton />
      </header>

      <main className="max-w-lg mx-auto sm:py-6">
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
                  {/* Avatar */}
                  <div className="h-11 w-11 rounded-full bg-msu-red flex items-center justify-center text-msu-white font-bold text-base shrink-0">
                    {c.other?.initial ?? "?"}
                  </div>

                  {/* Info */}
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
      </main>
    </div>
  );
}
