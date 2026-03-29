import { NextResponse } from "next/server";
import { newsArticleInputSchema } from "@/lib/news/schema";
import {
  deleteNewsArticleBySlug,
  getNewsArticleBySlug,
  NewsServiceError,
  saveNewsArticleBySlug,
} from "@/lib/news/server/news-service";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { slug } = await context.params;
  const article = await getNewsArticleBySlug(slug);

  if (!article) {
    return NextResponse.json({ message: "新闻不存在。" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const payload = await request.json();
  const parsed = newsArticleInputSchema.safeParse({
    ...payload,
    slug,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "新闻保存参数不合法。",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const article = await saveNewsArticleBySlug(slug, parsed.data);
    return NextResponse.json(article);
  } catch (error) {
    if (error instanceof NewsServiceError) {
      const status = error.code === "ARTICLE_NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ message: error.message }, { status });
    }

    return NextResponse.json(
      {
        message: "新闻保存失败。",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const article = await deleteNewsArticleBySlug(slug);
    return NextResponse.json(article);
  } catch (error) {
    if (error instanceof NewsServiceError) {
      const status = error.code === "ARTICLE_NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ message: error.message }, { status });
    }

    return NextResponse.json(
      {
        message: "新闻删除失败。",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
