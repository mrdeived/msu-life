import { prisma } from "@/lib/prisma";

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, title: true, body: true, createdAt: true },
  });

  return Response.json(announcements);
}
