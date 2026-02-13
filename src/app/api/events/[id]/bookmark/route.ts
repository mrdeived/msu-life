import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

async function getAuthUser(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { id: true, isActive: true, isBanned: true },
  });
  if (!user || !user.isActive || user.isBanned) return null;
  return user;
}

async function getPublishedEvent(id: string) {
  return prisma.event.findFirst({ where: { id, isPublished: true }, select: { id: true } });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const event = await getPublishedEvent(id);
  if (!event) return Response.json({ error: "Event not found" }, { status: 404 });

  await prisma.eventBookmark.upsert({
    where: { userId_eventId: { userId: user.id, eventId: id } },
    create: { userId: user.id, eventId: id },
    update: {},
  });

  return Response.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;

  await prisma.eventBookmark.deleteMany({
    where: { userId: user.id, eventId: id },
  });

  return Response.json({ ok: true });
}
