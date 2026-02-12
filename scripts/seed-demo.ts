import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  await prisma.event.createMany({
    data: [
      {
        title: "Spring Career Fair",
        description: "Meet employers from across the region.",
        location: "Dome",
        startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
      },
      {
        title: "Intramural Basketball Signup",
        location: "Wellness Center",
        startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21),
      },
    ],
  });

  await prisma.announcement.create({
    data: {
      title: "Library Hours Extended",
      body: "The library will stay open until midnight through finals week.",
    },
  });

  console.log("Demo data seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
