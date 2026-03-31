import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { resolveSqliteUrl } from "@/lib/sqlite-url";

const globalForPrisma = globalThis as unknown as {
  sqliteAdapter?: PrismaBetterSqlite3;
  prisma?: PrismaClient;
};

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
