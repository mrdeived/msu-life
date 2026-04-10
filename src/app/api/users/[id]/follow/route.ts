import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/users/[id]/follow
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: followingId } = await params;

  if (followingId === session.uid) {
    return Response.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  // Verify target user exists and is active
  const target = await prisma.user.findUnique({
    where: { id: followingId },
    select: { id: true, isActive: true, isBanned: true },
  });
  if (!target || !target.isActive || target.isBanned) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  try {
    await prisma.follow.create({
      data: { followerId: session.uid, followingId },
    });
    return Response.json({ following: true });
  } catch {
    // Unique constraint violation = already following
    return Response.json({ following: true });
  }
}

// DELETE /api/users/[id]/follow
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: followingId } = await params;

  await prisma.follow.deleteMany({
    where: { followerId: session.uid, followingId },
  });

  return Response.json({ following: false });
}
