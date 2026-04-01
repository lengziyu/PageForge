import fs from "node:fs";
import path from "node:path";

const clientDir = path.resolve("node_modules", "@prisma", "client");
const prismaDir = path.resolve("node_modules", ".prisma");
const linkPath = path.join(clientDir, ".prisma");

function ensurePrismaClientLink() {
  if (!fs.existsSync(clientDir) || !fs.existsSync(prismaDir)) {
    return;
  }

  try {
    const stat = fs.lstatSync(linkPath);

    if (stat.isSymbolicLink() || stat.isDirectory()) {
      return;
    }

    fs.rmSync(linkPath, { recursive: true, force: true });
  } catch {
    // link/path not found, continue creating
  }

  const relativeTarget = path.relative(clientDir, prismaDir);
  fs.symlinkSync(relativeTarget, linkPath, "junction");
}

ensurePrismaClientLink();
