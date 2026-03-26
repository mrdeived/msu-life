import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { id: true, isActive: true, isBanned: true },
  });
  if (!user || !user.isActive || user.isBanned) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: {
    puzzleDate: string;
    answer: string;
    won: boolean;
    attempts: number;
    maxAttempts: number;
    guessPattern: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { puzzleDate, answer, won, attempts, maxAttempts, guessPattern } = body;
  if (
    typeof puzzleDate !== "string" ||
    typeof answer !== "string" ||
    typeof won !== "boolean" ||
    typeof attempts !== "number" ||
    typeof maxAttempts !== "number" ||
    typeof guessPattern !== "string"
  ) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Enforce one completed result per user per puzzle day
  const existing = await prisma.wordleResult.findFirst({
    where: { userId: user.id, puzzleDate },
  });
  if (existing) {
    return Response.json({ ok: true, alreadyExists: true });
  }

  const result = await prisma.wordleResult.create({
    data: { userId: user.id, puzzleDate, answer, won, attempts, maxAttempts, guessPattern },
  });

  return Response.json({ ok: true, id: result.id });
}
