import { NextResponse } from "next/server";
import { newsCategoryInputSchema } from "@/lib/news/schema";
import {
  deleteNewsCategoryById,
  NewsServiceError,
  updateNewsCategoryById,
} from "@/lib/news/server/news-service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const payload = await request.json();
  const parsed = newsCategoryInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "新闻分类参数不合法。",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const category = await updateNewsCategoryById(id, parsed.data.name);
    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof NewsServiceError) {
      const status = error.code === "CATEGORY_NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ message: error.message }, { status });
    }

    return NextResponse.json(
      {
        message: "新闻分类更新失败。",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const category = await deleteNewsCategoryById(id);
    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof NewsServiceError) {
      const status =
        error.code === "CATEGORY_NOT_FOUND"
          ? 404
          : error.code === "CATEGORY_IN_USE"
            ? 409
            : 400;
      return NextResponse.json({ message: error.message }, { status });
    }

    return NextResponse.json(
      {
        message: "新闻分类删除失败。",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
