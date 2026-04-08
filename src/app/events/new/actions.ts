"use server";

import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

const getAdminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export async function createEventAction(
  formData: FormData
): Promise<{ id: string } | { error: string }> {
  const user = await requireAuth();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, isAdmin: true, isActive: true, isBanned: true },
  });

  const adminEmails = getAdminEmails();
  if (
    !dbUser ||
    !dbUser.isActive ||
    dbUser.isBanned ||
    (!dbUser.isAdmin && !adminEmails.includes(dbUser.email.toLowerCase()))
  ) {
    return { error: "Admin access required" };
  }

  const title = (formData.get("title") as string | null)?.trim();
  const location = (formData.get("location") as string | null)?.trim() || null;
  const description = (formData.get("description") as string | null)?.trim() || null;
  const startAtRaw = formData.get("startAt") as string | null;
  const endAtRaw = (formData.get("endAt") as string | null)?.trim() || null;
  const imageUrl = (formData.get("imageUrl") as string | null)?.trim() || null;
  const imagePublicId = (formData.get("imagePublicId") as string | null)?.trim() || null;

  if (!title || title.length === 0) return { error: "Title is required" };
  if (title.length > 120) return { error: "Title is too long" };
  if (!startAtRaw) return { error: "Start date is required" };

  const startAt = new Date(startAtRaw);
  if (isNaN(startAt.getTime())) return { error: "Invalid start date" };

  let endAt: Date | null = null;
  if (endAtRaw) {
    endAt = new Date(endAtRaw);
    if (isNaN(endAt.getTime())) return { error: "Invalid end date" };
    if (endAt <= startAt) return { error: "End must be after start" };
  }

  const event = await prisma.event.create({
    data: {
      title,
      location,
      description,
      startAt,
      endAt,
      isPublished: true,
      createdById: user.id,
      imageUrl,
      imagePublicId,
    },
    select: { id: true },
  });

  return { id: event.id };
}
