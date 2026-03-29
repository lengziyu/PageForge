import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { defaultPageDocument } from "../lib/builder/default-page";
import { resolveSqliteUrl } from "../lib/sqlite-url";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Check your .env file.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: resolveSqliteUrl(process.env.DATABASE_URL),
  }),
});

async function main() {
  await prisma.sitePage.upsert({
    where: {
      slug: defaultPageDocument.page.slug,
    },
    update: {
      title: defaultPageDocument.page.title,
      status: "PUBLISHED",
      content: JSON.stringify(defaultPageDocument),
    },
    create: {
      slug: defaultPageDocument.page.slug,
      title: defaultPageDocument.page.title,
      status: "PUBLISHED",
      content: JSON.stringify(defaultPageDocument),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
