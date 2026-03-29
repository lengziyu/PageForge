import { NextResponse } from "next/server";
import { savePageInputSchema } from "@/lib/builder/schemas/page-management";
import {
  deletePageBySlug,
  getEditablePageBySlug,
  PageServiceError,
  savePageBySlug,
} from "@/lib/builder/server/page-service";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { slug } = await context.params;
  const page = await getEditablePageBySlug(slug);

  return NextResponse.json(page);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const payload = await request.json();
  const parsed = savePageInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "页面保存数据不合法。",
        issues: parsed.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  try {
    const page = await savePageBySlug(slug, parsed.data.document, parsed.data.status);

    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json(
      {
        message: "页面保存失败，请检查 PostgreSQL 和 Prisma 配置。",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const deletedPage = await deletePageBySlug(slug);

    return NextResponse.json({
      slug: deletedPage.slug,
      title: deletedPage.title,
      message: `页面“${deletedPage.title}”已删除。`,
    });
  } catch (error) {
    if (error instanceof PageServiceError) {
      const status =
        error.code === "PAGE_NOT_FOUND"
          ? 404
          : error.code === "DELETE_FORBIDDEN"
            ? 403
            : 400;

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
        message: "页面删除失败。",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}
