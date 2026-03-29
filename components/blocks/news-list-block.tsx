/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { NewsListItem, NewsListProps } from "@/lib/builder/blocks/news-list";
import type { BuilderBlockComponentProps } from "@/lib/builder/types";

type NewsListBlockProps = BuilderBlockComponentProps<NewsListProps> & {
  articles?: NewsListItem[];
};

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      monthDay: date,
      year: "",
    };
  }

  const month = `${parsedDate.getMonth() + 1}`.padStart(2, "0");
  const day = `${parsedDate.getDate()}`.padStart(2, "0");

  return {
    monthDay: `${month}-${day}`,
    year: `${parsedDate.getFullYear()}`,
  };
}

export function NewsListBlock({
  props,
  isEditor = false,
  articles,
}: NewsListBlockProps) {
  const sourceItems = useMemo(() => {
    if (articles && articles.length > 0 && props.sourceMode === "newsroom") {
      return articles;
    }

    return props.items;
  }, [articles, props.items, props.sourceMode]);

  const pageSize = Math.max(1, props.showCount);
  const totalPages = Math.max(1, Math.ceil(sourceItems.length / pageSize));
  const paginationKey = useMemo(
    () => `${sourceItems.map((item) => item.slug).join("|")}-${pageSize}`,
    [pageSize, sourceItems],
  );
  const [pageState, setPageState] = useState({ key: paginationKey, page: 1 });
  const safeCurrentPage =
    pageState.key === paginationKey ? Math.min(pageState.page, totalPages) : 1;
  const items = sourceItems.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  return (
    <section className={`px-6 py-18 md:px-10 md:py-22 ${isEditor ? "bg-slate-50" : "bg-white"}`}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
            新闻资讯
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            {props.title}
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">{props.description}</p>
        </div>

        <div className="mt-10 space-y-6">
          {items.map((item, index) => {
            const dateInfo = formatDate(item.date);
            const href = `/news/${item.slug}`;

            return (
              <article
                className="grid gap-5 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[280px_140px_minmax(0,1fr)_72px] md:items-center"
                key={`${item.slug}-${index}`}
              >
                <img
                  alt={item.title}
                  className="h-44 w-full rounded-lg object-cover"
                  src={item.coverImage}
                />
                <div className="self-start md:self-center">
                  <p className="text-5xl font-light tracking-tight text-slate-800">
                    {dateInfo.monthDay}
                  </p>
                  <p className="mt-2 text-2xl text-slate-400">{dateInfo.year}</p>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold leading-10 text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-slate-600">{item.summary}</p>
                </div>
                {isEditor ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-200 text-2xl text-white">
                    →
                  </div>
                ) : (
                  <Link
                    className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-200 text-2xl text-white transition hover:bg-slate-300"
                    href={href}
                    style={{ color: "#ffffff" }}
                  >
                    →
                  </Link>
                )}
              </article>
            );
          })}
        </div>

        {!isEditor && totalPages > 1 ? (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
              disabled={safeCurrentPage === 1}
              onClick={() =>
                setPageState({
                  key: paginationKey,
                  page: Math.max(1, safeCurrentPage - 1),
                })
              }
              type="button"
            >
              上一页
            </button>
            <span className="text-sm text-slate-500">
              第 {safeCurrentPage} / {totalPages} 页
            </span>
            <button
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
              disabled={safeCurrentPage === totalPages}
              onClick={() =>
                setPageState({
                  key: paginationKey,
                  page: Math.min(totalPages, safeCurrentPage + 1),
                })
              }
              type="button"
            >
              下一页
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
