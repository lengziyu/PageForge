"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { SitePageDashboard } from "@/components/builder/site-page-dashboard";
import { SiteTemplateStarter } from "@/components/builder/site-template-starter";
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

export function PageManager({ initialPages }: PageManagerProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState(
    "请选择行业模板并勾选要生成的页面，完成后会自动进入首页编辑。",
  );
  const [isSubmitting, startTransition] = useTransition();

  const sortedPages = initialPages;

  const hasDatabasePages = sortedPages.some((page) => page.source === "database");

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
    if (!window.confirm(`确认删除页面“${page.title}”吗？此操作不可撤销。`)) {
      return;
    }

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
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef2f8_0%,#f7f9fc_100%)] px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-xl border border-slate-200 bg-slate-950 px-6 py-6 text-white shadow-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                企业官网建站器
              </p>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  {hasDatabasePages ? "页面管理" : "选择行业模板"}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
                  {hasDatabasePages
                    ? "当前站点已经初始化完成。你可以继续新建页面，也可以重新选择行业模板覆盖当前站点。"
                    : "先选行业模板并生成标准页面，再进入拖拽编辑器逐页修改。"}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                {message}
              </div>
              <AdminLogoutButton />
            </div>
          </div>
        </header>

        {hasDatabasePages ? (
          <SitePageDashboard
            isSubmitting={isSubmitting}
            onDelete={handleDeletePage}
            onPublishSite={handlePublishSite}
            onReplaceSite={handleReplaceSite}
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

        <div className="flex justify-start">
          <Link
            className="inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            href="/"
          >
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}
