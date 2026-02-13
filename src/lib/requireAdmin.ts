import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function requireAdmin() {
  const user = await requireAuth();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, isAdmin: true, isActive: true, isBanned: true },
  });

  if (!dbUser || !dbUser.isActive || dbUser.isBanned) {
    return { allowed: false as const, user: null };
  }

  const isAllowed = dbUser.isAdmin || ADMIN_EMAILS.includes(dbUser.email.toLowerCase());

  if (!isAllowed) {
    return { allowed: false as const, user: null };
  }

  return { allowed: true as const, user: { id: dbUser.id, email: dbUser.email } };
}
