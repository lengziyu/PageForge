import { redirect } from "next/navigation";
import { ContentHub } from "@/components/content/content-hub";
import { normalizeHeroBannerSources } from "@/lib/builder/banner-media";
import { getEditablePageBySlug, listPages } from "@/lib/builder/server/page-service";
import { listNewsArticles, listNewsCategories } from "@/lib/news/server/news-service";
import {
  listProductCategories,
  listProducts,
} from "@/lib/products/server/product-service";

export const dynamic = "force-dynamic";

export default async function EditorContentHubPage() {
  const [
    products,
    newsArticles,
    productCategories,
    newsCategories,
    pages,
    homepage,
  ] = await Promise.all([
    listProducts(),
    listNewsArticles(),
    listProductCategories(),
    listNewsCategories(),
    listPages(),
    getEditablePageBySlug("homepage"),
  ]);
  const hasDatabasePages = pages.some((page) => page.source === "database");
  const initialHeroBannerSources = normalizeHeroBannerSources(
    homepage.document.site.heroBannerSources,
  );

  if (!hasDatabasePages) {
    redirect("/editor/start");
  }

  return (
    <ContentHub
      editorHref="/editor"
      initialHeroBannerSources={initialHeroBannerSources}
      initialNewsArticles={newsArticles}
      initialProducts={products}
      initialSiteConfig={homepage.document.site}
      newsCategories={newsCategories}
      productCategories={productCategories}
      sitePages={pages}
    />
  );
}
