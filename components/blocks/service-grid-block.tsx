/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import type { ServiceGridProps } from "@/lib/builder/blocks/service-grid";
import type { BuilderBlockComponentProps } from "@/lib/builder/types";
import type { SiteProductSummary } from "@/lib/products/contracts";

type ServiceGridBlockProps = BuilderBlockComponentProps<ServiceGridProps> & {
  products?: SiteProductSummary[];
};

export function ServiceGridBlock({
  props,
  isEditor = false,
  products,
}: ServiceGridBlockProps) {
  const items =
    props.sourceMode === "products" && products && products.length > 0
      ? products.slice(0, props.showCount).map((product, index) => ({
          tag: `${index + 1}`.padStart(2, "0"),
          title: product.title,
          description: product.summary,
          slug: product.slug,
          coverImage: product.coverImage,
          category: product.category,
        }))
      : props.items.slice(0, props.showCount).map((item) => ({
          ...item,
          category: item.tag,
        }));

  const eyebrow = props.sourceMode === "products" ? "产品能力" : "服务产品";

  return (
    <section
      className={`px-6 py-18 md:px-10 md:py-22 ${
        isEditor ? "bg-slate-50" : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--primary-strong)]">
            {eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            {props.title}
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            {props.description}
          </p>
        </div>

        <div
          className={`mt-10 grid gap-6 lg:grid-cols-2 ${
            isEditor ? "md:min-w-[1080px]" : ""
          }`}
        >
          {items.map((item, index) => {
            const href = item.slug ? `/products/${item.slug}` : "#";

            return (
              <article
                className="rounded-2xl border border-slate-200 bg-[color-mix(in_srgb,var(--primary)_8%,white)] p-4 shadow-[0_8px_16px_rgba(15,23,42,0.04)] md:p-[18px]"
                key={`${item.title}-${index}`}
              >
                <div className="grid gap-3 md:grid-cols-[148px_minmax(0,1fr)] md:items-start">
                  <img
                    alt={item.title}
                    className="h-28 w-full rounded-xl object-cover md:h-32"
                    src={item.coverImage || "/hero/technology-platform.svg"}
                  />
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold leading-[1.35] text-slate-950 md:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 md:text-base">
                      {item.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2.5">
                      <p className="truncate text-xs font-medium text-slate-500 md:text-sm">
                        分类：{item.category}
                      </p>
                      {item.slug && !isEditor ? (
                        <Link
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          href={href}
                        >
                          {props.ctaLabel}
                        </Link>
                      ) : (
                        <span className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-400">
                          {props.ctaLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
