import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPusherServer } from "@/lib/pusher-server";

// POST /api/pusher/auth — authorize private Pusher channel subscriptions
export async function POST(req: NextRequest) {
  const pusher = getPusherServer();
  if (!pusher) return Response.json({ error: "Realtime not configured" }, { status: 503 });

  const session = await getSessionFromRequest(req);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id");
  const channelName = params.get("channel_name");

  if (!socketId || !channelName) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  // Only allow private-conversation-{conversationId} channels
  const match = channelName.match(/^private-conversation-(.+)$/);
  if (!match) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const conversationId = match[1];

  // Verify the user is a participant in this conversation
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: session.uid } },
    select: { id: true },
  });
  if (!participant) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const authResponse = pusher.authorizeChannel(socketId, channelName);
  return Response.json(authResponse);
}
