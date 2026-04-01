"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { SiteTemplateDialog } from "@/components/builder/site-template-dialog";
import type { BuilderPageListItem } from "@/lib/builder/page-contracts";
import type {
  EnterprisePageKey,
  SiteTemplateId,
} from "@/lib/builder/template-catalog";
import type { FooterTemplateId } from "@/lib/builder/site-config";

type SitePageDashboardProps = {
  pages: BuilderPageListItem[];
  title: string;
  slug: string;
  isSubmitting: boolean;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (page: BuilderPageListItem) => void;
  onPublishSite: () => void;
  onReplaceSite: (input: {
    templateId: SiteTemplateId;
    selectedPages: EnterprisePageKey[];
    footerTemplate: FooterTemplateId;
  }) => void;
};

function formatUpdatedAt(value: string | null): string {
  if (!value) {
    return "默认模板内容";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function SitePageDashboard({
  pages,
  title,
  slug,
  isSubmitting,
  onTitleChange,
  onSlugChange,
  onSubmit,
  onDelete,
  onPublishSite,
  onReplaceSite,
}: SitePageDashboardProps) {
  const compactButtonClass =
    "inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50";

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">站点配置</p>
            <h2 className="mt-1.5 text-lg font-semibold text-slate-950 md:text-xl">当前站点已初始化</h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">
              你可以重新选择行业模板覆盖站点，也可以直接一键发布整站，把当前所有页面统一上线。
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link className={compactButtonClass} href="/editor/content">
              内容中心
            </Link>
            <button
              className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-2.5 py-1.5 text-xs font-medium text-[var(--primary-foreground)] transition hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
              onClick={onPublishSite}
              type="button"
            >
              发布整站
            </button>
            <SiteTemplateDialog isSubmitting={isSubmitting} onReplaceSite={onReplaceSite} />
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">新建页面</p>
            <h2 className="mt-1.5 text-xl font-semibold text-slate-950">补充独立页面</h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">
              用于新增合作伙伴、案例详情、招聘信息等额外页面。
            </p>
          </div>

          <form className="mt-5 space-y-3" onSubmit={onSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">页面名称</span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-[var(--ring)]"
                onChange={(event) => onTitleChange(event.target.value)}
                placeholder="例如：合作伙伴"
                required
                value={title}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">页面 slug（可选）</span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-[var(--ring)]"
                onChange={(event) => onSlugChange(event.target.value)}
                placeholder="partner"
                value={slug}
              />
            </label>

            <button
              className="w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "创建中..." : "创建草稿页面"}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-100/80 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">页面列表</p>
              <h2 className="mt-1.5 text-xl font-semibold text-slate-950">当前站点页面</h2>
            </div>
            <p className="text-xs text-slate-500 md:text-sm">{pages.length} 个页面</p>
          </div>

          <div className="grid gap-3">
            {pages.map((page) => {
              const canDelete = page.slug !== "homepage" && page.source !== "default";

              return (
                <article className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm" key={page.slug}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-950 md:text-lg">{page.title}</h3>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                            page.status === "PUBLISHED"
                              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {page.status === "PUBLISHED" ? "已发布" : "草稿"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">/{page.slug}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {page.sectionCount} 个区块 · 最近更新：{formatUpdatedAt(page.updatedAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {page.status === "PUBLISHED" ? (
                        <Link
                          className="inline-flex items-center rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          href={`/sites/${page.slug}`}
                        >
                          预览
                        </Link>
                      ) : (
                        <span className="inline-flex items-center rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-400">
                          未发布
                        </span>
                      )}
                      <Link
                        className="inline-flex min-w-[72px] items-center justify-center rounded-lg bg-[var(--primary)] px-2.5 py-1.5 text-xs font-medium text-[var(--primary-foreground)]"
                        href={`/editor/pages/${page.slug}`}
                      >
                        编辑
                      </Link>
                      <button
                        className="inline-flex items-center justify-center rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                        disabled={!canDelete || isSubmitting}
                        onClick={() => onDelete(page)}
                        type="button"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
