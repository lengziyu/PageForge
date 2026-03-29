/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useMemo, useState, useTransition, type ReactNode } from "react";
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
import { BlockInspector } from "@/components/builder/block-inspector";
import { BlockPalette } from "@/components/builder/block-palette";
import { SitePageNav } from "@/components/builder/site-page-nav";
import { SiteSettingsPanel } from "@/components/builder/site-settings-panel";
import { SortableSectionCard } from "@/components/builder/sortable-section-card";
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

function cloneDefaultProps<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getStatusLabel(status: BuilderPageStatus) {
  return status === "PUBLISHED" ? "已发布" : "草稿";
}

function CanvasDropzone({ children }: { children: ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: "canvas-dropzone",
  });

  return (
    <div
      className={`rounded-xl border border-dashed p-3 transition ${
        isOver ? "border-indigo-400 bg-indigo-50/70" : "border-transparent"
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

function CanvasHeaderPreview({
  page,
  pages,
}: {
  page: BuilderPageResponse;
  pages: BuilderPageListItem[];
}) {
  const items = getNavigationItems(page, pages);

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

        <nav className="flex flex-wrap gap-2">
          {items.map((item) => {
            const isActive = item.slug === page.slug;

            return (
              <span
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-600"
                }`}
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
      <div className="rounded-xl border border-slate-200 bg-slate-950 px-5 py-5 text-white shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold">{site.name}</p>
            <p className="mt-1 text-sm text-slate-400">{footer.companyAddress}</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
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
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("module");
  const [statusMessage, setStatusMessage] = useState(
    initialPage.source === "database"
      ? `当前页面已从数据库加载，状态为${getStatusLabel(initialPage.status)}。`
      : "当前使用默认模板内容，保存后会正式写入数据库。",
  );
  const [isSaving, startSavingTransition] = useTransition();

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

  const gridClassName = isInspectorOpen
    ? "grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_380px]"
    : "grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_64px]";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef2f8_0%,#f7f9fc_100%)] px-4 py-4 md:px-5">
      <div className="space-y-4">
        <header className="rounded-xl border border-slate-200 bg-slate-950 px-6 py-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.14)]">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">页面编辑器</p>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  {document.page.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                  <span className="rounded-md bg-white/10 px-3 py-1">/{initialPage.slug}</span>
                  <span className="rounded-md bg-indigo-500/20 px-3 py-1 text-indigo-100">
                    {getStatusLabel(pageStatus)}
                  </span>
                  <span className="text-slate-400">{statusMessage}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-lg border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                href="/editor"
                style={{ color: "#ffffff" }}
              >
                返回页面列表
              </Link>
              <Link
                className="rounded-lg border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                href="/editor/newsroom"
                style={{ color: "#ffffff" }}
              >
                新闻中心
              </Link>
              {pageStatus === "PUBLISHED" ? (
                <Link
                  className="rounded-lg border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                  href={`/sites/${initialPage.slug}`}
                  style={{ color: "#ffffff" }}
                >
                  预览页面
                </Link>
              ) : (
                <span className="rounded-lg border border-white/10 px-5 py-3 text-sm font-medium text-slate-400">
                  当前页面尚未发布
                </span>
              )}
              <button
                className="rounded-lg border border-amber-300/30 bg-amber-400 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-500"
                disabled={isSaving}
                onClick={handleSaveDraft}
                type="button"
              >
                {isSaving ? "处理中..." : "保存当前页草稿"}
              </button>
              <button
                className="rounded-lg bg-teal-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:bg-slate-500"
                disabled={isSaving}
                onClick={handlePublishSite}
                type="button"
              >
                {isSaving ? "处理中..." : "发布整站"}
              </button>
            </div>
          </div>
        </header>

        <SitePageNav currentSlug={initialPage.slug} pages={sitePages} />

        <div className={gridClassName}>
          <div className="xl:sticky xl:top-4 xl:self-start">
            <BlockPalette onAddBlock={handleAddBlock} />
          </div>

          <section className="min-h-[calc(100vh-11rem)] rounded-xl border border-slate-200 bg-white/75 p-4 shadow-sm backdrop-blur md:p-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">画布</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  页面模块
                </h2>
              </div>
              <p className="text-sm text-slate-500">{document.sections.length} 个模块</p>
            </div>

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
                  <div className="space-y-4">
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
          </section>

          <div className="xl:sticky xl:top-4 xl:self-start">
            {isInspectorOpen ? (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    onClick={() => setIsInspectorOpen(false)}
                    type="button"
                  >
                    收起右栏
                  </button>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                        inspectorTab === "module"
                          ? "bg-slate-950 text-white"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      onClick={() => setInspectorTab("module")}
                      type="button"
                    >
                      模块设置
                    </button>
                    <button
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                        inspectorTab === "public"
                          ? "bg-slate-950 text-white"
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
              <aside className="flex min-h-[140px] items-start justify-center rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                <button
                  className="flex min-h-[68px] w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700"
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
