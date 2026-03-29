import { NextResponse } from "next/server";
import { createNewsArticleSchema } from "@/lib/news/schema";
import {
  createNewsArticle,
  listNewsArticles,
  NewsServiceError,
} from "@/lib/news/server/news-service";

export async function GET() {
  const articles = await listNewsArticles();
  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = createNewsArticleSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "新闻创建参数不合法。",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const article = await createNewsArticle(parsed.data);
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    if (error instanceof NewsServiceError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: "新闻创建失败。",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
