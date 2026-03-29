import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/builder/page-renderer";
import { SiteShell } from "@/components/site/site-shell";
import {
  getPublishedPageBySlug,
  listPublishedPages,
} from "@/lib/builder/server/page-service";
import { listPublishedNewsArticles } from "@/lib/news/server/news-service";

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

  const icon = page.document.site.faviconSrc || page.document.site.logoSrc || undefined;

  return {
    title: `${page.document.page.title} | ${page.document.site.name}`,
    icons: icon
      ? {
          icon,
          shortcut: icon,
          apple: icon,
        }
      : undefined,
  };
}

export default async function SitePage({ params }: SitePageProps) {
  const { slug } = await params;
  const newsLimit = slug === "news" ? 100 : 12;
  const [page, pages, newsArticles] = await Promise.all([
    getPublishedPageBySlug(slug),
    listPublishedPages(),
    listPublishedNewsArticles(newsLimit),
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
      />
    </SiteShell>
  );
}
