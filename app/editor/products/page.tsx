import { ProductManager } from "@/components/products/product-manager";
import {
  listProductCategories,
  listProducts,
} from "@/lib/products/server/product-service";

export const dynamic = "force-dynamic";

export default async function EditorProductsPage() {
  const [products, categories] = await Promise.all([
    listProducts(),
    listProductCategories(),
  ]);

  return <ProductManager initialCategories={categories} initialProducts={products} />;
}
