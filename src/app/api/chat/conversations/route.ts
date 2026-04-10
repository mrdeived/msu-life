import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/chat/conversations — find or create a 1-to-1 conversation by target username
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { username?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const targetUsername = (body.username ?? "").trim().toLowerCase();
  if (!targetUsername) return Response.json({ error: "Username required" }, { status: 400 });

  // Find target user
  const target = await prisma.user.findFirst({
    where: { username: { equals: targetUsername, mode: "insensitive" } },
    select: { id: true, username: true },
  });

  if (!target) return Response.json({ error: "User not found" }, { status: 404 });
  if (target.id === session.uid) return Response.json({ error: "Cannot chat with yourself" }, { status: 400 });

  // Look for an existing 1-to-1 conversation between these two users
  const existing = await prisma.conversation.findFirst({
    where: {
      participants: { some: { userId: session.uid } },
      AND: { participants: { some: { userId: target.id } } },
    },
    select: { id: true },
  });

  if (existing) return Response.json({ id: existing.id });

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: session.uid }, { userId: target.id }],
      },
    },
    select: { id: true },
  });

  return Response.json({ id: conversation.id }, { status: 201 });
}
