import { NextResponse } from "next/server";
import { productInputSchema } from "@/lib/products/schema";
import {
  deleteProductBySlug,
  getProductBySlug,
  ProductServiceError,
  saveProductBySlug,
} from "@/lib/products/server/product-service";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { slug } = await context.params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return NextResponse.json({ message: "产品不存在。" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const payload = await request.json();
  const parsed = productInputSchema.safeParse({
    ...payload,
    slug,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "产品保存参数不合法。",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const product = await saveProductBySlug(slug, parsed.data);
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof ProductServiceError) {
      const status = error.code === "PRODUCT_NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ message: error.message }, { status });
    }

    return NextResponse.json(
      {
        message: "产品保存失败。",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const product = await deleteProductBySlug(slug);
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof ProductServiceError) {
      const status = error.code === "PRODUCT_NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ message: error.message }, { status });
    }

    return NextResponse.json(
      {
        message: "产品删除失败。",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
