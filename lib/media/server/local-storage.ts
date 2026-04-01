import fs from "node:fs/promises";
import path from "node:path";

const allowedMimeToExtension: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, "");
}

function resolveUploadDir() {
  return path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    process.env.UPLOAD_DIR ?? "./public/uploads",
  );
}

export async function saveUploadedFile(
  file: File,
  options?: {
    folder?: string;
  },
) {
  const extension =
    allowedMimeToExtension[file.type] ??
    (path.extname(file.name || "").toLowerCase() || ".bin");
  const folder = sanitizeSegment(options?.folder ?? "misc") || "misc";
  const today = new Date();
  const datePath = [
    `${today.getFullYear()}`,
    `${today.getMonth() + 1}`.padStart(2, "0"),
  ];
  const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}${extension}`;
  const relativeDir = path.join(folder, ...datePath);
  const uploadDir = resolveUploadDir();
  const targetDir = path.join(uploadDir, relativeDir);
  const targetPath = path.join(targetDir, fileName);

  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(targetPath, Buffer.from(await file.arrayBuffer()));

  return {
    path: targetPath,
    url: `/uploads/${path.posix.join(
      folder,
      ...datePath,
      fileName,
    )}`,
  };
}
