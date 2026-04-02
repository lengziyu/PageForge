/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublishedPageBySlug,
  listPublishedPages,
} from "@/lib/builder/server/page-service";
import { SiteShell } from "@/components/site/site-shell";
import { resolveSiteFaviconSrc, resolveSiteName } from "@/lib/brand/identity";
import { getPublishedProductBySlug } from "@/lib/products/server/product-service";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [product, homepage] = await Promise.all([
    getPublishedProductBySlug(slug),
    getPublishedPageBySlug("homepage"),
  ]);

  if (!product || !homepage) {
    return {};
  }

  const siteName = resolveSiteName(homepage.document.site.name);
  const icon = resolveSiteFaviconSrc({
    faviconSrc: homepage.document.site.faviconSrc,
    logoSrc: homepage.document.site.logoSrc,
  });

  return {
    title: `${product.title} | ${siteName}`,
    icons: {
      icon,
      shortcut: icon,
      apple: icon,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const [product, homepage, pages] = await Promise.all([
    getPublishedProductBySlug(slug),
    getPublishedPageBySlug("homepage"),
    listPublishedPages(),
  ]);

  if (!product || !homepage) {
    notFound();
  }

  return (
    <SiteShell activeSlug="services-products" document={homepage.document} pages={pages}>
      <article className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-[var(--primary-soft)] px-3 py-1 text-sm font-medium text-[var(--primary-strong)]">
                {product.category}
              </span>
              <span className="text-sm text-slate-500">
                {product.publishedAt
                  ? new Intl.DateTimeFormat("zh-CN", { dateStyle: "long" }).format(
                      new Date(product.publishedAt),
                    )
                  : "未发布"}
              </span>
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">
              {product.title}
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">{product.summary}</p>

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <img alt={product.title} className="h-[420px] w-full object-cover" src={product.coverImage} />
            </div>
          </div>

          <aside className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">产品亮点</p>
              <div className="mt-4 space-y-3">
                {product.highlights.map((highlight) => (
                  <div
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                    key={highlight}
                  >
                    {highlight}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">规格参数</p>
              <div className="mt-4 space-y-3">
                {product.specs.map((spec) => (
                  <div
                    className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3"
                    key={`${spec.label}-${spec.value}`}
                  >
                    <span className="text-sm text-slate-500">{spec.label}</span>
                    <span className="text-right text-sm font-medium text-slate-900">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {product.gallery.length > 0 ? (
          <section className="mt-14">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">图集展示</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">产品画面</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {product.gallery.map((image, index) => (
                <div
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                  key={`${image}-${index}`}
                >
                  <img
                    alt={`${product.title} 图集 ${index + 1}`}
                    className="h-60 w-full object-cover"
                    src={image}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div
          className="prose prose-slate mt-14 max-w-none"
          dangerouslySetInnerHTML={{ __html: product.contentHtml }}
        />
      </article>
    </SiteShell>
  );
}
