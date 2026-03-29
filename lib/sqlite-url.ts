import path from "node:path";

export function resolveSqliteUrl(url: string): string {
  if (!url.startsWith("file:")) {
    return url;
  }

  const rawPath = url.slice(5);

  if (!rawPath.startsWith(".")) {
    return rawPath;
  }

  return path.resolve(/* turbopackIgnore: true */ process.cwd(), rawPath);
}
