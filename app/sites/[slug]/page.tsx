import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/builder/page-renderer";
import { SiteShell } from "@/components/site/site-shell";
import { resolveSiteFaviconSrc, resolveSiteName } from "@/lib/brand/identity";
import {
  getPublishedPageBySlug,
  listPublishedPages,
} from "@/lib/builder/server/page-service";
import { listPublishedNewsArticles } from "@/lib/news/server/news-service";
import { listPublishedProducts } from "@/lib/products/server/product-service";

type SitePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);

  if (!page) {
    return {};
  }

  const siteName = resolveSiteName(page.document.site.name);
  const icon = resolveSiteFaviconSrc({
    faviconSrc: page.document.site.faviconSrc,
    logoSrc: page.document.site.logoSrc,
  });

  return {
    title: `${page.document.page.title} | ${siteName}`,
    icons: {
      icon,
      shortcut: icon,
      apple: icon,
    },
  };
}

export default async function SitePage({ params }: SitePageProps) {
  const { slug } = await params;
  const newsLimit = slug === "news" ? 100 : 12;
  const [page, pages, newsArticles, products] = await Promise.all([
    getPublishedPageBySlug(slug),
    listPublishedPages(),
    listPublishedNewsArticles(newsLimit),
    listPublishedProducts(12),
  ]);

  if (!page) {
    notFound();
  }

  return (
    <SiteShell activeSlug={page.slug} document={page.document} pages={pages}>
      <PageRenderer
        document={page.document}
        newsArticles={newsArticles.map((article) => ({
          category: article.category,
          title: article.title,
          date: article.publishedAt ?? article.updatedAt,
          summary: article.summary,
          slug: article.slug,
          coverImage: article.coverImage,
        }))}
        products={products}
      />
    </SiteShell>
  );
}
