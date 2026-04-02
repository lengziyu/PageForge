/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { RichTextEditor } from "@/components/news/rich-text-editor";
import { BrandThemeSwitcher } from "@/components/theme/brand-theme-switcher";
import { uploadBrowserFile } from "@/lib/media/client";
import type {
  SiteProduct,
  SiteProductCategory,
  SiteProductSpec,
} from "@/lib/products/contracts";

type ProductEditorProps = {
  initialProduct: SiteProduct;
  categories: SiteProductCategory[];
  embedded?: boolean;
};

function createEmptySpec(): SiteProductSpec {
  return {
    label: "新字段",
    value: "请补充",
  };
}

export function ProductEditor({
  initialProduct,
  categories,
  embedded = false,
}: ProductEditorProps) {
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [message, setMessage] = useState("支持封面、图集、亮点、规格和富文本详情编辑。");
  const [isSaving, startSavingTransition] = useTransition();

  const updateProduct = <T extends keyof SiteProduct>(key: T, value: SiteProduct[T]) => {
    setProduct((current) => ({
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
      const url = await uploadBrowserFile(file, "products");
      updateProduct("coverImage", url);
      setMessage("封面图已更新，保存后列表和详情页会同步生效。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "封面上传失败。");
    }
  };

  const handleGalleryUpload = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);

    if (files.length === 0) {
      return;
    }

    try {
      const urls = await Promise.all(files.map((file) => uploadBrowserFile(file, "products")));
      updateProduct("gallery", [...product.gallery, ...urls]);
      setMessage(`已添加 ${urls.length} 张产品图片。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "图集上传失败。");
    }
  };

  const handleSave = (status: "DRAFT" | "PUBLISHED") => {
    startSavingTransition(async () => {
      const response = await fetch(`/api/products/${product.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...product,
          status,
        }),
      });

      const payload = (await response.json()) as { message?: string } & SiteProduct;

      if (!response.ok) {
        setMessage(payload.message ?? "产品保存失败。");
        return;
      }

      setProduct(payload);
      setMessage(status === "PUBLISHED" ? "产品已发布。" : "产品已保存为草稿。");
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
            : "mx-auto max-w-7xl space-y-6 pb-24"
        }`}
      >
        {!embedded ? (
          <header className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-5 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-[var(--foreground)]">
                  {product.title}
                </h1>
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">{message}</p>
              </div>

              <div className="flex flex-wrap items-start gap-3">
                <Link
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted)]"
                  href="/editor/products"
                >
                  返回产品中心
                </Link>
                <BrandThemeSwitcher />
                <AdminLogoutButton className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted)]" />
              </div>
            </div>
          </header>
        ) : null}

        <div className={embedded ? "min-h-0 flex-1 overflow-y-auto space-y-6 pr-1" : "space-y-6"}>
          <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">基础信息</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">产品属性</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">标题</span>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--ring)]"
                    onChange={(event) => updateProduct("title", event.target.value)}
                    value={product.title}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">分类</span>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--ring)]"
                    onChange={(event) => updateProduct("category", event.target.value)}
                    value={product.category}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">摘要</span>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--ring)]"
                  onChange={(event) => updateProduct("summary", event.target.value)}
                  value={product.summary}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">封面图地址</span>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--ring)]"
                  onChange={(event) => updateProduct("coverImage", event.target.value)}
                  value={product.coverImage}
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

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <img
                  alt={product.title}
                  className="mx-auto h-40 w-full max-w-[220px] rounded-lg object-cover"
                  src={product.coverImage}
                />
              </div>
            </aside>

            <div className="space-y-6">
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">展示素材</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">图集与亮点</h2>
                  </div>
                  <label className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                    上传图集
                    <input
                      accept="image/*"
                      className="hidden"
                      multiple
                      onChange={(event) => {
                        void handleGalleryUpload(event.target.files);
                      }}
                      type="file"
                    />
                  </label>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700">产品亮点</p>
                    {product.highlights.map((highlight, index) => (
                      <div className="flex gap-2" key={`${product.slug}-highlight-${index}`}>
                        <input
                          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[var(--ring)]"
                          onChange={(event) =>
                            updateProduct(
                              "highlights",
                              product.highlights.map((item, itemIndex) =>
                                itemIndex === index ? event.target.value : item,
                              ),
                            )
                          }
                          value={highlight}
                        />
                        <button
                          className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700"
                          onClick={() =>
                            updateProduct(
                              "highlights",
                              product.highlights.filter((_, itemIndex) => itemIndex !== index),
                            )
                          }
                          type="button"
                        >
                          删除
                        </button>
                      </div>
                    ))}
                    <button
                      className="w-full rounded-lg border border-dashed border-[var(--primary)] bg-[var(--primary-soft)] px-4 py-3 text-sm font-medium text-[var(--primary-strong)]"
                      onClick={() =>
                        updateProduct("highlights", [...product.highlights, "新增亮点"])
                      }
                      type="button"
                    >
                      新增亮点
                    </button>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700">产品图集</p>
                    <div className="grid grid-cols-2 gap-3">
                      {product.gallery.map((image, index) => (
                        <div
                          className="rounded-xl border border-slate-200 bg-slate-50 p-2"
                          key={image}
                        >
                          <img
                            alt={`${product.title} 图集 ${index + 1}`}
                            className="h-28 w-full rounded-lg object-cover"
                            src={image}
                          />
                          <div className="mt-2 flex gap-2">
                            <input
                              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-[var(--ring)]"
                              onChange={(event) =>
                                updateProduct(
                                  "gallery",
                                  product.gallery.map((item, itemIndex) =>
                                    itemIndex === index ? event.target.value : item,
                                  ),
                                )
                              }
                              value={image}
                            />
                            <button
                              className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-medium text-rose-700"
                              onClick={() =>
                                updateProduct(
                                  "gallery",
                                  product.gallery.filter((_, itemIndex) => itemIndex !== index),
                                )
                              }
                              type="button"
                            >
                              删
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">结构化信息</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">规格参数</h2>
                </div>

                <div className="space-y-3">
                  {product.specs.map((spec, index) => (
                    <div
                      className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_1fr_auto] md:items-center"
                      key={`${product.slug}-spec-${index}`}
                    >
                      <input
                        className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[var(--ring)]"
                        onChange={(event) =>
                          updateProduct(
                            "specs",
                            product.specs.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, label: event.target.value } : item,
                            ),
                          )
                        }
                        value={spec.label}
                      />
                      <input
                        className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[var(--ring)]"
                        onChange={(event) =>
                          updateProduct(
                            "specs",
                            product.specs.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, value: event.target.value } : item,
                            ),
                          )
                        }
                        value={spec.value}
                      />
                      <button
                        className="rounded-lg border border-rose-200 px-4 py-3 text-sm font-medium text-rose-700"
                        onClick={() =>
                          updateProduct(
                            "specs",
                            product.specs.filter((_, itemIndex) => itemIndex !== index),
                          )
                        }
                        type="button"
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  className="mt-4 w-full rounded-lg border border-dashed border-[var(--primary)] bg-[var(--primary-soft)] px-4 py-3 text-sm font-medium text-[var(--primary-strong)]"
                  onClick={() => updateProduct("specs", [...product.specs, createEmptySpec()])}
                  type="button"
                >
                  新增规格字段
                </button>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">正文内容</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">详情介绍</h2>
                </div>
                <RichTextEditor
                  onChange={(value) => updateProduct("contentHtml", value)}
                  uploadFolder="products"
                  value={product.contentHtml}
                />
              </section>
            </div>
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
              {isSaving ? "处理中..." : "发布产品"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
