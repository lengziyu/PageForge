/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  type DragEndEvent,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { BlockInspector } from "@/components/builder/block-inspector";
import { BlockPalette } from "@/components/builder/block-palette";
import { EditorFlowNav } from "@/components/builder/editor-flow-nav";
import { SitePageNav } from "@/components/builder/site-page-nav";
import { SiteSettingsPanel } from "@/components/builder/site-settings-panel";
import { SortableSectionCard } from "@/components/builder/sortable-section-card";
import { BrandThemeSwitcher } from "@/components/theme/brand-theme-switcher";
import { Button } from "@/components/ui/button";
import type {
  BuilderPageListItem,
  BuilderPageResponse,
  BuilderPageStatus,
} from "@/lib/builder/page-contracts";
import { blockRegistry, type BuilderBlockType } from "@/lib/builder/registry";
import { pageDocumentSchema, type BuilderPageSection } from "@/lib/builder/schema";

type PageEditorProps = {
  initialPage: BuilderPageResponse;
  sitePages: BuilderPageListItem[];
};

type InspectorTab = "public" | "module";
type LeftPanelTab = "structure" | "blocks";

const AUTO_CANVAS_MIN_SCALE = 0.5;

function cloneDefaultProps<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getStatusLabel(status: BuilderPageStatus) {
  return status === "PUBLISHED" ? "已发布" : "草稿";
}

function getSectionDescription(section: BuilderPageSection) {
  if (section.type === "news-list") {
    return section.props.sourceMode === "newsroom" ? "连接新闻中心" : "手动维护资讯项";
  }

  if (section.type === "service-grid") {
    const variantLabel =
      section.props.variant === "split"
        ? "图文交错"
        : section.props.variant === "compact"
          ? "紧凑列表"
          : "卡片网格";

    return section.props.sourceMode === "products"
      ? `连接产品中心 · ${variantLabel}`
      : `手动维护内容 · ${variantLabel}`;
  }

  return blockRegistry[section.type].description;
}

function CanvasDropzone({ children }: { children: ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: "canvas-dropzone",
  });

  return (
    <div
      className={`rounded-xl border border-dashed p-3 transition ${
        isOver
          ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_12%,white)]"
          : "border-transparent"
      }`}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
}

function getNavigationItems(
  page: BuilderPageResponse,
  pages: BuilderPageListItem[],
) {
  if (page.document.site.navigationLinks.length > 0) {
    return page.document.site.navigationLinks;
  }

  return pages.map((item) => ({
    label: item.title,
    href: `/sites/${item.slug}`,
    slug: item.slug,
  }));
}

function getCanvasNavigationContainerClass(
  template: BuilderPageResponse["document"]["site"]["navigationTemplate"],
) {
  switch (template) {
    case "underline":
      return "flex flex-wrap items-center gap-x-5 gap-y-2";
    case "outline":
      return "flex flex-wrap items-center gap-2";
    case "filled":
    default:
      return "flex flex-wrap gap-2";
  }
}

function getCanvasNavigationItemClass(
  template: BuilderPageResponse["document"]["site"]["navigationTemplate"],
  isActive: boolean,
) {
  switch (template) {
    case "underline":
      return isActive
        ? "relative px-1 py-2 text-sm font-semibold text-[var(--primary)] after:absolute after:-bottom-0.5 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-[var(--primary)]"
        : "relative px-1 py-2 text-sm font-medium text-slate-600";
    case "outline":
      return isActive
        ? "rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900"
        : "rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600";
    case "filled":
    default:
      return isActive
        ? "rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
        : "rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600";
  }
}

function CanvasHeaderPreview({
  page,
  pages,
}: {
  page: BuilderPageResponse;
  pages: BuilderPageListItem[];
}) {
  const items = getNavigationItems(page, pages);
  const navigationTemplate = page.document.site.navigationTemplate ?? "filled";

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          {page.document.site.logoSrc ? (
            <img
              alt={page.document.site.name}
              className="h-10 w-10 rounded-lg object-cover"
              src={page.document.site.logoSrc}
            />
          ) : null}
          <div>
            <p className="text-base font-semibold text-slate-950">
              {page.document.site.name}
            </p>
            <p className="mt-1 text-sm text-slate-500">{page.document.site.tagline}</p>
          </div>
        </div>

        <nav className={getCanvasNavigationContainerClass(navigationTemplate)}>
          {items.map((item) => {
            const isActive = item.slug === page.slug;

            return (
              <span
                className={getCanvasNavigationItemClass(navigationTemplate, isActive)}
                key={item.slug}
              >
                {item.label}
              </span>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function CanvasFooterPreview({
  site,
}: {
  site: BuilderPageResponse["document"]["site"];
}) {
  const footer = site.footer;

  if (footer.template === "minimal") {
    return (
      <div className="rounded-xl border border-slate-200 bg-[var(--primary-strong)] px-5 py-5 text-[var(--primary-foreground)] shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold">{site.name}</p>
            <p className="mt-1 text-sm text-[color-mix(in_srgb,var(--primary-foreground)_72%,transparent)]">
              {footer.companyAddress}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[color-mix(in_srgb,var(--primary-foreground)_86%,transparent)]">
            <span>{footer.phone}</span>
            <span>{footer.email}</span>
            <span>{footer.registrationNumber}</span>
          </div>
        </div>
      </div>
    );
  }

  if (footer.template === "stacked") {
    return (
      <div className="rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-base font-semibold text-slate-950">{site.name}</p>
            <p className="mt-2 text-sm text-slate-600">{site.tagline}</p>
          </div>
          <p className="text-sm text-slate-500">{footer.copyrightText}</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { title: "公司地址", value: footer.companyAddress },
            { title: "联系电话", value: footer.phone },
            { title: "备案号", value: footer.registrationNumber },
          ].map((item) => (
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3" key={item.title}>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.title}</p>
              <p className="mt-2 text-sm text-slate-700">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-base font-semibold text-slate-950">{site.name}</p>
          <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">{site.tagline}</p>
        </div>
        <div className="grid gap-2 text-sm text-slate-600">
          <p>公司地址：{footer.companyAddress}</p>
          <p>联系电话：{footer.phone}</p>
          <p>联系邮箱：{footer.email}</p>
          <p>备案号：{footer.registrationNumber}</p>
          <p className="text-slate-500">{footer.copyrightText}</p>
        </div>
      </div>
    </div>
  );
}

export function PageEditor({ initialPage, sitePages }: PageEditorProps) {
  const router = useRouter();
  const [document, setDocument] = useState(initialPage.document);
  const [pageStatus, setPageStatus] = useState<BuilderPageStatus>(initialPage.status);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    initialPage.document.sections[0]?.id ?? null,
  );
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<string[]>([]);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("module");
  const [leftPanelTab, setLeftPanelTab] = useState<LeftPanelTab>("structure");
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasBaseWidth, setCanvasBaseWidth] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    initialPage.source === "database"
      ? `当前页面已从数据库加载，状态为${getStatusLabel(initialPage.status)}。`
      : "当前使用默认模板内容，保存后会正式写入数据库。",
  );
  const [isSaving, startSavingTransition] = useTransition();
  const canvasViewportRef = useRef<HTMLDivElement | null>(null);
  const canvasInnerRef = useRef<HTMLDivElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const selectedSection = useMemo(
    () => document.sections.find((section) => section.id === selectedSectionId),
    [document.sections, selectedSectionId],
  );
  const canUseZoom = Boolean(
    typeof window !== "undefined" && globalThis.CSS?.supports?.("zoom", "1"),
  );

  useEffect(() => {
    const viewport = canvasViewportRef.current;
    const inner = canvasInnerRef.current;

    if (!viewport || !inner || !canUseZoom) {
      return;
    }

    const recalculateScale = () => {
      const viewportWidth = viewport.clientWidth;
      const contentWidth = Math.ceil(inner.scrollWidth);
      const nextBaseWidth = Math.max(viewportWidth, contentWidth);
      const nextScale = Math.min(
        1,
        Math.max(AUTO_CANVAS_MIN_SCALE, viewportWidth / nextBaseWidth),
      );

      setCanvasBaseWidth((current) => {
        if (current !== null && Math.abs(current - nextBaseWidth) < 1) {
          return current;
        }

        return nextBaseWidth;
      });

      setCanvasScale((current) => {
        if (Math.abs(current - nextScale) < 0.01) {
          return current;
        }

        return nextScale;
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      recalculateScale();
    });

    const frameId = window.requestAnimationFrame(() => {
      recalculateScale();
    });

    resizeObserver.observe(viewport);
    resizeObserver.observe(inner);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [canUseZoom, isLeftPanelOpen, isInspectorOpen, document.sections.length]);

  const canvasPage: BuilderPageResponse = {
    ...initialPage,
    status: pageStatus,
    document,
  };

  const handleAddBlock = (blockType: BuilderBlockType, targetSectionId?: string) => {
    const definition = blockRegistry[blockType];
    const nextSection = {
      id: crypto.randomUUID(),
      type: blockType,
      props: cloneDefaultProps(definition.defaultProps),
    } as BuilderPageSection;

    setDocument((currentDocument) => {
      if (!targetSectionId) {
        return {
          ...currentDocument,
          sections: [...currentDocument.sections, nextSection],
        };
      }

      const targetIndex = currentDocument.sections.findIndex(
        (section) => section.id === targetSectionId,
      );

      if (targetIndex < 0) {
        return {
          ...currentDocument,
          sections: [...currentDocument.sections, nextSection],
        };
      }

      return {
        ...currentDocument,
        sections: [
          ...currentDocument.sections.slice(0, targetIndex),
          nextSection,
          ...currentDocument.sections.slice(targetIndex),
        ],
      };
    });

    setSelectedSectionId(nextSection.id);
    setInspectorTab("module");
    setStatusMessage(`已新增“${definition.label}”模块。`);
  };

  const handleUpdateSection = (sectionId: string, nextSection: BuilderPageSection) => {
    setDocument((currentDocument) => ({
      ...currentDocument,
      sections: currentDocument.sections.map((section) =>
        section.id === sectionId ? nextSection : section,
      ),
    }));
  };

  const handleRemoveSection = (sectionId: string) => {
    setDocument((currentDocument) => {
      const nextSections = currentDocument.sections.filter(
        (section) => section.id !== sectionId,
      );

      if (selectedSectionId === sectionId) {
        setSelectedSectionId(nextSections[0]?.id ?? null);
      }

      return {
        ...currentDocument,
        sections: nextSections,
      };
    });

    setCollapsedSectionIds((current) => current.filter((id) => id !== sectionId));
    setStatusMessage("已删除当前模块。");
  };

  const handleToggleCollapse = (sectionId: string) => {
    setCollapsedSectionIds((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId],
    );
  };

  const handleSiteChange = (nextSite: typeof document.site) => {
    setDocument((currentDocument) => ({
      ...currentDocument,
      site: nextSite,
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    if (active.data.current?.source === "palette") {
      handleAddBlock(
        active.data.current.blockType as BuilderBlockType,
        over.id === "canvas-dropzone" ? undefined : String(over.id),
      );
      return;
    }

    if (active.id === over.id) {
      return;
    }

    setDocument((currentDocument) => {
      const oldIndex = currentDocument.sections.findIndex(
        (section) => section.id === active.id,
      );
      const newIndex = currentDocument.sections.findIndex(
        (section) => section.id === over.id,
      );

      if (oldIndex < 0 || newIndex < 0) {
        return currentDocument;
      }

      return {
        ...currentDocument,
        sections: arrayMove(currentDocument.sections, oldIndex, newIndex),
      };
    });

    setStatusMessage("已更新模块顺序。");
  };

  const handleSaveDraft = () => {
    startSavingTransition(async () => {
      const parsed = pageDocumentSchema.safeParse(document);

      if (!parsed.success) {
        setStatusMessage("保存失败：页面结构没有通过校验。");
        return;
      }

      const response = await fetch(`/api/pages/${initialPage.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document: parsed.data,
          status: "DRAFT",
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setStatusMessage(payload.message ?? "保存失败。");
        return;
      }

      setPageStatus("DRAFT");
      setStatusMessage("当前页面已保存为草稿。");
      router.refresh();
    });
  };

  const handlePublishSite = () => {
    startSavingTransition(async () => {
      const parsed = pageDocumentSchema.safeParse(document);

      if (!parsed.success) {
        setStatusMessage("发布失败：页面结构没有通过校验。");
        return;
      }

      const response = await fetch("/api/site/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPageSlug: initialPage.slug,
          currentDocument: parsed.data,
        }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setStatusMessage(payload.message ?? "整站发布失败。");
        return;
      }

      setPageStatus("PUBLISHED");
      setStatusMessage(payload.message ?? "整站已发布。");
      router.refresh();
    });
  };

  const gridClassName = isLeftPanelOpen
    ? isInspectorOpen
      ? "grid gap-3 xl:grid-cols-[288px_minmax(0,1fr)_350px]"
      : "grid gap-3 xl:grid-cols-[288px_minmax(0,1fr)_54px]"
    : isInspectorOpen
      ? "grid gap-3 xl:grid-cols-[54px_minmax(0,1fr)_350px]"
      : "grid gap-3 xl:grid-cols-[54px_minmax(0,1fr)_54px]";
  const compactTabButtonClass =
    "rounded-md px-2.5 py-1.5 text-xs font-medium transition";

  return (
    <main className="editor-radius-half min-h-screen px-3 py-3 md:px-4">
      <EditorFlowNav
        activeStep="page-editor"
        editorHref={sitePages.some((page) => page.source === "database") ? "/editor" : "/editor/start"}
        pageSlug={initialPage.slug}
      />
      <div className="mx-auto max-w-[1580px] space-y-3">
        <header className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-3 shadow-sm md:px-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2.5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                  Editor Workspace
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <h1 className="truncate text-lg font-semibold tracking-tight text-[var(--foreground)] md:text-xl">
                    {document.page.title}
                  </h1>
                  <span className="rounded-md bg-[var(--primary-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--primary-strong)]">
                    {getStatusLabel(pageStatus)}
                  </span>
                  <span className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-2 py-0.5 text-[11px] text-[var(--muted-foreground)]">
                    /{initialPage.slug}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">{statusMessage}</p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <BrandThemeSwitcher className="h-9 w-9" />
                {pageStatus === "PUBLISHED" ? (
                  <Button asChild size="default" variant="outline">
                    <Link href={`/sites/${initialPage.slug}`}>预览</Link>
                  </Button>
                ) : (
                  <Button disabled size="default" variant="outline">
                    未发布
                  </Button>
                )}
                <Button
                  disabled={isSaving}
                  onClick={handleSaveDraft}
                  size="default"
                  type="button"
                  variant="warning"
                >
                  {isSaving ? "处理中" : "存草稿"}
                </Button>
                <Button
                  disabled={isSaving}
                  onClick={handlePublishSite}
                  size="default"
                  type="button"
                  variant="default"
                >
                  {isSaving ? "处理中" : "发布"}
                </Button>
                <AdminLogoutButton size="default" variant="outline" />
              </div>
            </div>
          </div>
        </header>

        <SitePageNav currentSlug={initialPage.slug} pages={sitePages} />

        <div className={gridClassName}>
          <div className="min-w-0 xl:sticky xl:top-3 xl:self-start">
            {isLeftPanelOpen ? (
              <div className="space-y-3">
                <div className="flex justify-start">
                  <button
                    className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 md:text-sm"
                    onClick={() => setIsLeftPanelOpen(false)}
                    type="button"
                  >
                    收起左栏
                  </button>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`${compactTabButtonClass} ${
                        leftPanelTab === "structure"
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      onClick={() => setLeftPanelTab("structure")}
                      type="button"
                    >
                      页面结构
                    </button>
                    <button
                      className={`${compactTabButtonClass} ${
                        leftPanelTab === "blocks"
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      onClick={() => setLeftPanelTab("blocks")}
                      type="button"
                    >
                      添加模块
                    </button>
                  </div>
                </div>

                {leftPanelTab === "structure" ? (
                  <aside className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">结构视图</p>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                        页面大纲
                      </h3>
                      <p className="mt-1.5 text-sm leading-6 text-slate-600">
                        先选中模块，再去右侧改字段，配置会更清晰。
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-sm font-medium text-slate-900">当前页面</p>
                      <p className="mt-1.5 text-sm text-slate-600">
                        {document.page.title} · {document.sections.length} 个模块
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          className="rounded-md bg-[var(--primary)] px-2.5 py-1.5 text-xs font-medium text-[var(--primary-foreground)]"
                          onClick={() => {
                            setInspectorTab("public");
                            setIsInspectorOpen(true);
                          }}
                          type="button"
                        >
                          打开全站设置
                        </button>
                        <button
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
                          onClick={() => setLeftPanelTab("blocks")}
                          type="button"
                        >
                          继续加模块
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {document.sections.map((section, index) => {
                        const definition = blockRegistry[section.type];
                        const isSelected = selectedSectionId === section.id;

                        return (
                          <button
                            className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                              isSelected
                                ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                                : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                            }`}
                            key={section.id}
                            onClick={() => {
                              setSelectedSectionId(section.id);
                              setInspectorTab("module");
                              setIsInspectorOpen(true);
                            }}
                            type="button"
                          >
                            <div className="flex items-start gap-3">
                              <span className="rounded-md bg-[var(--primary)] px-2 py-0.5 text-[11px] font-semibold text-[var(--primary-foreground)]">
                                {index + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-950">
                                  {definition.label}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                  {getSectionDescription(section)}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </aside>
                ) : (
                  <BlockPalette onAddBlock={handleAddBlock} />
                )}
              </div>
            ) : (
              <aside className="flex min-h-[112px] items-start justify-center rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                <button
                  className="flex min-h-[52px] w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-600 transition hover:border-[var(--primary)] hover:text-[var(--primary-strong)] md:text-sm"
                  onClick={() => setIsLeftPanelOpen(true)}
                  type="button"
                >
                  展开
                </button>
              </aside>
            )}
          </div>

          <section className="min-h-[calc(100vh-9.5rem)] rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_82%,white)] p-3 shadow-sm backdrop-blur md:p-4">
            <div className="mb-4 flex flex-col gap-2.5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">画布</p>
                <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">
                  页面模块
                </h2>
              </div>
              <p className="text-xs text-slate-500 md:text-sm">{document.sections.length} 个模块</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white/70 p-2 md:p-3">
              <div className="flex items-center justify-end px-1 pb-2">
                <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-500">
                  缩放 {Math.round(canvasScale * 100)}%
                </span>
              </div>
              <div className="overflow-x-auto" ref={canvasViewportRef}>
                <div
                  ref={canvasInnerRef}
                  className="origin-top-left transition-[zoom,width] duration-200 ease-out"
                  style={
                    canUseZoom && canvasScale < 1 && canvasBaseWidth
                      ? {
                          width: `${canvasBaseWidth}px`,
                          zoom: canvasScale,
                        }
                      : undefined
                  }
                >
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    sensors={sensors}
                  >
                    <SortableContext
                      items={document.sections.map((section) => section.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <CanvasDropzone>
                        <div className="space-y-3">
                          <CanvasHeaderPreview page={canvasPage} pages={sitePages} />
                          {document.sections.map((section, index) => (
                            <SortableSectionCard
                              index={index}
                              isCollapsed={collapsedSectionIds.includes(section.id)}
                              isSelected={selectedSectionId === section.id}
                              key={section.id}
                              onRemove={() => handleRemoveSection(section.id)}
                              onSelect={() => {
                                setSelectedSectionId(section.id);
                                setInspectorTab("module");
                              }}
                              onToggleCollapse={() => handleToggleCollapse(section.id)}
                              section={section}
                            />
                          ))}
                          <CanvasFooterPreview site={document.site} />
                        </div>
                      </CanvasDropzone>
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            </div>
          </section>

          <div className="xl:sticky xl:top-3 xl:self-start">
            {isInspectorOpen ? (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <button
                    className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 md:text-sm"
                    onClick={() => setIsInspectorOpen(false)}
                    type="button"
                  >
                    收起右栏
                  </button>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`${compactTabButtonClass} ${
                        inspectorTab === "module"
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      onClick={() => setInspectorTab("module")}
                      type="button"
                    >
                      模块设置
                    </button>
                    <button
                      className={`${compactTabButtonClass} ${
                        inspectorTab === "public"
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      onClick={() => setInspectorTab("public")}
                      type="button"
                    >
                      公共设置
                    </button>
                  </div>
                </div>
                {inspectorTab === "module" ? (
                  <BlockInspector onChange={handleUpdateSection} section={selectedSection} />
                ) : (
                  <SiteSettingsPanel
                    onChange={handleSiteChange}
                    site={document.site}
                    sitePages={sitePages}
                  />
                )}
              </div>
            ) : (
              <aside className="flex min-h-[112px] items-start justify-center rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                <button
                  className="flex min-h-[52px] w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-600 transition hover:border-[var(--primary)] hover:text-[var(--primary-strong)] md:text-sm"
                  onClick={() => setIsInspectorOpen(true)}
                  type="button"
                >
                  展开
                </button>
              </aside>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
