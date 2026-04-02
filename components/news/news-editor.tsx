/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { RichTextEditor } from "@/components/news/rich-text-editor";
import { BrandThemeSwitcher } from "@/components/theme/brand-theme-switcher";
import { uploadBrowserFile } from "@/lib/media/client";
import type { SiteNewsArticle, SiteNewsCategory } from "@/lib/news/contracts";

type NewsEditorProps = {
  initialArticle: SiteNewsArticle;
  categories: SiteNewsCategory[];
  embedded?: boolean;
};

export function NewsEditor({
  initialArticle,
  categories,
  embedded = false,
}: NewsEditorProps) {
  const router = useRouter();
  const [article, setArticle] = useState(initialArticle);
  const [message, setMessage] = useState("支持封面图同步、分类选择、图片/视频富文本编辑。");
  const [isSaving, startSavingTransition] = useTransition();

  const updateArticle = <T extends keyof SiteNewsArticle>(key: T, value: SiteNewsArticle[T]) => {
    setArticle((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleCoverUpload = async (fileList: FileList | null) => {
    const file = fileList?.[0];

    if (!file) {
      return;
    }

    try {
      const url = await uploadBrowserFile(file, "news");
      updateArticle("coverImage", url);
      setMessage("封面图已更新，保存后前台新闻列表和详情会同步生效。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "封面图上传失败。");
    }
  };

  const handleSave = (status: "DRAFT" | "PUBLISHED") => {
    startSavingTransition(async () => {
      const response = await fetch(`/api/news/${article.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...article,
          status,
        }),
      });

      const payload = (await response.json()) as { message?: string } & SiteNewsArticle;

      if (!response.ok) {
        setMessage(payload.message ?? "新闻保存失败。");
        return;
      }

      setArticle(payload);
      setMessage(status === "PUBLISHED" ? "新闻已发布。" : "新闻已保存为草稿。");
      router.refresh();
    });
  };

  return (
    <main
      className={
        embedded
          ? "h-[100dvh] overflow-hidden bg-[var(--background)] px-3 py-3 md:px-4"
          : "min-h-screen px-4 py-4 md:px-6"
      }
    >
      <div
        className={`${
          embedded
            ? "flex h-full max-w-none flex-col gap-4 overflow-hidden"
            : "mx-auto max-w-6xl space-y-6 pb-24"
        }`}
      >
        {!embedded ? (
          <header className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-5 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                  新闻编辑器
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
                  {article.title}
                </h1>
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">{message}</p>
              </div>

              <div className="flex flex-wrap items-start gap-3">
                <Link
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted)]"
                  href="/editor/newsroom"
                >
                  返回新闻中心
                </Link>
                <BrandThemeSwitcher />
                <AdminLogoutButton className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted)]" />
              </div>
            </div>
          </header>
        ) : null}

        <div className={embedded ? "min-h-0 flex-1 overflow-y-auto space-y-6 pr-1" : "space-y-6"}>
          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">基础信息</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">新闻属性</h2>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">标题</span>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--ring)]"
                  onChange={(event) => updateArticle("title", event.target.value)}
                  value={article.title}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">分类</span>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--ring)]"
                  onChange={(event) => updateArticle("category", event.target.value)}
                  value={article.category}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">摘要</span>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--ring)]"
                  onChange={(event) => updateArticle("summary", event.target.value)}
                  value={article.summary}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">封面图地址</span>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--ring)]"
                  onChange={(event) => updateArticle("coverImage", event.target.value)}
                  value={article.coverImage}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">上传封面图</span>
                <input
                  accept="image/*"
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-4 file:py-2 file:text-[var(--primary-foreground)]"
                  onChange={(event) => {
                    void handleCoverUpload(event.target.files);
                  }}
                  type="file"
                />
              </label>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <img
                  alt={article.title}
                  className="h-48 w-full object-cover"
                  src={article.coverImage}
                />
              </div>
            </aside>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">正文内容</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">富文本编辑</h2>
              </div>
              <RichTextEditor
                onChange={(value) => updateArticle("contentHtml", value)}
                uploadFolder="news"
                value={article.contentHtml}
              />
            </section>
          </div>
        </div>

        <section
          className={`${
            embedded ? "shrink-0" : "sticky bottom-0 z-20"
          } rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-sm backdrop-blur`}
        >
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              className="rounded-lg border border-amber-300/30 bg-amber-400 px-4 py-2 text-sm font-medium text-slate-950"
              disabled={isSaving}
              onClick={() => handleSave("DRAFT")}
              type="button"
            >
              {isSaving ? "处理中..." : "保存草稿"}
            </button>
            <button
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
              disabled={isSaving}
              onClick={() => handleSave("PUBLISHED")}
              type="button"
            >
              {isSaving ? "处理中..." : "发布新闻"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
