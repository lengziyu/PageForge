import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { resolveSqliteUrl } from "@/lib/sqlite-url";

const globalForPrisma = globalThis as unknown as {
  schemaReadyPromise?: Promise<void>;
  libsqlAdapter?: PrismaLibSql;
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
  `CREATE TABLE IF NOT EXISTS "SiteProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "galleryJson" TEXT NOT NULL DEFAULT '[]',
    "highlightsJson" TEXT NOT NULL DEFAULT '[]',
    "specsJson" TEXT NOT NULL DEFAULT '[]',
    "contentHtml" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "SiteProduct_slug_key" ON "SiteProduct"("slug")`,
  `CREATE TABLE IF NOT EXISTS "SiteProductCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "SiteProductCategory_name_key" ON "SiteProductCategory"("name")`,
] as const;

function normalizeDatabaseUrl(connectionString: string) {
  if (!connectionString.startsWith("file:")) {
    return connectionString;
  }

  return `file:${resolveSqliteUrl(connectionString)}`;
}

function createPrismaClient(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL ?? "file:./data/pageforge.db";

  if (!connectionString) {
    return null;
  }

  const normalizedUrl = normalizeDatabaseUrl(connectionString);
  process.env.DATABASE_URL = normalizedUrl;

  const adapter =
    globalForPrisma.libsqlAdapter ??
    new PrismaLibSql({
      url: normalizedUrl,
    });

  const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });

  // Keep a single Prisma client per process in all environments.
  // Creating multiple clients against the same SQLite file can increase
  // lock contention and cause operation timeouts under concurrent requests.
  globalForPrisma.libsqlAdapter = adapter;
  globalForPrisma.prisma = prisma;

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
