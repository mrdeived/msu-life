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

  let body: { answer: string; won: boolean; attempts: number; maxAttempts: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { answer, won, attempts, maxAttempts } = body;
  if (
    typeof answer !== "string" ||
    typeof won !== "boolean" ||
    typeof attempts !== "number" ||
    typeof maxAttempts !== "number"
  ) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await prisma.wordleResult.create({
    data: {
      userId: user.id,
      answer,
      won,
      attempts,
      maxAttempts,
    },
  });

  return Response.json({ ok: true, id: result.id });
}
