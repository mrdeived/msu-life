import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function requireAuth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie?.value) {
    redirect("/login");
  }

  const session = verifySession(sessionCookie.value);
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { id: true, email: true, role: true, isActive: true, isBanned: true },
  });

  if (!user || !user.isActive || user.isBanned) {
    redirect("/login");
  }

  return { id: user.id, email: user.email, role: user.role };
}
