import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { defaultPageDocument } from "../lib/builder/default-page";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Check your .env file.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.sitePage.upsert({
    where: {
      slug: defaultPageDocument.page.slug,
    },
    update: {
      title: defaultPageDocument.page.title,
      status: "PUBLISHED",
      content: defaultPageDocument,
    },
    create: {
      slug: defaultPageDocument.page.slug,
      title: defaultPageDocument.page.title,
      status: "PUBLISHED",
      content: defaultPageDocument,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
