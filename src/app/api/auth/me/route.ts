import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { clearSessionCookieHeader } from "@/lib/session";
import { computeDisplayName } from "@/lib/deriveNames";

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { id: true, email: true, role: true, isActive: true, isBanned: true, isAdmin: true, firstName: true, lastName: true },
  });

  if (!user || !user.isActive || user.isBanned) {
    return Response.json({ error: "Account unavailable" }, {
      status: 403,
      headers: { "Set-Cookie": clearSessionCookieHeader() },
    });
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const isAdmin = user.isAdmin || adminEmails.includes(user.email.toLowerCase());

  return Response.json({
    ok: true,
    user: { id: user.id, email: user.email, role: user.role },
    isAdmin,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: computeDisplayName(user.firstName, user.lastName, user.email),
  });
}
