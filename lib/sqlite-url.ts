import fs from "node:fs";
import path from "node:path";

export function resolveSqliteUrl(url: string): string {
  if (!url.startsWith("file:")) {
    return url;
  }

  const rawPath = url.slice(5);

  if (!rawPath.startsWith(".")) {
    fs.mkdirSync(path.dirname(rawPath), { recursive: true });
    return rawPath;
  }

  const resolvedPath = path.resolve(/* turbopackIgnore: true */ process.cwd(), rawPath);
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  return resolvedPath;
}
