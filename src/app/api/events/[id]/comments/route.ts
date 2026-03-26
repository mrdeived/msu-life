import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const MAX_COMMENT_LENGTH = 500;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const comments = await prisma.eventComment.findMany({
    where: { eventId: id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          username: true,
        },
      },
    },
  });

  return Response.json(comments);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await params;

  const event = await prisma.event.findFirst({
    where: { id: eventId, isPublished: true },
    select: { id: true },
  });
  if (!event) {
    return Response.json({ error: "Event not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const content =
    typeof (body as { content?: unknown }).content === "string"
      ? (body as { content: string }).content.trim()
      : "";

  if (!content) {
    return Response.json({ error: "Comment cannot be empty" }, { status: 422 });
  }
  if (content.length > MAX_COMMENT_LENGTH) {
    return Response.json(
      { error: `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer` },
      { status: 422 }
    );
  }

  const comment = await prisma.eventComment.create({
    data: { eventId, userId: session.uid, content },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          username: true,
        },
      },
    },
  });

  return Response.json(comment, { status: 201 });
}
