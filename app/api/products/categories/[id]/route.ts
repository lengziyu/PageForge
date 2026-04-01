import { NextResponse } from "next/server";
import { productCategoryInputSchema } from "@/lib/products/schema";
import {
  deleteProductCategoryById,
  ProductServiceError,
  updateProductCategoryById,
} from "@/lib/products/server/product-service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
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
    const category = await updateProductCategoryById(id, parsed.data.name);
    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof ProductServiceError) {
      const status = error.code === "CATEGORY_NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ message: error.message }, { status });
    }

    return NextResponse.json(
      {
        message: "产品分类更新失败。",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const category = await deleteProductCategoryById(id);
    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof ProductServiceError) {
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
        message: "产品分类删除失败。",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
