/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublishedPageBySlug,
  listPublishedPages,
} from "@/lib/builder/server/page-service";
import { SiteShell } from "@/components/site/site-shell";
import { resolveSiteFaviconSrc, resolveSiteName } from "@/lib/brand/identity";
import { getPublishedNewsArticleBySlug } from "@/lib/news/server/news-service";

type NewsDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [article, homepage] = await Promise.all([
    getPublishedNewsArticleBySlug(slug),
    getPublishedPageBySlug("homepage"),
  ]);

  if (!article || !homepage) {
    return {};
  }

  const siteName = resolveSiteName(homepage.document.site.name);
  const icon = resolveSiteFaviconSrc({
    faviconSrc: homepage.document.site.faviconSrc,
    logoSrc: homepage.document.site.logoSrc,
  });

  return {
    title: `${article.title} | ${siteName}`,
    icons: {
      icon,
      shortcut: icon,
      apple: icon,
    },
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const [article, homepage, pages] = await Promise.all([
    getPublishedNewsArticleBySlug(slug),
    getPublishedPageBySlug("homepage"),
    listPublishedPages(),
  ]);

  if (!article || !homepage) {
    notFound();
  }

  return (
    <SiteShell activeSlug="news" document={homepage.document} pages={pages}>
      <article className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-[var(--primary-soft)] px-3 py-1 text-sm font-medium text-[var(--primary-strong)]">
              {article.category}
            </span>
            <span className="text-sm text-slate-500">
              {article.publishedAt
                ? new Intl.DateTimeFormat("zh-CN", { dateStyle: "long" }).format(
                    new Date(article.publishedAt),
                  )
                : "未发布"}
            </span>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">
            {article.title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">{article.summary}</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img alt={article.title} className="h-[360px] w-full object-cover" src={article.coverImage} />
        </div>

        <div
          className="prose prose-slate mt-10 max-w-none"
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />
      </article>
    </SiteShell>
  );
}
