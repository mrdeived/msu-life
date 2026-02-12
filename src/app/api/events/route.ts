import { prisma } from "@/lib/prisma";

export async function GET() {
  const events = await prisma.event.findMany({
    where: { isPublished: true, startAt: { gt: new Date() } },
    orderBy: { startAt: "asc" },
    take: 10,
    select: { id: true, title: true, description: true, location: true, startAt: true, endAt: true },
  });

  return Response.json(events);
}
