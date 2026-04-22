import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("password123", 12);

  const author = await prisma.user.upsert({
    where: { email: "author@example.com" },
    update: {},
    create: {
      email: "author@example.com",
      passwordHash,
      name: "Тестовый Автор",
      role: "AUTHOR",
      emailVerified: true,
    },
  });

  await prisma.publication.upsert({
    where: { slug: "test-publication" },
    update: {},
    create: {
      authorId: author.id,
      name: "Тестовая Публикация",
      slug: "test-publication",
      description: "Это тестовая публикация для разработки",
    },
  });

  console.log("Seed completed: author@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
