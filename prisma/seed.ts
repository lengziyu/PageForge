import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { resolveSqliteUrl } from "../lib/sqlite-url";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Check your .env file.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: resolveSqliteUrl(process.env.DATABASE_URL),
    timeout: 15000,
  }),
});

async function main() {
  for (const name of ["品牌动态", "行业观点", "媒体报道"]) {
    await prisma.siteNewsCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
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
