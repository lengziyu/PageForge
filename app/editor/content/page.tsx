import { ContentHub } from "@/components/content/content-hub";
import { listNewsArticles, listNewsCategories } from "@/lib/news/server/news-service";
import {
  listProductCategories,
  listProducts,
} from "@/lib/products/server/product-service";

export const dynamic = "force-dynamic";

export default async function EditorContentHubPage() {
  const [products, newsArticles, productCategories, newsCategories] = await Promise.all([
    listProducts(),
    listNewsArticles(),
    listProductCategories(),
    listNewsCategories(),
  ]);

  return (
    <ContentHub
      initialNewsArticles={newsArticles}
      initialProducts={products}
      newsCategories={newsCategories}
      productCategories={productCategories}
    />
  );
}

