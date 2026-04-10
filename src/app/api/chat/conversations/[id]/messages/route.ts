import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/chat/conversations/[id]/messages — send a message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: conversationId } = await params;

  // Verify sender is a participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: session.uid } },
    select: { id: true },
  });
  if (!participant) return Response.json({ error: "Forbidden" }, { status: 403 });

  let body: { content?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const content = (body.content ?? "").trim();
  if (!content) return Response.json({ error: "Content required" }, { status: 400 });
  if (content.length > 2000) return Response.json({ error: "Message too long" }, { status: 400 });

  const message = await prisma.message.create({
    data: { conversationId, senderId: session.uid, content },
    select: {
      id: true,
      content: true,
      createdAt: true,
      senderId: true,
      sender: { select: { firstName: true, lastName: true, username: true } },
    },
  });

  // Bump conversation updatedAt
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return Response.json({
    id: message.id,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    senderId: message.senderId,
    sender: message.sender,
  }, { status: 201 });
}
