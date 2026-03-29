"use client";

import Link from "next/link";
import type { BuilderPageListItem } from "@/lib/builder/page-contracts";
import { enterprisePageCatalog } from "@/lib/builder/template-catalog";

type SitePageNavProps = {
  currentSlug: string;
  pages: BuilderPageListItem[];
};

function sortPages(pages: BuilderPageListItem[]) {
  const pageOrder = new Map<string, number>(
    enterprisePageCatalog.map((page, index) => [page.slug, index]),
  );

  return [...pages].sort((left, right) => {
    const leftOrder = pageOrder.get(left.slug);
    const rightOrder = pageOrder.get(right.slug);

    if (leftOrder !== undefined && rightOrder !== undefined) {
      return leftOrder - rightOrder;
    }

    if (leftOrder !== undefined) {
      return -1;
    }

    if (rightOrder !== undefined) {
      return 1;
    }

    return left.slug.localeCompare(right.slug);
  });
}

export function SitePageNav({ currentSlug, pages }: SitePageNavProps) {
  const sortedPages = sortPages(pages);

  return (
    <nav className="rounded-xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <div className="flex flex-wrap gap-2">
        {sortedPages.map((page) => {
          const isActive = page.slug === currentSlug;

          return (
            <Link
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-slate-950 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
              href={`/editor/pages/${page.slug}`}
              key={page.slug}
              style={{ color: isActive ? "#ffffff" : "#334155" }}
            >
              <span>{page.title}</span>
              <span
                className={`rounded-md px-2 py-0.5 text-[11px] ${
                  isActive
                    ? "bg-white/10 text-white"
                    : page.status === "PUBLISHED"
                      ? "bg-indigo-100 text-indigo-900"
                      : "bg-amber-100 text-amber-900"
                }`}
              >
                {page.status === "PUBLISHED" ? "已发布" : "草稿"}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
