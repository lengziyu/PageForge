import { NextResponse } from "next/server";
import { createProductSchema } from "@/lib/products/schema";
import {
  createProduct,
  listProducts,
  ProductServiceError,
} from "@/lib/products/server/product-service";

export async function GET() {
  const products = await listProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = createProductSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "产品创建参数不合法。",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const product = await createProduct(parsed.data);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof ProductServiceError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: "产品创建失败。",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
