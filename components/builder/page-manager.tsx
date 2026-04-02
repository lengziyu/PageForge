"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { EditorFlowNav } from "@/components/builder/editor-flow-nav";
import { SitePageDashboard } from "@/components/builder/site-page-dashboard";
import { SiteTemplateStarter } from "@/components/builder/site-template-starter";
import { SiteTemplateDialog } from "@/components/builder/site-template-dialog";
import { BrandThemeSwitcher } from "@/components/theme/brand-theme-switcher";
import { Button } from "@/components/ui/button";
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
  BuilderPageListItem,
  BuilderPageResponse,
} from "@/lib/builder/page-contracts";
import type {
  EnterprisePageKey,
  SiteTemplateId,
} from "@/lib/builder/template-catalog";
import type { FooterTemplateId } from "@/lib/builder/site-config";

type PageManagerProps = {
  initialPages: BuilderPageListItem[];
};

type TemplateCreateResponse = {
  templateId: SiteTemplateId;
  pages: BuilderPageResponse[];
  message?: string;
};

type ConfirmDialogState = {
  title: string;
  description: string;
  actionLabel: string;
  onConfirm: () => void;
};

export function PageManager({ initialPages }: PageManagerProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState(
    "请选择行业模板并勾选要生成的页面，完成后会自动进入首页编辑。",
  );
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogState, setConfirmDialogState] = useState<ConfirmDialogState | null>(
    null,
  );
  const [isSubmitting, startTransition] = useTransition();

  const sortedPages = initialPages;

  const hasDatabasePages = sortedPages.some((page) => page.source === "database");
  const editorStepHref = hasDatabasePages ? "/editor" : "/editor/start";

  const handleCreateSite = (input: {
    templateId: SiteTemplateId;
    selectedPages: EnterprisePageKey[];
    footerTemplate: FooterTemplateId;
  }) => {
    startTransition(async () => {
      const response = await fetch("/api/site-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const payload = (await response.json()) as TemplateCreateResponse & {
        message?: string;
      };

      if (!response.ok) {
        setMessage(payload.message ?? "模板创建失败。");
        return;
      }

      const homepage =
        payload.pages.find((page) => page.slug === "homepage") ?? payload.pages[0];

      setMessage(`站点初始化完成，已生成 ${payload.pages.length} 个独立页面。`);
      router.push(`/editor/pages/${homepage.slug}`);
      router.refresh();
    });
  };

  const handleReplaceSite = (input: {
    templateId: SiteTemplateId;
    selectedPages: EnterprisePageKey[];
    footerTemplate: FooterTemplateId;
  }) => {
    startTransition(async () => {
      const response = await fetch("/api/site-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...input,
          replaceExisting: true,
        }),
      });

      const payload = (await response.json()) as TemplateCreateResponse & {
        message?: string;
      };

      if (!response.ok) {
        setMessage(payload.message ?? "模板覆盖失败。");
        return;
      }

      const homepage =
        payload.pages.find((page) => page.slug === "homepage") ?? payload.pages[0];

      setMessage(`已按新模板重建站点，共生成 ${payload.pages.length} 个页面。`);
      router.push(`/editor/pages/${homepage.slug}`);
      router.refresh();
    });
  };

  const handlePublishSite = () => {
    startTransition(async () => {
      const response = await fetch("/api/site/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(payload.message ?? "整站发布失败。");
        return;
      }

      setMessage(payload.message ?? "整站已发布。");
      router.refresh();
    });
  };

  const handleSinglePageSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug,
        }),
      });

      const payload = (await response.json()) as BuilderPageResponse & {
        message?: string;
      };

      if (!response.ok) {
        setMessage(payload.message ?? "单页创建失败。");
        return;
      }

      setMessage(`页面“${payload.title}”已创建，当前状态为草稿。`);
      router.push(`/editor/pages/${payload.slug}`);
      router.refresh();
    });
  };

  const handleDeletePage = (page: BuilderPageListItem) => {
    setConfirmDialogState({
      title: "删除页面",
      description: `确认删除页面“${page.title}”吗？此操作不可撤销。`,
      actionLabel: "确认删除",
      onConfirm: () => {
        startTransition(async () => {
          const response = await fetch(`/api/pages/${page.slug}`, {
            method: "DELETE",
          });

          const payload = (await response.json()) as { message?: string };

          if (!response.ok) {
            setMessage(payload.message ?? "页面删除失败。");
            return;
          }

          setMessage(payload.message ?? `页面“${page.title}”已删除。`);
          router.refresh();
        });
      },
    });
    setConfirmDialogOpen(true);
  };

  return (
    <main className="editor-radius-half min-h-screen px-4 py-5 md:px-6">
      <EditorFlowNav activeStep="editor" editorHref={editorStepHref} />
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                企业官网建站器
              </p>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                  {hasDatabasePages ? "页面管理" : "选择行业模板"}
                </h1>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">
                  {hasDatabasePages
                    ? "当前站点已经初始化完成。你可以继续新建页面，也可以重新选择行业模板覆盖当前站点。"
                    : "先选行业模板并生成标准页面，再进入拖拽编辑器逐页修改。"}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-1.5 lg:items-end">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-2.5 py-1 text-[11px] text-[var(--muted-foreground)] md:text-xs">
                {message}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {hasDatabasePages ? (
                  <>
                    <Button
                      disabled={isSubmitting}
                      onClick={handlePublishSite}
                      size="default"
                      type="button"
                      variant="default"
                    >
                      发布整站
                    </Button>
                    <SiteTemplateDialog isSubmitting={isSubmitting} onReplaceSite={handleReplaceSite} />
                  </>
                ) : null}
                <BrandThemeSwitcher className="h-9 w-9" />
                <AdminLogoutButton size="default" variant="outline" />
              </div>
            </div>
          </div>
        </header>

        {hasDatabasePages ? (
          <SitePageDashboard
            isSubmitting={isSubmitting}
            onDelete={handleDeletePage}
            onSlugChange={setSlug}
            onSubmit={handleSinglePageSubmit}
            onTitleChange={setTitle}
            pages={sortedPages}
            slug={slug}
            title={title}
          />
        ) : (
          <SiteTemplateStarter
            isSubmitting={isSubmitting}
            message={message}
            onCreateSite={handleCreateSite}
          />
        )}

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
