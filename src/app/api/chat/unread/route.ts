import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chat/unread — total unread message count across all conversations
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return Response.json({ total: 0 });

  // Only consider conversations where lastReadAt has been set (tracking has started)
  const participations = await prisma.conversationParticipant.findMany({
    where: { userId: session.uid, lastReadAt: { not: null } },
    select: { conversationId: true, lastReadAt: true },
  });

  if (participations.length === 0) return Response.json({ total: 0 });

  const counts = await Promise.all(
    participations.map((p) =>
      prisma.message.count({
        where: {
          conversationId: p.conversationId,
          senderId: { not: session.uid },
          createdAt: { gt: p.lastReadAt! },
        },
      })
    )
  );

  const total = Math.min(counts.reduce((sum, c) => sum + c, 0), 99);
  return Response.json({ total });
}
