import { redirect } from "next/navigation";
import { ContentHub } from "@/components/content/content-hub";
import { listPages } from "@/lib/builder/server/page-service";
import { listNewsArticles, listNewsCategories } from "@/lib/news/server/news-service";
import {
  listProductCategories,
  listProducts,
} from "@/lib/products/server/product-service";

export const dynamic = "force-dynamic";

export default async function EditorContentHubPage() {
  const [products, newsArticles, productCategories, newsCategories, pages] = await Promise.all([
    listProducts(),
    listNewsArticles(),
    listProductCategories(),
    listNewsCategories(),
    listPages(),
  ]);
  const hasDatabasePages = pages.some((page) => page.source === "database");

  if (!hasDatabasePages) {
    redirect("/editor/start");
  }

  return (
    <ContentHub
      editorHref="/editor"
      initialNewsArticles={newsArticles}
      initialProducts={products}
      newsCategories={newsCategories}
      productCategories={productCategories}
    />
  );
}
