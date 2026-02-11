import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  await prisma.healthCheck.create({ data: {} });
  return Response.json({ ok: true });
}
