/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { EditorFlowNav } from "@/components/builder/editor-flow-nav";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type {
  SiteNewsCategory,
  SiteNewsStatus,
  SiteNewsSummary,
} from "@/lib/news/contracts";
import type {
  SiteProductCategory,
  SiteProductStatus,
  SiteProductSummary,
} from "@/lib/products/contracts";

type ContentHubProps = {
  initialProducts: SiteProductSummary[];
  initialNewsArticles: SiteNewsSummary[];
  productCategories: SiteProductCategory[];
  newsCategories: SiteNewsCategory[];
  editorHref?: string;
};

type HubSection =
  | "overview"
  | "products"
  | "news"
  | "product-categories"
  | "news-categories"
  | "product-editor"
  | "news-editor";
type RowStatus = SiteProductStatus | SiteNewsStatus;
type CategoryKind = "products" | "news";
type CategoryDialogMode = "create" | "rename";
type EditTarget =
  | {
      kind: "products";
      slug: string;
      title: string;
    }
  | {
      kind: "news";
      slug: string;
      title: string;
    };
type ConfirmDialogState = {
  title: string;
  description: string;
  actionLabel: string;
  onConfirm: () => void;
};

const pageSize = 8;

function formatDate(value: string | null) {
  if (!value) {
    return "未发布";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getStatusClass(status: RowStatus) {
  return status === "PUBLISHED"
    ? "bg-[var(--primary-soft)] text-[var(--primary-strong)]"
    : "bg-amber-100 text-amber-900";
}

function buildDraftName(prefix: string) {
  const now = new Date();
  const date = [
    now.getFullYear(),
    `${now.getMonth() + 1}`.padStart(2, "0"),
    `${now.getDate()}`.padStart(2, "0"),
  ].join("");
  const seed = `${Math.floor(Math.random() * 900) + 100}`;
  return `${prefix}${date}${seed}`;
}

export function ContentHub({
  initialProducts,
  initialNewsArticles,
  productCategories,
  newsCategories,
  editorHref = "/editor",
}: ContentHubProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [newsArticles, setNewsArticles] = useState(initialNewsArticles);
  const [productCategoriesState, setProductCategoriesState] = useState(productCategories);
  const [newsCategoriesState, setNewsCategoriesState] = useState(newsCategories);
  const [activeSection, setActiveSection] = useState<HubSection>("overview");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | RowStatus>("ALL");
  const [productCategoryFilter, setProductCategoryFilter] = useState("ALL");
  const [newsCategoryFilter, setNewsCategoryFilter] = useState("ALL");
  const [productPage, setProductPage] = useState(1);
  const [newsPage, setNewsPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [editorReturnSection, setEditorReturnSection] = useState<"products" | "news">(
    "products",
  );
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryDialogMode, setCategoryDialogMode] =
    useState<CategoryDialogMode>("create");
  const [categoryDialogKind, setCategoryDialogKind] = useState<CategoryKind>("products");
  const [categoryDialogName, setCategoryDialogName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryOriginalName, setEditingCategoryOriginalName] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogState, setConfirmDialogState] =
    useState<ConfirmDialogState | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  const stats = useMemo(() => {
    const publishedProducts = products.filter((item) => item.status === "PUBLISHED").length;
    const publishedNews = newsArticles.filter((item) => item.status === "PUBLISHED").length;

    return {
      products: products.length,
      news: newsArticles.length,
      publishedProducts,
      publishedNews,
    };
  }, [newsArticles, products]);

  const productCategorySummary = useMemo(() => {
    const countMap = new Map<string, number>();

    products.forEach((item) => {
      countMap.set(item.category, (countMap.get(item.category) ?? 0) + 1);
    });

    const rows = productCategoriesState.map((category) => ({
      id: category.id,
      name: category.name,
      count: countMap.get(category.name) ?? category.productCount ?? 0,
    }));

    countMap.forEach((count, name) => {
      if (!rows.some((row) => row.name === name)) {
        rows.push({
          id: `virtual-product-${name}`,
          name,
          count,
        });
      }
    });

    return rows.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [productCategoriesState, products]);

  const newsCategorySummary = useMemo(() => {
    const countMap = new Map<string, number>();

    newsArticles.forEach((item) => {
      countMap.set(item.category, (countMap.get(item.category) ?? 0) + 1);
    });

    const rows = newsCategoriesState.map((category) => ({
      id: category.id,
      name: category.name,
      count: countMap.get(category.name) ?? category.articleCount ?? 0,
    }));

    countMap.forEach((count, name) => {
      if (!rows.some((row) => row.name === name)) {
        rows.push({
          id: `virtual-news-${name}`,
          name,
          count,
        });
      }
    });

    return rows.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [newsArticles, newsCategoriesState]);

  const filteredProducts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return products.filter((item) => {
      const statusMatch = statusFilter === "ALL" ? true : item.status === statusFilter;
      const categoryMatch =
        productCategoryFilter === "ALL" ? true : item.category === productCategoryFilter;
      const keywordMatch = normalizedKeyword
        ? item.title.toLowerCase().includes(normalizedKeyword) ||
          item.category.toLowerCase().includes(normalizedKeyword)
        : true;

      return statusMatch && categoryMatch && keywordMatch;
    });
  }, [keyword, productCategoryFilter, products, statusFilter]);

  const filteredNews = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return newsArticles.filter((item) => {
      const statusMatch = statusFilter === "ALL" ? true : item.status === statusFilter;
      const categoryMatch = newsCategoryFilter === "ALL" ? true : item.category === newsCategoryFilter;
      const keywordMatch = normalizedKeyword
        ? item.title.toLowerCase().includes(normalizedKeyword) ||
          item.category.toLowerCase().includes(normalizedKeyword)
        : true;

      return statusMatch && categoryMatch && keywordMatch;
    });
  }, [keyword, newsArticles, newsCategoryFilter, statusFilter]);

  const productTotalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safeProductPage = Math.min(productPage, productTotalPages);
  const paginatedProducts = filteredProducts.slice(
    (safeProductPage - 1) * pageSize,
    safeProductPage * pageSize,
  );

  const newsTotalPages = Math.max(1, Math.ceil(filteredNews.length / pageSize));
  const safeNewsPage = Math.min(newsPage, newsTotalPages);
  const paginatedNews = filteredNews.slice(
    (safeNewsPage - 1) * pageSize,
    safeNewsPage * pageSize,
  );

  const visibleRows =
    activeSection === "products"
      ? paginatedProducts.map((item) => item.id)
      : paginatedNews.map((item) => item.id);

  const allVisibleSelected =
    visibleRows.length > 0 && visibleRows.every((rowId) => selectedIds.includes(rowId));

  const resetTableControls = (nextSection: HubSection) => {
    setActiveSection(nextSection);
    if (nextSection !== "product-editor" && nextSection !== "news-editor") {
      setEditTarget(null);
    }
    setSelectedIds([]);
    setKeyword("");
    setStatusFilter("ALL");
    setProductCategoryFilter("ALL");
    setNewsCategoryFilter("ALL");
  };

  const refreshProducts = async () => {
    const response = await fetch("/api/products", { cache: "no-store" });

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as SiteProductSummary[];
    setProducts(payload);
    return true;
  };

  const refreshNews = async () => {
    const response = await fetch("/api/news", { cache: "no-store" });

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as SiteNewsSummary[];
    setNewsArticles(payload);
    return true;
  };

  const refreshProductCategories = async () => {
    const response = await fetch("/api/products/categories", { cache: "no-store" });

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as SiteProductCategory[];
    setProductCategoriesState(payload);
    return true;
  };

  const refreshNewsCategories = async () => {
    const response = await fetch("/api/news/categories", { cache: "no-store" });

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as SiteNewsCategory[];
    setNewsCategoriesState(payload);
    return true;
  };

  const handleCreateProduct = () => {
    const defaultTitle = buildDraftName("新产品-");
    const title = defaultTitle;
    const defaultCategory = productCategoriesState[0]?.name ?? "核心产品";

    startTransition(async () => {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          category: defaultCategory,
          status: "DRAFT",
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
        slug?: string;
      };

      if (!response.ok) {
        setMessage(payload.message ?? "产品创建失败。");
        return;
      }

      await refreshProducts();
      setMessage("");
      if (payload.slug) {
        setEditTarget({
          kind: "products",
          slug: payload.slug,
          title,
        });
        setEditorReturnSection("products");
        setActiveSection("product-editor");
      }
      router.refresh();
    });
  };

  const handleCreateNews = () => {
    const defaultTitle = buildDraftName("新资讯-");
    const title = defaultTitle;
    const defaultCategory = newsCategoriesState[0]?.name ?? "品牌动态";

    startTransition(async () => {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          category: defaultCategory,
          status: "DRAFT",
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
        slug?: string;
      };

      if (!response.ok) {
        setMessage(payload.message ?? "资讯创建失败。");
        return;
      }

      await refreshNews();
      setMessage("");
      if (payload.slug) {
        setEditTarget({
          kind: "news",
          slug: payload.slug,
          title,
        });
        setEditorReturnSection("news");
        setActiveSection("news-editor");
      }
      router.refresh();
    });
  };

  const executeDeleteRow = (kind: CategoryKind, slug: string) => {
    const endpoint = kind === "products" ? "products" : "news";
    const label = kind === "products" ? "产品" : "资讯";
    startTransition(async () => {
      const response = await fetch(`/api/${endpoint}/${slug}`, {
        method: "DELETE",
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        setMessage(payload.message ?? `${label}删除失败。`);
        return;
      }

      if (kind === "products") {
        await refreshProducts();
      } else {
        await refreshNews();
      }

      setSelectedIds((current) =>
        current.filter((id) =>
          kind === "products"
            ? products.find((item) => item.id === id)?.slug !== slug
            : newsArticles.find((item) => item.id === id)?.slug !== slug,
        ),
      );
      setMessage(`${label}已删除。`);
      router.refresh();
    });
  };

  const handleDeleteRow = (kind: CategoryKind, slug: string) => {
    const label = kind === "products" ? "产品" : "资讯";
    setConfirmDialogState({
      title: `删除${label}`,
      description: `确认删除这条${label}吗？删除后不可恢复。`,
      actionLabel: "确认删除",
      onConfirm: () => executeDeleteRow(kind, slug),
    });
    setConfirmDialogOpen(true);
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      setMessage("请先勾选至少一条数据。");
      return;
    }

    const kind = activeSection === "products" ? "products" : "news";
    const label = kind === "products" ? "产品" : "资讯";
    const rows =
      kind === "products"
        ? products.filter((item) => selectedIds.includes(item.id))
        : newsArticles.filter((item) => selectedIds.includes(item.id));

    setConfirmDialogState({
      title: `批量删除${label}`,
      description: `确认批量删除选中的 ${rows.length} 条${label}吗？`,
      actionLabel: "确认删除",
      onConfirm: () => {
        startTransition(async () => {
          const endpoint = kind === "products" ? "products" : "news";
          const results = await Promise.all(
            rows.map((item) =>
              fetch(`/api/${endpoint}/${item.slug}`, {
                method: "DELETE",
              }),
            ),
          );
          const failedCount = results.filter((result) => !result.ok).length;

          if (kind === "products") {
            await refreshProducts();
          } else {
            await refreshNews();
          }

          setSelectedIds([]);
          setMessage(
            failedCount === 0
              ? `已删除 ${rows.length} 条${label}。`
              : `删除完成，成功 ${rows.length - failedCount} 条，失败 ${failedCount} 条。`,
          );
          router.refresh();
        });
      },
    });
    setConfirmDialogOpen(true);
  };

  const toggleAllVisibleRows = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) => current.filter((id) => !visibleRows.includes(id)));
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...visibleRows])));
  };

  const toggleRowSelection = (rowId: string) => {
    setSelectedIds((current) =>
      current.includes(rowId)
        ? current.filter((id) => id !== rowId)
        : [...current, rowId],
    );
  };

  const handleCreateCategory = (kind: CategoryKind) => {
    setCategoryDialogMode("create");
    setCategoryDialogKind(kind);
    setCategoryDialogName("");
    setEditingCategoryId(null);
    setEditingCategoryOriginalName("");
    setCategoryDialogOpen(true);
  };

  const handleRenameCategory = (
    kind: CategoryKind,
    id: string,
    currentName: string,
  ) => {
    setCategoryDialogMode("rename");
    setCategoryDialogKind(kind);
    setCategoryDialogName(currentName);
    setEditingCategoryId(id);
    setEditingCategoryOriginalName(currentName);
    setCategoryDialogOpen(true);
  };

  const closeCategoryDialog = () => {
    setCategoryDialogOpen(false);
    setCategoryDialogName("");
    setEditingCategoryId(null);
    setEditingCategoryOriginalName("");
  };

  const handleSubmitCategoryDialog = () => {
    const name = categoryDialogName.trim();
    const label = categoryDialogKind === "products" ? "产品分类" : "资讯分类";

    if (!name) {
      setMessage(`请输入${label}名称。`);
      return;
    }

    if (categoryDialogMode === "rename" && name === editingCategoryOriginalName) {
      closeCategoryDialog();
      return;
    }

    if (categoryDialogMode === "rename" && !editingCategoryId) {
      setMessage("分类ID无效，请重试。");
      return;
    }

    startTransition(async () => {
      const endpoint =
        categoryDialogKind === "products"
          ? categoryDialogMode === "create"
            ? "/api/products/categories"
            : `/api/products/categories/${editingCategoryId}`
          : categoryDialogMode === "create"
            ? "/api/news/categories"
            : `/api/news/categories/${editingCategoryId}`;
      const method = categoryDialogMode === "create" ? "POST" : "PATCH";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        setMessage(
          payload.message ??
            (categoryDialogMode === "create" ? `${label}创建失败。` : `${label}更新失败。`),
        );
        return;
      }

      if (categoryDialogKind === "products") {
        await Promise.all([refreshProductCategories(), refreshProducts()]);
        if (
          categoryDialogMode === "rename" &&
          productCategoryFilter === editingCategoryOriginalName
        ) {
          setProductCategoryFilter(name);
        }
      } else {
        await Promise.all([refreshNewsCategories(), refreshNews()]);
        if (
          categoryDialogMode === "rename" &&
          newsCategoryFilter === editingCategoryOriginalName
        ) {
          setNewsCategoryFilter(name);
        }
      }

      setMessage(
        categoryDialogMode === "create"
          ? `${label}“${name}”已创建。`
          : `${label}已更新为“${name}”。`,
      );
      closeCategoryDialog();
      router.refresh();
    });
  };

  const handleDeleteCategory = (kind: "products" | "news", id: string, name: string) => {
    const label = kind === "products" ? "产品分类" : "资讯分类";

    setConfirmDialogState({
      title: `删除${label}`,
      description: `确认删除${label}“${name}”吗？`,
      actionLabel: "确认删除",
      onConfirm: () => {
        startTransition(async () => {
          const endpoint =
            kind === "products" ? `/api/products/categories/${id}` : `/api/news/categories/${id}`;
          const response = await fetch(endpoint, { method: "DELETE" });
          const payload = (await response.json().catch(() => ({}))) as { message?: string };

          if (!response.ok) {
            setMessage(payload.message ?? `${label}删除失败。`);
            return;
          }

          if (kind === "products") {
            await refreshProductCategories();
            if (productCategoryFilter === name) {
              setProductCategoryFilter("ALL");
            }
          } else {
            await refreshNewsCategories();
            if (newsCategoryFilter === name) {
              setNewsCategoryFilter("ALL");
            }
          }

          setMessage(`${label}“${name}”已删除。`);
          router.refresh();
        });
      },
    });
    setConfirmDialogOpen(true);
  };

  const handleOpenEditor = (target: EditTarget, sourceSection: "products" | "news") => {
    setEditTarget(target);
    setEditorReturnSection(sourceSection);
    setActiveSection(target.kind === "products" ? "product-editor" : "news-editor");
  };

  const handleCloseEditor = () => {
    const closedTarget = editTarget;
    setEditTarget(null);
    setActiveSection(editorReturnSection);

    if (!closedTarget) {
      return;
    }

    startTransition(async () => {
      if (closedTarget.kind === "products") {
        await Promise.all([refreshProducts(), refreshProductCategories()]);
      } else {
        await Promise.all([refreshNews(), refreshNewsCategories()]);
      }
      router.refresh();
    });
  };

  const categoryDialogLabel =
    categoryDialogKind === "products" ? "产品分类" : "资讯分类";

  return (
    <main className="editor-radius-half min-h-screen bg-[var(--background)] lg:h-screen lg:overflow-hidden">
      <EditorFlowNav activeStep="content" editorHref={editorHref} />
      <div className="grid min-h-screen lg:h-full lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-[var(--border)] bg-[var(--card)] px-3 py-4 lg:h-full lg:overflow-hidden lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col">
            <div className="rounded-lg bg-[var(--muted)] px-3 py-2">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--primary-strong)]">
                Content
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[var(--foreground)]">内容后台</h2>
            </div>

            <div className="mt-4 space-y-1.5">
              <button
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  activeSection === "overview"
                    ? "bg-[var(--primary-soft)] text-[var(--primary-strong)]"
                    : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
                onClick={() => resetTableControls("overview")}
                type="button"
              >
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden>◈</span>
                  控制台
                </span>
              </button>
              <button
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  activeSection === "products" || activeSection === "product-editor"
                    ? "bg-[var(--primary-soft)] text-[var(--primary-strong)]"
                    : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
                onClick={() => resetTableControls("products")}
                type="button"
              >
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden>▦</span>
                  产品中心
                </span>
                <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                  {products.length}
                </span>
              </button>
              <button
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  activeSection === "news" || activeSection === "news-editor"
                    ? "bg-[var(--primary-soft)] text-[var(--primary-strong)]"
                    : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
                onClick={() => resetTableControls("news")}
                type="button"
              >
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden>▤</span>
                  资讯中心
                </span>
                <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                  {newsArticles.length}
                </span>
              </button>
              <button
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  activeSection === "product-categories"
                    ? "bg-[var(--primary-soft)] text-[var(--primary-strong)]"
                    : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
                onClick={() => resetTableControls("product-categories")}
                type="button"
              >
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden>▥</span>
                  产品分类
                </span>
                <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                  {productCategorySummary.length}
                </span>
              </button>
              <button
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  activeSection === "news-categories"
                    ? "bg-[var(--primary-soft)] text-[var(--primary-strong)]"
                    : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
                onClick={() => resetTableControls("news-categories")}
                type="button"
              >
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden>▧</span>
                  资讯分类
                </span>
                <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                  {newsCategorySummary.length}
                </span>
              </button>
            </div>

            <div className="mt-4 grid gap-2 lg:mt-auto">
              <div className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1.5">
                <span className="text-xs text-[var(--muted-foreground)]">主题</span>
                <BrandThemeSwitcher />
              </div>
              <AdminLogoutButton className="inline-flex h-8 w-full items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-xs font-medium text-[var(--foreground)] transition hover:bg-[var(--muted)]" />
            </div>
          </div>
        </aside>

        <section
          className={`min-w-0 px-4 py-4 md:px-5 md:py-5 lg:h-full ${
            activeSection === "product-editor" || activeSection === "news-editor"
              ? "lg:overflow-hidden"
              : "lg:overflow-y-auto"
          }`}
        >
          <div
            className={`space-y-4 ${
              activeSection === "product-editor" || activeSection === "news-editor"
                ? "lg:flex lg:h-full lg:min-h-0 lg:flex-col"
                : ""
            }`}
          >
            {activeSection === "overview" ? (
              <header className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--primary-soft)_0%,#f8fafc_100%)] text-3xl">
                    👩
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                      控制台
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold text-[var(--foreground)] md:text-[2.1rem]">
                      晚上好 admin，愿你天黑有灯，下雨有伞。
                    </h1>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                      今日待处理：
                      <span className="text-[var(--foreground)]">
                        {" "}产品草稿 {stats.products - stats.publishedProducts} 条
                      </span>
                      ·
                      <span className="ml-1 text-[var(--foreground)]">
                        资讯草稿 {stats.news - stats.publishedNews} 条
                      </span>
                    </p>
                  </div>
                </div>
              </header>
            ) : null}

            {message ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
                {message}
              </div>
            ) : null}

            {activeSection === "overview" ? (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "产品总数", value: stats.products, sub: `已发布 ${stats.publishedProducts}` },
                    { label: "资讯总数", value: stats.news, sub: `已发布 ${stats.publishedNews}` },
                    { label: "产品分类", value: productCategorySummary.length, sub: "支持自定义分类" },
                    { label: "资讯分类", value: newsCategorySummary.length, sub: "支持自定义分类" },
                  ].map((item, index) => (
                    <article
                      className={`rounded-xl border border-[var(--border)] px-4 py-4 ${
                        index === 0
                          ? "bg-[linear-gradient(135deg,var(--primary)_0%,var(--primary-strong)_100%)] text-[var(--primary-foreground)]"
                          : "bg-[var(--card)]"
                      }`}
                      key={item.label}
                    >
                      <p
                        className={`text-xs ${
                          index === 0
                            ? "text-[color-mix(in_srgb,var(--primary-foreground)_80%,transparent)]"
                            : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {item.label}
                      </p>
                      <p className="mt-2 text-4xl font-semibold">{item.value}</p>
                      <p
                        className={`mt-2 text-xs ${
                          index === 0
                            ? "text-[color-mix(in_srgb,var(--primary-foreground)_85%,transparent)]"
                            : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {item.sub}
                      </p>
                    </article>
                  ))}
                </div>

                <div className="grid gap-3 xl:grid-cols-2">
                  <article className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-lg font-semibold leading-tight text-[var(--foreground)]">最新产品</h2>
                      <button
                        className="text-base font-semibold text-[var(--primary-strong)]"
                        onClick={() => resetTableControls("products")}
                        type="button"
                      >
                        进入管理
                      </button>
                    </div>
                    <div className="space-y-3">
                      {products.slice(0, 3).map((item) => (
                        <article
                          className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4"
                          key={item.id}
                        >
                          <div className="flex gap-4">
                            <img
                              alt={item.title}
                              className="h-28 w-32 shrink-0 rounded-lg object-cover"
                              src={item.coverImage}
                            />
                            <div className="min-w-0 flex-1">
                                <p className="line-clamp-1 text-lg font-semibold leading-tight text-[var(--foreground)]">
                                  {item.title}
                                </p>
                              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted-foreground)]">
                                {item.summary}
                              </p>
                              <div className="mt-2 flex items-center justify-between gap-3">
                                <p className="text-sm text-[var(--muted-foreground)]">
                                  分类：{item.category}
                                </p>
                                <span
                                  className={`rounded-md px-2 py-0.5 text-xs font-medium ${getStatusClass(item.status)}`}
                                >
                                  {item.status === "PUBLISHED" ? "已发布" : "草稿"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </article>

                  <article className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-lg font-semibold leading-tight text-[var(--foreground)]">最新资讯</h2>
                      <button
                        className="text-base font-semibold text-[var(--primary-strong)]"
                        onClick={() => resetTableControls("news")}
                        type="button"
                      >
                        进入管理
                      </button>
                    </div>
                    <div className="space-y-3">
                      {newsArticles.slice(0, 3).map((item) => (
                        <article
                          className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4"
                          key={item.id}
                        >
                          <div className="flex gap-4">
                            <img
                              alt={item.title}
                              className="h-28 w-32 shrink-0 rounded-lg object-cover"
                              src={item.coverImage}
                            />
                            <div className="min-w-0 flex-1">
                                <p className="line-clamp-1 text-lg font-semibold leading-tight text-[var(--foreground)]">
                                  {item.title}
                                </p>
                              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted-foreground)]">
                                {item.summary}
                              </p>
                              <div className="mt-2 flex items-center justify-between gap-3">
                                <p className="text-sm text-[var(--muted-foreground)]">
                                  分类：{item.category}
                                </p>
                                <span
                                  className={`rounded-md px-2 py-0.5 text-xs font-medium ${getStatusClass(item.status)}`}
                                >
                                  {item.status === "PUBLISHED" ? "已发布" : "草稿"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </article>
                </div>
              </div>
            ) : null}

            {activeSection === "products" ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm md:p-4 lg:flex lg:h-[calc(100vh-72px)] lg:min-h-0 lg:flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[var(--foreground)]">产品管理</h2>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    共 {filteredProducts.length} 条
                  </p>
                </div>

                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      disabled={isSubmitting}
                      onClick={handleCreateProduct}
                      type="button"
                    >
                      新增
                    </Button>
                    <Button
                      className="border-rose-200 text-rose-700 hover:bg-rose-50"
                      size="sm"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={handleBatchDelete}
                      type="button"
                    >
                      删除
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={toggleAllVisibleRows}
                      type="button"
                    >
                      {allVisibleSelected ? "取消全选" : "全选当前页"}
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      className="h-9 w-52 rounded-md border border-[var(--input)] bg-[var(--card)] px-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--ring)]"
                      onChange={(event) => setKeyword(event.target.value)}
                      placeholder="搜索产品名称/分类"
                      value={keyword}
                    />
                    <select
                      className="h-9 rounded-md border border-[var(--input)] bg-[var(--card)] px-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--ring)]"
                      onChange={(event) =>
                        setStatusFilter(event.target.value as "ALL" | RowStatus)
                      }
                      value={statusFilter}
                    >
                      <option value="ALL">全部</option>
                      <option value="DRAFT">草稿</option>
                      <option value="PUBLISHED">已发布</option>
                    </select>
                    <select
                      className="h-9 rounded-md border border-[var(--input)] bg-[var(--card)] px-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--ring)]"
                      onChange={(event) => setProductCategoryFilter(event.target.value)}
                      value={productCategoryFilter}
                    >
                      <option value="ALL">全部分类</option>
                      {productCategorySummary.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setKeyword("");
                        setStatusFilter("ALL");
                        setProductCategoryFilter("ALL");
                      }}
                      type="button"
                    >
                      重置
                    </Button>
                  </div>
                </div>

                <div className="mt-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
                  <div className="grid gap-3 lg:grid-cols-2">
                    {paginatedProducts.map((item) => (
                      <article
                        className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4"
                        key={item.id}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleRowSelection(item.id)}
                          />
                          <img
                            alt={item.title}
                            className="h-28 w-32 shrink-0 rounded-lg object-cover"
                            src={item.coverImage}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 text-lg font-semibold leading-tight text-[var(--foreground)]">
                              {item.title}
                            </p>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted-foreground)]">
                              {item.summary}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                              <span>分类：{item.category}</span>
                              <span
                                className={`rounded-md px-2 py-0.5 text-xs font-medium ${getStatusClass(item.status)}`}
                              >
                                {item.status === "PUBLISHED" ? "已发布" : "草稿"}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                              更新于 {formatDate(item.updatedAt)}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                              <Button
                                className="text-xs"
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  handleOpenEditor(
                                    {
                                      kind: "products",
                                      slug: item.slug,
                                      title: item.title,
                                    },
                                    "products",
                                  )
                                }
                                type="button"
                              >
                                编辑
                              </Button>
                              {item.status === "PUBLISHED" ? (
                                <Button asChild className="text-xs" size="sm" variant="secondary">
                                  <Link href={`/products/${item.slug}`}>预览</Link>
                                </Button>
                              ) : null}
                              <Button
                                className="border-rose-200 text-xs text-rose-700 hover:bg-rose-50"
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteRow("products", item.slug)}
                                type="button"
                              >
                                删除
                              </Button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}

                    {paginatedProducts.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted-foreground)] xl:col-span-2">
                        当前筛选条件下没有产品。
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2 text-sm">
                  <button
                    className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[var(--foreground)] disabled:opacity-40"
                    disabled={safeProductPage === 1}
                    onClick={() => setProductPage((value) => Math.max(1, value - 1))}
                    type="button"
                  >
                    上一页
                  </button>
                  <span className="text-[var(--muted-foreground)]">
                    第 {safeProductPage} / {productTotalPages} 页
                  </span>
                  <button
                    className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[var(--foreground)] disabled:opacity-40"
                    disabled={safeProductPage === productTotalPages}
                    onClick={() =>
                      setProductPage((value) => Math.min(productTotalPages, value + 1))
                    }
                    type="button"
                  >
                    下一页
                  </button>
                </div>
              </div>
            ) : null}

            {activeSection === "news" ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm md:p-4 lg:flex lg:h-[calc(100vh-72px)] lg:min-h-0 lg:flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[var(--foreground)]">资讯管理</h2>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    共 {filteredNews.length} 条
                  </p>
                </div>

                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      disabled={isSubmitting}
                      onClick={handleCreateNews}
                      type="button"
                    >
                      新增
                    </Button>
                    <Button
                      className="border-rose-200 text-rose-700 hover:bg-rose-50"
                      size="sm"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={handleBatchDelete}
                      type="button"
                    >
                      删除
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={toggleAllVisibleRows}
                      type="button"
                    >
                      {allVisibleSelected ? "取消全选" : "全选当前页"}
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      className="h-9 w-52 rounded-md border border-[var(--input)] bg-[var(--card)] px-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--ring)]"
                      onChange={(event) => setKeyword(event.target.value)}
                      placeholder="搜索资讯标题/分类"
                      value={keyword}
                    />
                    <select
                      className="h-9 rounded-md border border-[var(--input)] bg-[var(--card)] px-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--ring)]"
                      onChange={(event) =>
                        setStatusFilter(event.target.value as "ALL" | RowStatus)
                      }
                      value={statusFilter}
                    >
                      <option value="ALL">全部</option>
                      <option value="DRAFT">草稿</option>
                      <option value="PUBLISHED">已发布</option>
                    </select>
                    <select
                      className="h-9 rounded-md border border-[var(--input)] bg-[var(--card)] px-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--ring)]"
                      onChange={(event) => setNewsCategoryFilter(event.target.value)}
                      value={newsCategoryFilter}
                    >
                      <option value="ALL">全部分类</option>
                      {newsCategorySummary.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setKeyword("");
                        setStatusFilter("ALL");
                        setNewsCategoryFilter("ALL");
                      }}
                      type="button"
                    >
                      重置
                    </Button>
                  </div>
                </div>

                <div className="mt-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
                  <div className="grid gap-3 lg:grid-cols-2">
                    {paginatedNews.map((item) => (
                      <article
                        className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4"
                        key={item.id}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleRowSelection(item.id)}
                          />
                          <img
                            alt={item.title}
                            className="h-28 w-32 shrink-0 rounded-lg object-cover"
                            src={item.coverImage}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 text-lg font-semibold leading-tight text-[var(--foreground)]">
                              {item.title}
                            </p>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted-foreground)]">
                              {item.summary}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                              <span>分类：{item.category}</span>
                              <span
                                className={`rounded-md px-2 py-0.5 text-xs font-medium ${getStatusClass(item.status)}`}
                              >
                                {item.status === "PUBLISHED" ? "已发布" : "草稿"}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                              更新于 {formatDate(item.updatedAt)}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                              <Button
                                className="text-xs"
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  handleOpenEditor(
                                    {
                                      kind: "news",
                                      slug: item.slug,
                                      title: item.title,
                                    },
                                    "news",
                                  )
                                }
                                type="button"
                              >
                                编辑
                              </Button>
                              {item.status === "PUBLISHED" ? (
                                <Button asChild className="text-xs" size="sm" variant="secondary">
                                  <Link href={`/news/${item.slug}`}>预览</Link>
                                </Button>
                              ) : null}
                              <Button
                                className="border-rose-200 text-xs text-rose-700 hover:bg-rose-50"
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteRow("news", item.slug)}
                                type="button"
                              >
                                删除
                              </Button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}

                    {paginatedNews.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted-foreground)] xl:col-span-2">
                        当前筛选条件下没有资讯。
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2 text-sm">
                  <button
                    className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[var(--foreground)] disabled:opacity-40"
                    disabled={safeNewsPage === 1}
                    onClick={() => setNewsPage((value) => Math.max(1, value - 1))}
                    type="button"
                  >
                    上一页
                  </button>
                  <span className="text-[var(--muted-foreground)]">
                    第 {safeNewsPage} / {newsTotalPages} 页
                  </span>
                  <button
                    className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[var(--foreground)] disabled:opacity-40"
                    disabled={safeNewsPage === newsTotalPages}
                    onClick={() => setNewsPage((value) => Math.min(newsTotalPages, value + 1))}
                    type="button"
                  >
                    下一页
                  </button>
                </div>
              </div>
            ) : null}

            {activeSection === "product-categories" ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--foreground)]">产品分类管理</h2>
                    <p className="text-xs text-[var(--muted-foreground)]">左侧菜单同级入口，可在这里维护分类。</p>
                  </div>
                  <button
                    className="inline-flex h-9 items-center rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)]"
                    disabled={isSubmitting}
                    onClick={() => handleCreateCategory("products")}
                    type="button"
                  >
                    新增分类
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {productCategorySummary.map((category) => (
                    <article
                      className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3"
                      key={category.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-[var(--foreground)]">
                            {category.name}
                          </h3>
                          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                            关联产品 {category.count} 条
                          </p>
                        </div>
                        <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                          分类
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          className="rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--foreground)]"
                          disabled={category.id.startsWith("virtual-") || isSubmitting}
                          onClick={() =>
                            handleRenameCategory("products", category.id, category.name)
                          }
                          type="button"
                        >
                          重命名
                        </button>
                        <button
                          className="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-700 disabled:opacity-40"
                          disabled={category.id.startsWith("virtual-") || isSubmitting}
                          onClick={() =>
                            handleDeleteCategory("products", category.id, category.name)
                          }
                          type="button"
                        >
                          删除
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {activeSection === "news-categories" ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--foreground)]">资讯分类管理</h2>
                    <p className="text-xs text-[var(--muted-foreground)]">左侧菜单同级入口，可在这里维护分类。</p>
                  </div>
                  <button
                    className="inline-flex h-9 items-center rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)]"
                    disabled={isSubmitting}
                    onClick={() => handleCreateCategory("news")}
                    type="button"
                  >
                    新增分类
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {newsCategorySummary.map((category) => (
                    <article
                      className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3"
                      key={category.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-[var(--foreground)]">
                            {category.name}
                          </h3>
                          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                            关联资讯 {category.count} 条
                          </p>
                        </div>
                        <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                          分类
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          className="rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--foreground)] disabled:opacity-40"
                          disabled={category.id.startsWith("virtual-") || isSubmitting}
                          onClick={() => handleRenameCategory("news", category.id, category.name)}
                          type="button"
                        >
                          重命名
                        </button>
                        <button
                          className="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-700 disabled:opacity-40"
                          disabled={category.id.startsWith("virtual-") || isSubmitting}
                          onClick={() => handleDeleteCategory("news", category.id, category.name)}
                          type="button"
                        >
                          删除
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {activeSection === "product-editor" || activeSection === "news-editor" ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm md:p-4 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
                <div className="mb-2 flex items-center justify-end lg:shrink-0">
                  <Button onClick={handleCloseEditor} size="sm" type="button" variant="secondary">
                    返回列表
                  </Button>
                </div>

                {editTarget ? (
                  <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)] lg:min-h-0 lg:flex-1">
                    <iframe
                      className="h-[72vh] min-h-[520px] w-full border-0 lg:h-full lg:min-h-0"
                      src={
                        editTarget.kind === "products"
                          ? `/editor/products/${editTarget.slug}?embed=1`
                          : `/editor/newsroom/${editTarget.slug}?embed=1`
                      }
                      title={`${editTarget.title}-editor`}
                    />
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                    当前没有可编辑内容，请返回列表后重新进入编辑。
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            closeCategoryDialog();
            return;
          }
          setCategoryDialogOpen(true);
        }}
        open={categoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {categoryDialogMode === "create" ? `新增${categoryDialogLabel}` : `编辑${categoryDialogLabel}`}
            </DialogTitle>
            <DialogDescription>
              {categoryDialogMode === "create"
                ? "输入分类名称后即可创建。"
                : "修改分类名称会同步更新该分类下的内容。"}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-2">
            <p className="text-sm text-[var(--foreground)]">分类名称</p>
            <Input
              autoFocus
              onChange={(event) => setCategoryDialogName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSubmitCategoryDialog();
                }
              }}
              placeholder="请输入分类名称"
              value={categoryDialogName}
            />
          </div>

          <DialogFooter>
            <Button onClick={closeCategoryDialog} type="button" variant="secondary">
              取消
            </Button>
            <Button disabled={isSubmitting} onClick={handleSubmitCategoryDialog} type="button">
              {isSubmitting
                ? "提交中..."
                : categoryDialogMode === "create"
                  ? "创建分类"
                  : "保存修改"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
