import { NextResponse } from "next/server";
import { saveUploadedFile } from "@/lib/media/server/local-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") ?? "misc");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ message: "请先选择要上传的文件。" }, { status: 400 });
    }

    const result = await saveUploadedFile(file, { folder });

    return NextResponse.json({
      message: "上传成功。",
      url: result.url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "上传失败。",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
