import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/products/product-editor";
import {
  getProductBySlug,
  listProductCategories,
} from "@/lib/products/server/product-service";

type EditorProductsDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    embed?: string;
  }>;
};

export default async function EditorProductsDetailPage({
  params,
  searchParams,
}: EditorProductsDetailPageProps) {
  const { slug } = await params;
  const { embed } = await searchParams;
  const [product, categories] = await Promise.all([
    getProductBySlug(slug),
    listProductCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductEditor
      categories={categories}
      embedded={embed === "1"}
      initialProduct={product}
    />
  );
}
