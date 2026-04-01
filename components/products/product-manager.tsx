/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { BrandThemeSwitcher } from "@/components/theme/brand-theme-switcher";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type {
  SiteProductCategory,
  SiteProductStatus,
  SiteProductSummary,
} from "@/lib/products/contracts";

type ProductManagerProps = {
  initialProducts: SiteProductSummary[];
  initialCategories: SiteProductCategory[];
};

type ConfirmDialogState = {
  title: string;
  description: string;
  actionLabel: string;
  onConfirm: () => void;
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

export function ProductManager({
  initialProducts,
  initialCategories,
}: ProductManagerProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategories[0]?.name ?? "核心产品",
  );
  const [categoryDraft, setCategoryDraft] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [filter, setFilter] = useState<SiteProductStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("在这里管理产品列表、分类、草稿和详情页内容。");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogState, setConfirmDialogState] = useState<ConfirmDialogState | null>(
    null,
  );
  const [isSubmitting, startTransition] = useTransition();

  const filteredProducts = useMemo(() => {
    if (filter === "ALL") {
      return products;
    }

    return products.filter((product) => product.status === filter);
  }, [products, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleCreate = () => {
    if (!selectedCategory) {
      setMessage("请先创建一个产品分类。");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/products", {
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
        setMessage(payload.message ?? "产品创建失败。");
        return;
      }

      router.push(`/editor/products/${payload.slug}`);
      router.refresh();
    });
  };

  const handleDeleteProduct = (product: SiteProductSummary) => {
    setConfirmDialogState({
      title: "删除产品",
      description: `确认删除“${product.title}”吗？删除后不可恢复。`,
      actionLabel: "确认删除",
      onConfirm: () => {
        startTransition(async () => {
          const response = await fetch(`/api/products/${product.slug}`, {
            method: "DELETE",
          });
          const payload = (await response.json()) as { message?: string };

          if (!response.ok) {
            setMessage(payload.message ?? "产品删除失败。");
            return;
          }

          const nextProducts = products.filter((item) => item.slug !== product.slug);
          const nextFilteredCount =
            filter === "ALL"
              ? nextProducts.length
              : nextProducts.filter((item) => item.status === filter).length;
          const nextTotalPages = Math.max(1, Math.ceil(nextFilteredCount / pageSize));

          setProducts(nextProducts);
          setCategories((current) =>
            current.map((item) =>
              item.name === product.category
                ? { ...item, productCount: Math.max(0, item.productCount - 1) }
                : item,
            ),
          );
          setPage((value) => Math.min(value, nextTotalPages));
          setMessage(`已删除产品“${product.title}”。`);
          router.refresh();
        });
      },
    });
    setConfirmDialogOpen(true);
  };

  const handleCreateCategory = () => {
    if (!categoryDraft.trim()) {
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/products/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: categoryDraft,
        }),
      });
      const payload = (await response.json()) as SiteProductCategory & {
        message?: string;
      };

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

  const handleUpdateCategory = (category: SiteProductCategory) => {
    const nextName = editingCategoryName.trim();

    if (!nextName) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/products/categories/${category.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nextName,
        }),
      });
      const payload = (await response.json()) as SiteProductCategory & {
        message?: string;
      };

      if (!response.ok || !payload.id) {
        setMessage(payload.message ?? "分类更新失败。");
        return;
      }

      setCategories((current) =>
        current
          .map((item) => (item.id === payload.id ? payload : item))
          .sort((left, right) => left.name.localeCompare(right.name, "zh-CN")),
      );
      setProducts((current) =>
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

  const handleDeleteCategory = (category: SiteProductCategory) => {
    setConfirmDialogState({
      title: "删除分类",
      description: `确认删除分类“${category.name}”吗？`,
      actionLabel: "确认删除",
      onConfirm: () => {
        startTransition(async () => {
          const response = await fetch(`/api/products/categories/${category.id}`, {
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
      },
    });
    setConfirmDialogOpen(true);
  };

  const filterOptions: Array<{ key: SiteProductStatus | "ALL"; label: string }> = [
    { key: "ALL", label: "全部" },
    { key: "DRAFT", label: "草稿" },
    { key: "PUBLISHED", label: "已发布" },
  ];

  return (
    <main className="min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                内容中心
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">产品中心</h1>
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">{message}</p>
            </div>
            <div className="flex flex-wrap items-start gap-3">
              <Link
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted)]"
                href="/editor"
              >
                返回页面管理
              </Link>
              <Link
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted)]"
                href="/editor/content"
              >
                内容中心
              </Link>
              <BrandThemeSwitcher />
              <AdminLogoutButton className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted)]" />
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">新建产品</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">创建一个产品</h2>
              </div>

              <div className="mt-6 space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">产品标题</span>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[var(--ring)]"
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="例如：企业官网解决方案"
                    value={title}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">产品分类</span>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[var(--ring)]"
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
                  className="w-full rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting || !title.trim() || categories.length === 0}
                  onClick={handleCreate}
                  type="button"
                >
                  {isSubmitting ? "创建中..." : "创建草稿产品"}
                </button>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">产品分类</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">分类管理</h2>
                </div>
                <span className="text-sm text-slate-500">{categories.length} 个</span>
              </div>

              <div className="mt-5 flex gap-2">
                <input
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[var(--ring)]"
                  onChange={(event) => setCategoryDraft(event.target.value)}
                  placeholder="新增分类，例如：解决方案"
                  value={categoryDraft}
                />
                <button
                  className="rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-medium text-[var(--primary-foreground)] transition hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting || !categoryDraft.trim()}
                  onClick={handleCreateCategory}
                  type="button"
                >
                  添加
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {categories.map((category) => {
                  const isEditing = editingCategoryId === category.id;

                  return (
                    <div
                      className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                      key={category.id}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          {isEditing ? (
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-[var(--ring)]"
                              onChange={(event) => setEditingCategoryName(event.target.value)}
                              value={editingCategoryName}
                            />
                          ) : (
                            <p className="text-sm font-semibold text-slate-950">{category.name}</p>
                          )}
                          <p className="mt-1 text-xs text-slate-500">
                            {category.productCount} 个产品
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {isEditing ? (
                            <>
                              <button
                                className="rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-medium text-[var(--primary-foreground)]"
                                onClick={() => handleUpdateCategory(category)}
                                type="button"
                              >
                                保存
                              </button>
                              <button
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600"
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
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600"
                                onClick={() => {
                                  setEditingCategoryId(category.id);
                                  setEditingCategoryName(category.name);
                                }}
                                type="button"
                              >
                                重命名
                              </button>
                              <button
                                className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700"
                                onClick={() => handleDeleteCategory(category)}
                                type="button"
                              >
                                删除
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">产品列表</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">所有产品</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <button
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      filter === option.key
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
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
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {paginatedProducts.map((product) => (
                <article
                  className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[180px_minmax(0,1fr)]"
                  key={product.slug}
                >
                  <img
                    alt={product.title}
                    className="h-40 w-full rounded-lg object-cover"
                    src={product.coverImage}
                  />
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {product.category}
                        </span>
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                            product.status === "PUBLISHED"
                              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {product.status === "PUBLISHED" ? "已发布" : "草稿"}
                        </span>
                      </div>
                      <h3 className="mt-3 text-xl font-semibold text-slate-950">
                        {product.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{product.summary}</p>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <p className="text-sm text-slate-500">
                        最近更新：{formatDate(product.publishedAt ?? product.updatedAt)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.status === "PUBLISHED" ? (
                          <Link
                            className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            href={`/products/${product.slug}`}
                          >
                            预览
                          </Link>
                        ) : (
                          <span className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400">
                            未发布
                          </span>
                        )}
                        <Link
                          className="inline-flex items-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
                          href={`/editor/products/${product.slug}`}
                        >
                          进入编辑
                        </Link>
                        <button
                          className="inline-flex items-center rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700"
                          onClick={() => handleDeleteProduct(product)}
                          type="button"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm leading-7 text-slate-500">
                当前筛选下还没有产品，先从左侧创建一个草稿产品吧。
              </div>
            ) : null}

            {totalPages > 1 ? (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                  disabled={currentPage === 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  type="button"
                >
                  上一页
                </button>
                <span className="text-sm text-slate-500">
                  第 {currentPage} / {totalPages} 页
                </span>
                <button
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  type="button"
                >
                  下一页
                </button>
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <AlertDialog
        onOpenChange={(open) => {
          setConfirmDialogOpen(open);
          if (!open) {
            setConfirmDialogState(null);
          }
        }}
        open={confirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialogState?.title ?? "确认操作"}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialogState?.description ?? "请确认是否继续执行该操作。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="inline-flex h-9 items-center rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--foreground)]">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              className="inline-flex h-9 items-center rounded-md bg-rose-600 px-3 text-sm font-medium text-white transition hover:bg-rose-700"
              onClick={() => {
                const action = confirmDialogState?.onConfirm;
                setConfirmDialogOpen(false);
                setConfirmDialogState(null);
                action?.();
              }}
            >
              {confirmDialogState?.actionLabel ?? "确认"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
