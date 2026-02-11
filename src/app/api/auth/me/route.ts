import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { clearSessionCookieHeader } from "@/lib/session";

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { id: true, email: true, role: true, isActive: true, isBanned: true },
  });

  if (!user || !user.isActive || user.isBanned) {
    return Response.json({ error: "Account unavailable" }, {
      status: 403,
      headers: { "Set-Cookie": clearSessionCookieHeader() },
    });
  }

  return Response.json({
    ok: true,
    user: { id: user.id, email: user.email, role: user.role },
  });
}
