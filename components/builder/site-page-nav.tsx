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
    <nav className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-2.5 py-2 shadow-sm">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {sortedPages.map((page) => {
          const isActive = page.slug === currentSlug;

          return (
            <Link
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition ${
                isActive
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
              href={`/editor/pages/${page.slug}`}
              key={page.slug}
            >
              <span className="whitespace-nowrap">{page.title}</span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                  isActive
                    ? "bg-[color-mix(in_srgb,var(--primary-foreground)_14%,transparent)] text-[var(--primary-foreground)]"
                    : page.status === "PUBLISHED"
                      ? "bg-[var(--primary-soft)] text-[var(--primary-strong)]"
                      : "bg-amber-100 text-amber-900"
                }`}
              >
                {page.status === "PUBLISHED" ? "已发" : "草稿"}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
