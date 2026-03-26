import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const MAX_COMMENT_LENGTH = 500;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const comments = await prisma.comment.findMany({
    where: { postId: id },
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

  const { id: postId } = await params;

  const announcement = await prisma.announcement.findFirst({
    where: { id: postId, isActive: true },
    select: { id: true },
  });
  if (!announcement) {
    return Response.json({ error: "Announcement not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const content = typeof (body as { content?: unknown }).content === "string"
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

  const comment = await prisma.comment.create({
    data: { postId, userId: session.uid, content },
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
