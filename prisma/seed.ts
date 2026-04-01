import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { ensureAppDatabaseSchema } from "../lib/prisma";
import { resolveSqliteUrl } from "../lib/sqlite-url";

const databaseUrl = process.env.DATABASE_URL ?? "file:./data/pageforge.db";
const runtimeDatabaseUrl = databaseUrl.startsWith("file:")
  ? `file:${resolveSqliteUrl(databaseUrl)}`
  : databaseUrl;

process.env.DATABASE_URL = runtimeDatabaseUrl;

const adapter = new PrismaLibSql({
  url: runtimeDatabaseUrl,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await ensureAppDatabaseSchema();

  for (const name of ["品牌动态", "行业观点", "媒体报道"]) {
    await prisma.siteNewsCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const name of ["核心产品", "行业方案", "服务支持"]) {
    await prisma.siteProductCategory.upsert({
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
