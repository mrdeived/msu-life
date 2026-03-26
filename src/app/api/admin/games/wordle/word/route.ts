import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const WORD_LENGTH = 5;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

async function requireAdminFromRequest(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { id: true, email: true, isAdmin: true, isActive: true, isBanned: true },
  });

  if (!user || !user.isActive || user.isBanned) return null;
  if (!user.isAdmin && !ADMIN_EMAILS.includes(user.email.toLowerCase())) return null;

  return user;
}

// ── POST — upsert a scheduled daily word ────────────────────────────────────
export async function POST(request: Request) {
  const admin = await requireAdminFromRequest(request);
  if (!admin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { puzzleDate, answer } = body;

  if (typeof puzzleDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(puzzleDate)) {
    return Response.json({ error: "Invalid puzzle date" }, { status: 400 });
  }

  if (typeof answer !== "string") {
    return Response.json({ error: "Invalid answer" }, { status: 400 });
  }

  const normalized = answer.trim().toUpperCase();
  if (normalized.length !== WORD_LENGTH || !/^[A-Z]+$/.test(normalized)) {
    return Response.json(
      { error: `Answer must be exactly ${WORD_LENGTH} alphabetic letters` },
      { status: 400 }
    );
  }

  const record = await prisma.wordleScheduledWord.upsert({
    where: { puzzleDate },
    create: { puzzleDate, answer: normalized, createdById: admin.id },
    update: { answer: normalized },
  });

  return Response.json({ ok: true, id: record.id });
}

// ── DELETE — remove a scheduled daily word ───────────────────────────────────
export async function DELETE(request: Request) {
  const admin = await requireAdminFromRequest(request);
  if (!admin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const puzzleDate = url.searchParams.get("date");

  if (!puzzleDate || !/^\d{4}-\d{2}-\d{2}$/.test(puzzleDate)) {
    return Response.json({ error: "Invalid puzzle date" }, { status: 400 });
  }

  await prisma.wordleScheduledWord.deleteMany({ where: { puzzleDate } });

  return Response.json({ ok: true });
}
