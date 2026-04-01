export async function uploadBrowserFile(
  file: File,
  folder: "news" | "products" | "site" | "blocks" = "site",
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/uploads", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json()) as { url?: string; message?: string };

  if (!response.ok || !payload.url) {
    throw new Error(payload.message ?? "文件上传失败。");
  }

  return payload.url;
}
