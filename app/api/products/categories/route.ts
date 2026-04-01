import { NextResponse } from "next/server";
import { productCategoryInputSchema } from "@/lib/products/schema";
import {
  createProductCategory,
  listProductCategories,
  ProductServiceError,
} from "@/lib/products/server/product-service";

export async function GET() {
  const categories = await listProductCategories();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = productCategoryInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "产品分类参数不合法。",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const category = await createProductCategory(parsed.data.name);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof ProductServiceError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: "产品分类创建失败。",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
