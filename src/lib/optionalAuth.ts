import { cookies } from "next/headers";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { prisma } from "@/lib/prisma";

/**
 * Attempt to read the session without redirecting.
 * Returns the user if authenticated, or null for guests.
 */
export async function optionalAuth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie?.value) return null;

  const session = verifySession(sessionCookie.value);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { id: true, email: true, role: true, isActive: true, isBanned: true },
  });

  if (!user || !user.isActive || user.isBanned) return null;

  return { id: user.id, email: user.email, role: user.role };
}
