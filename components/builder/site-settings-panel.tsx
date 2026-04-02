/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { uploadBrowserFile } from "@/lib/media/client";
import {
  footerTemplateCatalog,
  navigationTemplateCatalog,
  type FooterTemplateId,
  type NavigationTemplateId,
} from "@/lib/builder/site-config";
import type { BuilderPageListItem } from "@/lib/builder/page-contracts";
import type { BuilderSiteConfig } from "@/lib/builder/schema";

type SiteSettingsPanelProps = {
  site: BuilderSiteConfig;
  sitePages: BuilderPageListItem[];
  onChange: (site: BuilderSiteConfig) => void;
};

type PublicSettingsTab = "site" | "navigation" | "footer";

function buildNavigationLink(page: BuilderPageListItem) {
  return {
    label: page.title,
    href: `/sites/${page.slug}`,
    slug: page.slug,
  };
}

function getOrderedNavigationItems(
  site: BuilderSiteConfig,
  sitePages: BuilderPageListItem[],
) {
  const pageMap = new Map(sitePages.map((page) => [page.slug, page]));
  const visibleItems = site.navigationLinks.map((link) => {
    const page = pageMap.get(link.slug);
    return page ? buildNavigationLink(page) : link;
  });
  const visibleSlugs = new Set(visibleItems.map((item) => item.slug));
  const hiddenItems = sitePages
    .filter((page) => !visibleSlugs.has(page.slug))
    .map(buildNavigationLink);

  return [...visibleItems, ...hiddenItems];
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-slate-950 text-white"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

export function SiteSettingsPanel({
  site,
  sitePages,
  onChange,
}: SiteSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<PublicSettingsTab>("site");
  const orderedNavigationItems = getOrderedNavigationItems(site, sitePages);

  const updateSite = <T extends keyof BuilderSiteConfig>(
    key: T,
    value: BuilderSiteConfig[T],
  ) => {
    onChange({
      ...site,
      [key]: value,
    });
  };

  const updateFooter = <T extends keyof BuilderSiteConfig["footer"]>(
    key: T,
    value: BuilderSiteConfig["footer"][T],
  ) => {
    onChange({
      ...site,
      footer: {
        ...site.footer,
        [key]: value,
      },
    });
  };

  const handleImageUpload = async (
    fileList: FileList | null,
    target: "logoSrc" | "faviconSrc",
  ) => {
    const file = fileList?.[0];

    if (!file) {
      return;
    }

    try {
      const url = await uploadBrowserFile(file, "site");
      const nextSite = {
        ...site,
        [target]: url,
      };

      if (target === "logoSrc" && !site.faviconSrc) {
        nextSite.faviconSrc = url;
      }

      onChange(nextSite);
    } catch (error) {
      console.error("Failed to upload site asset", error);
    }
  };

  const updateNavigationLinks = (nextLinks: BuilderSiteConfig["navigationLinks"]) => {
    onChange({
      ...site,
      navigationLinks: nextLinks,
    });
  };

  const updateNavigationTemplate = (template: NavigationTemplateId) => {
    onChange({
      ...site,
      navigationTemplate: template,
    });
  };

  const handleToggleNavigation = (slug: string) => {
    const page = sitePages.find((item) => item.slug === slug);

    if (!page) {
      return;
    }

    const existingIndex = site.navigationLinks.findIndex((item) => item.slug === slug);

    if (existingIndex >= 0) {
      updateNavigationLinks(site.navigationLinks.filter((item) => item.slug !== slug));
      return;
    }

    updateNavigationLinks([...site.navigationLinks, buildNavigationLink(page)]);
  };

  const handleMoveNavigation = (slug: string, direction: "up" | "down") => {
    const currentIndex = site.navigationLinks.findIndex((item) => item.slug === slug);

    if (currentIndex < 0) {
      return;
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= site.navigationLinks.length) {
      return;
    }

    const nextLinks = [...site.navigationLinks];
    const [moved] = nextLinks.splice(currentIndex, 1);
    nextLinks.splice(targetIndex, 0, moved);
    updateNavigationLinks(nextLinks);
  };

  return (
    <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">公共设置</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          全站通用配置
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        <TabButton active={activeTab === "site"} label="站点设置" onClick={() => setActiveTab("site")} />
        <TabButton
          active={activeTab === "navigation"}
          label="导航菜单"
          onClick={() => setActiveTab("navigation")}
        />
        <TabButton active={activeTab === "footer"} label="公共底部" onClick={() => setActiveTab("footer")} />
      </div>

      {activeTab === "site" ? (
        <div className="space-y-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">公司名称</span>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-700"
              onChange={(event) => updateSite("name", event.target.value)}
              value={site.name}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">站点副标题</span>
            <textarea
              className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-700"
              onChange={(event) => updateSite("tagline", event.target.value)}
              value={site.tagline}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Logo 地址</span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-700"
                onChange={(event) => updateSite("logoSrc", event.target.value)}
                value={site.logoSrc}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Favicon 地址</span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-700"
                onChange={(event) => updateSite("faviconSrc", event.target.value)}
                value={site.faviconSrc}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">上传 Logo</span>
              <input
                accept="image/*"
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-white"
                onChange={(event) => {
                  void handleImageUpload(event.target.files, "logoSrc");
                }}
                type="file"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">上传 Favicon</span>
              <input
                accept="image/*"
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-white"
                onChange={(event) => {
                  void handleImageUpload(event.target.files, "faviconSrc");
                }}
                type="file"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Logo 预览</p>
              {site.logoSrc ? (
                <img alt={site.name} className="mt-3 h-16 w-16 rounded-lg object-cover" src={site.logoSrc} />
              ) : (
                <p className="mt-3 text-sm text-slate-400">暂未设置</p>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Favicon 预览</p>
              {site.faviconSrc ? (
                <img
                  alt={`${site.name} favicon`}
                  className="mt-3 h-16 w-16 rounded-lg object-cover"
                  src={site.faviconSrc}
                />
              ) : (
                <p className="mt-3 text-sm text-slate-400">暂未设置</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "navigation" ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">导航样式</p>
            <p className="mt-1 text-xs text-slate-500">用于编辑页顶部导航和前台站点顶部导航。</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {navigationTemplateCatalog.map((template) => {
                const isActive = site.navigationTemplate === template.id;

                return (
                  <button
                    className={`rounded-lg border px-3 py-2 text-left transition ${
                      isActive
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    key={template.id}
                    onClick={() => updateNavigationTemplate(template.id)}
                    type="button"
                  >
                    <p className="text-xs font-semibold text-slate-900">{template.name}</p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      {template.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {orderedNavigationItems.map((item) => {
            const visibleIndex = site.navigationLinks.findIndex((link) => link.slug === item.slug);
            const isVisible = visibleIndex >= 0;
            const canMoveUp = visibleIndex > 0;
            const canMoveDown = visibleIndex >= 0 && visibleIndex < site.navigationLinks.length - 1;

            return (
              <div
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"
                key={item.slug}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-400">/{item.slug}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      isVisible
                        ? "bg-slate-950 text-white"
                        : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                    onClick={() => handleToggleNavigation(item.slug)}
                    type="button"
                  >
                    {isVisible ? "显示中" : "已隐藏"}
                  </button>

                  <button
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                    disabled={!canMoveUp}
                    onClick={() => handleMoveNavigation(item.slug, "up")}
                    type="button"
                  >
                    上移
                  </button>

                  <button
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                    disabled={!canMoveDown}
                    onClick={() => handleMoveNavigation(item.slug, "down")}
                    type="button"
                  >
                    下移
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {activeTab === "footer" ? (
        <div className="space-y-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">底部模板</span>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-700"
              onChange={(event) => updateFooter("template", event.target.value as FooterTemplateId)}
              value={site.footer.template}
            >
              {footerTemplateCatalog.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">公司地址</span>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-700"
              onChange={(event) => updateFooter("companyAddress", event.target.value)}
              value={site.footer.companyAddress}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">联系电话</span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-700"
                onChange={(event) => updateFooter("phone", event.target.value)}
                value={site.footer.phone}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">联系邮箱</span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-700"
                onChange={(event) => updateFooter("email", event.target.value)}
                value={site.footer.email}
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">备案号</span>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-700"
              onChange={(event) => updateFooter("registrationNumber", event.target.value)}
              value={site.footer.registrationNumber}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">版权文案</span>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-700"
              onChange={(event) => updateFooter("copyrightText", event.target.value)}
              value={site.footer.copyrightText}
            />
          </label>
        </div>
      ) : null}
    </aside>
  );
}
