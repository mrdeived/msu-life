import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/chat/conversations/join — join a GROUP conversation by conversationId
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

  // Verify the conversation exists and is a GROUP (not a private direct chat)
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, type: true },
  });

  if (!conversation) return Response.json({ error: "Conversation not found" }, { status: 404 });
  if (conversation.type !== "GROUP") return Response.json({ error: "Forbidden" }, { status: 403 });

  // Add as participant if not already — idempotent via upsert-style try/catch
  try {
    await prisma.conversationParticipant.create({
      data: { conversationId, userId: session.uid },
    });
  } catch {
    // Unique constraint violation = already a participant; that's fine
  }

  return Response.json({ conversationId });
}
