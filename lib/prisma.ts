import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { resolveSqliteUrl } from "@/lib/sqlite-url";

const globalForPrisma = globalThis as unknown as {
  schemaReadyPromise?: Promise<void>;
  sqliteAdapter?: PrismaBetterSqlite3;
  prisma?: PrismaClient;
};

const sqliteBootstrapStatements = [
  `CREATE TABLE IF NOT EXISTS "SitePage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "SitePage_slug_key" ON "SitePage"("slug")`,
  `CREATE TABLE IF NOT EXISTS "SiteNewsArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "contentHtml" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "SiteNewsArticle_slug_key" ON "SiteNewsArticle"("slug")`,
  `CREATE TABLE IF NOT EXISTS "SiteNewsCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "SiteNewsCategory_name_key" ON "SiteNewsCategory"("name")`,
] as const;

function createPrismaClient(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  const adapter =
    globalForPrisma.sqliteAdapter ??
    new PrismaBetterSqlite3({
      url: resolveSqliteUrl(connectionString),
      timeout: 15000,
    });

  const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.sqliteAdapter = adapter;
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}

export function getPrismaClient(): PrismaClient {
  const prisma = createPrismaClient();

  if (!prisma) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return prisma;
}

export async function ensureAppDatabaseSchema() {
  const prisma = getPrismaClient();

  if (!globalForPrisma.schemaReadyPromise) {
    globalForPrisma.schemaReadyPromise = (async () => {
      for (const statement of sqliteBootstrapStatements) {
        await prisma.$executeRawUnsafe(statement);
      }
    })().catch((error) => {
      globalForPrisma.schemaReadyPromise = undefined;
      throw error;
    });
  }

  await globalForPrisma.schemaReadyPromise;
}
