import { NextResponse } from "next/server";
import { createPageInputSchema } from "@/lib/builder/schemas/page-management";
import {
  createPage,
  listPages,
  PageServiceError,
} from "@/lib/builder/server/page-service";

export async function GET() {
  const pages = await listPages();

  return NextResponse.json(pages);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = createPageInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "页面数据不合法。",
        issues: parsed.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  try {
    const page = await createPage(parsed.data);

    return NextResponse.json(page, {
      status: 201,
    });
  } catch (error) {
    if (error instanceof PageServiceError) {
      const status = error.code === "SLUG_EXISTS" ? 409 : 400;

      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status,
        },
      );
    }

    return NextResponse.json(
      {
        message: "页面创建失败。",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}
