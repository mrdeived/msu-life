import { prisma } from "@/lib/prisma";

export async function GET() {
  await prisma.healthCheck.create({ data: {} });
  return Response.json({ ok: true });
}
