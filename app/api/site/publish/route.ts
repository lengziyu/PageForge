import { NextResponse } from "next/server";
import { z } from "zod";
import { pageDocumentSchema } from "@/lib/builder/schema";
import { publishSite } from "@/lib/builder/server/page-service";

const publishSiteInputSchema = z.object({
  currentPageSlug: z.string().min(1).optional(),
  currentDocument: pageDocumentSchema.optional(),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const parsed = publishSiteInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "整站发布参数不合法。",
        issues: parsed.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  try {
    const pages = await publishSite({
      currentPageSlug: parsed.data.currentPageSlug,
      currentDocument: parsed.data.currentDocument,
    });

    return NextResponse.json({
      message: `整站已发布，共 ${pages.length} 个页面可预览。`,
      pages,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "整站发布失败。",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}
