import { NextResponse } from "next/server";
import { newsCategoryInputSchema } from "@/lib/news/schema";
import {
  createNewsCategory,
  listNewsCategories,
  NewsServiceError,
} from "@/lib/news/server/news-service";

export async function GET() {
  const categories = await listNewsCategories();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
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
    const category = await createNewsCategory(parsed.data.name);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof NewsServiceError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: "新闻分类创建失败。",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
