import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/chat/conversations/leave — remove the current user from a GROUP conversation
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { conversationId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const { conversationId } = body;
  if (!conversationId) return Response.json({ error: "conversationId required" }, { status: 400 });

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { type: true },
  });

  if (!conversation) return Response.json({ error: "Conversation not found" }, { status: 404 });
  if (conversation.type !== "GROUP") return Response.json({ error: "Cannot leave a direct chat" }, { status: 403 });

  // Remove the participant row — deleteMany is safe if the row doesn't exist
  await prisma.conversationParticipant.deleteMany({
    where: { conversationId, userId: session.uid },
  });

  return Response.json({ success: true });
}
