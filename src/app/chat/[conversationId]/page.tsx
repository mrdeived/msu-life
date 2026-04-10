import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import { computeDisplayName } from "@/lib/deriveNames";
import MessageThread from "./MessageInput";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const user = await requireAuth();
  const { conversationId } = await params;

  // Verify the current user is a participant
  const participation = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
    select: { id: true },
  });
  if (!participation) notFound();

  // Get the other participant
  const otherParticipant = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId: { not: user.id } },
    select: {
      user: { select: { firstName: true, lastName: true, username: true, email: true } },
    },
  });

  const otherUser = otherParticipant?.user;
  const otherName = otherUser
    ? computeDisplayName(otherUser.firstName, otherUser.lastName, otherUser.email, otherUser.username)
    : "Unknown";
  const otherInitial = (otherUser?.firstName ?? otherUser?.email ?? "?").charAt(0).toUpperCase();

  // Fetch messages
  const rawMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: 100,
    select: {
      id: true,
      content: true,
      createdAt: true,
      senderId: true,
      sender: { select: { firstName: true, lastName: true, username: true } },
    },
  });

  const messages = rawMessages.map((m) => ({
    id: m.id,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    senderId: m.senderId,
    sender: m.sender,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-3 shrink-0">
        <Link href="/chat" className="text-msu-white/80 text-sm hover:text-msu-white">&larr;</Link>
        <div className="h-8 w-8 rounded-full bg-msu-white/20 flex items-center justify-center text-msu-white font-bold text-sm shrink-0">
          {otherInitial}
        </div>
        <div>
          <p className="text-sm font-bold text-msu-white leading-tight">{otherName}</p>
          {otherUser?.username && (
            <p className="text-xs text-msu-white/70">@{otherUser.username}</p>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-lg w-full mx-auto flex flex-col overflow-hidden">
        <MessageThread
          conversationId={conversationId}
          currentUserId={user.id}
          initialMessages={messages}
        />
      </div>
    </div>
  );
}
