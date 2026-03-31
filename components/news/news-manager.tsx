/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import type {
  SiteNewsCategory,
  SiteNewsStatus,
  SiteNewsSummary,
} from "@/lib/news/contracts";

type NewsManagerProps = {
  initialArticles: SiteNewsSummary[];
  initialCategories: SiteNewsCategory[];
};

const pageSize = 6;

function formatDate(value: string | null) {
  if (!value) {
    return "未发布";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function NewsManager({
  initialArticles,
  initialCategories,
}: NewsManagerProps) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [categories, setCategories] = useState(initialCategories);
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategories[0]?.name ?? "品牌动态",
  );
  const [categoryDraft, setCategoryDraft] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [filter, setFilter] = useState<SiteNewsStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("在这里管理新闻列表、分类、草稿和详情页内容。");
  const [isSubmitting, startTransition] = useTransition();

  const filteredArticles = useMemo(() => {
    if (filter === "ALL") {
      return articles;
    }

    return articles.filter((article) => article.status === filter);
  }, [articles, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleCreate = () => {
    if (!selectedCategory) {
      setMessage("请先创建一个新闻分类。");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          category: selectedCategory,
          status: "DRAFT",
        }),
      });

      const payload = (await response.json()) as { message?: string; slug?: string };

      if (!response.ok || !payload.slug) {
        setMessage(payload.message ?? "新闻创建失败。");
        return;
      }

      router.push(`/editor/newsroom/${payload.slug}`);
      router.refresh();
    });
  };

  const handleDeleteArticle = (article: SiteNewsSummary) => {
    const confirmed = window.confirm(`确认删除“${article.title}”吗？删除后无法恢复。`);

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/news/${article.slug}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(payload.message ?? "新闻删除失败。");
        return;
      }

      const nextArticles = articles.filter((item) => item.slug !== article.slug);
      const nextFilteredCount =
        filter === "ALL"
          ? nextArticles.length
          : nextArticles.filter((item) => item.status === filter).length;
      const nextTotalPages = Math.max(1, Math.ceil(nextFilteredCount / pageSize));

      setArticles(nextArticles);
      setCategories((current) =>
        current.map((item) =>
          item.name === article.category
            ? { ...item, articleCount: Math.max(0, item.articleCount - 1) }
            : item,
        ),
      );
      setPage((value) => Math.min(value, nextTotalPages));
      setMessage(`已删除新闻“${article.title}”。`);
      router.refresh();
    });
  };

  const handleCreateCategory = () => {
    if (!categoryDraft.trim()) {
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/news/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: categoryDraft,
        }),
      });
      const payload = (await response.json()) as SiteNewsCategory & { message?: string };

      if (!response.ok || !payload.id) {
        setMessage(payload.message ?? "分类创建失败。");
        return;
      }

      const nextCategories = [...categories, payload].sort((left, right) =>
        left.name.localeCompare(right.name, "zh-CN"),
      );
      setCategories(nextCategories);
      setSelectedCategory(payload.name);
      setCategoryDraft("");
      setMessage(`已创建分类“${payload.name}”。`);
    });
  };

  const handleUpdateCategory = (category: SiteNewsCategory) => {
    const nextName = editingCategoryName.trim();

    if (!nextName) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/news/categories/${category.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nextName,
        }),
      });
      const payload = (await response.json()) as SiteNewsCategory & { message?: string };

      if (!response.ok || !payload.id) {
        setMessage(payload.message ?? "分类更新失败。");
        return;
      }

      setCategories((current) =>
        current
          .map((item) => (item.id === payload.id ? payload : item))
          .sort((left, right) => left.name.localeCompare(right.name, "zh-CN")),
      );
      setArticles((current) =>
        current.map((item) =>
          item.category === category.name ? { ...item, category: payload.name } : item,
        ),
      );
      if (selectedCategory === category.name) {
        setSelectedCategory(payload.name);
      }
      setEditingCategoryId(null);
      setEditingCategoryName("");
      setMessage(`已更新分类为“${payload.name}”。`);
    });
  };

  const handleDeleteCategory = (category: SiteNewsCategory) => {
    const confirmed = window.confirm(`确认删除分类“${category.name}”吗？`);

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/news/categories/${category.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(payload.message ?? "分类删除失败。");
        return;
      }

      const nextCategories = categories.filter((item) => item.id !== category.id);
      setCategories(nextCategories);
      if (selectedCategory === category.name) {
        setSelectedCategory(nextCategories[0]?.name ?? "");
      }
      setMessage(`已删除分类“${category.name}”。`);
    });
  };

  const filterOptions: Array<{ key: SiteNewsStatus | "ALL"; label: string }> = [
    { key: "ALL", label: "全部" },
    { key: "DRAFT", label: "草稿" },
    { key: "PUBLISHED", label: "已发布" },
  ];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef2f8_0%,#f7f9fc_100%)] px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-xl border border-slate-200 bg-slate-950 px-6 py-6 text-white shadow-lg">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">内容中心</p>
              <h1 className="mt-3 text-3xl font-semibold">新闻中心</h1>
              <p className="mt-3 text-sm text-slate-300">{message}</p>
            </div>
            <div className="flex flex-wrap items-start gap-3">
              <Link
                className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white"
                href="/editor"
                style={{ color: "#ffffff" }}
              >
                返回页面管理
              </Link>
              <AdminLogoutButton />
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">新建新闻</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">创建一篇新闻</h2>
              </div>

              <div className="mt-6 space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">新闻标题</span>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-indigo-700"
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="例如：公司完成年度产品升级发布"
                    value={title}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">新闻分类</span>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-indigo-700"
                    onChange={(event) => setSelectedCategory(event.target.value)}
                    value={selectedCategory}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  className="w-full rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={isSubmitting || !title.trim() || categories.length === 0}
                  onClick={handleCreate}
                  type="button"
                >
                  {isSubmitting ? "创建中..." : "创建草稿新闻"}
                </button>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">新闻分类</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">分类管理</h2>
                </div>
                <span className="text-sm text-slate-500">{categories.length} 个</span>
              </div>

              <div className="mt-5 flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-indigo-700"
                  onChange={(event) => setCategoryDraft(event.target.value)}
                  placeholder="新增分类名称"
                  value={categoryDraft}
                />
                <button
                  className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={isSubmitting || !categoryDraft.trim()}
                  onClick={handleCreateCategory}
                  type="button"
                >
                  新增
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {categories.map((category) => {
                  const isEditing = editingCategoryId === category.id;

                  return (
                    <div
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                      key={category.id}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        {isEditing ? (
                          <input
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-indigo-700"
                            onChange={(event) => setEditingCategoryName(event.target.value)}
                            value={editingCategoryName}
                          />
                        ) : (
                          <p className="flex-1 text-sm font-medium text-slate-900">
                            {category.name}
                          </p>
                        )}

                        <span className="rounded-md bg-white px-2.5 py-1 text-xs text-slate-500">
                          {category.articleCount} 篇
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <button
                              className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-medium text-white"
                              disabled={isSubmitting || !editingCategoryName.trim()}
                              onClick={() => handleUpdateCategory(category)}
                              type="button"
                            >
                              保存
                            </button>
                            <button
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600"
                              onClick={() => {
                                setEditingCategoryId(null);
                                setEditingCategoryName("");
                              }}
                              type="button"
                            >
                              取消
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600"
                              onClick={() => {
                                setEditingCategoryId(category.id);
                                setEditingCategoryName(category.name);
                              }}
                              type="button"
                            >
                              编辑
                            </button>
                            <button
                              className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={isSubmitting || category.articleCount > 0}
                              onClick={() => handleDeleteCategory(category)}
                              type="button"
                            >
                              删除
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">新闻列表</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">已创建新闻</h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {filterOptions.map((option) => {
                  const isActive = option.key === filter;
                  return (
                    <button
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-slate-950 text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                      key={option.key}
                      onClick={() => {
                        setFilter(option.key);
                        setPage(1);
                      }}
                      type="button"
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
              <span>共 {filteredArticles.length} 篇</span>
              <span>
                第 {currentPage} / {totalPages} 页
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              {paginatedArticles.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                  当前筛选下还没有新闻。
                </div>
              ) : null}

              {paginatedArticles.map((article) => (
                <article
                  className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[220px_minmax(0,1fr)_160px]"
                  key={article.id}
                >
                  <img
                    alt={article.title}
                    className="h-36 w-full rounded-lg object-cover"
                    src={article.coverImage}
                  />

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white">
                        {article.category}
                      </span>
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                          article.status === "PUBLISHED"
                            ? "bg-indigo-100 text-indigo-900"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {article.status === "PUBLISHED" ? "已发布" : "草稿"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(article.publishedAt)}
                      </span>
                    </div>

                    <h3 className="mt-3 text-xl font-semibold text-slate-950">{article.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{article.summary}</p>
                  </div>

                  <div className="flex flex-col items-stretch gap-2 md:items-end">
                    <Link
                      className="inline-flex justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white"
                      href={`/editor/newsroom/${article.slug}`}
                      style={{ color: "#ffffff" }}
                    >
                      编辑
                    </Link>
                    <button
                      className="inline-flex justify-center rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isSubmitting}
                      onClick={() => handleDeleteArticle(article)}
                      type="button"
                    >
                      删除
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                type="button"
              >
                上一页
              </button>
              <button
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                disabled={currentPage === totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                type="button"
              >
                下一页
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
