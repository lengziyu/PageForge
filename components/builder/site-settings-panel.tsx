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
import { ImageSizeHint } from "@/components/ui/image-size-hint";
import {
  PAGEFORGE_DEFAULT_SITE_NAME,
  resolveSiteFaviconSrc,
  resolveSiteLogoSrc,
  resolveSiteName,
} from "@/lib/brand/identity";

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
    children: [],
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

function detachNavigationSlug(
  links: BuilderSiteConfig["navigationLinks"],
  slug: string,
) {
  return links
    .filter((link) => link.slug !== slug)
    .map((link) => ({
      ...link,
      children: (link.children ?? []).filter((child) => child.slug !== slug),
    }));
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
      className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition md:text-sm ${
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
  const [pendingChildByParent, setPendingChildByParent] = useState<Record<string, string>>(
    {},
  );
  const orderedNavigationItems = getOrderedNavigationItems(site, sitePages);
  const siteName = resolveSiteName(site.name);
  const logoPreviewSrc = resolveSiteLogoSrc(site.logoSrc);
  const faviconPreviewSrc = resolveSiteFaviconSrc({
    faviconSrc: site.faviconSrc,
    logoSrc: site.logoSrc,
  });

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

      if (target === "logoSrc") {
        nextSite.faviconSrc = url;
      }

      onChange(nextSite);
    } catch (error) {
      console.error("Failed to upload site asset", error);
    }
  };

  const updateNavigationLinks = (nextLinks: BuilderSiteConfig["navigationLinks"]) => {
    const pageMap = new Map(sitePages.map((page) => [page.slug, page]));
    const normalized = nextLinks.map((link) => {
      const parentPage = pageMap.get(link.slug);

      return {
        ...link,
        label: parentPage?.title ?? link.label,
        href: `/sites/${link.slug}`,
        children: (link.children ?? []).map((child) => {
          const childPage = pageMap.get(child.slug);
          return {
            ...child,
            label: childPage?.title ?? child.label,
            href: `/sites/${child.slug}`,
          };
        }),
      };
    });

    onChange({
      ...site,
      navigationLinks: normalized,
    });
  };

  const updateNavigationTemplate = (template: NavigationTemplateId) => {
    onChange({
      ...site,
      navigationTemplate: template,
    });
  };

  const updateLogoAndFavicon = (value: string) => {
    onChange({
      ...site,
      logoSrc: value,
      faviconSrc: value,
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

    const detached = detachNavigationSlug(site.navigationLinks, slug);
    updateNavigationLinks([...detached, buildNavigationLink(page)]);
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

  const getChildCandidates = (parentSlug: string) => {
    const usedChildSlugs = new Set(
      site.navigationLinks.flatMap((item) => (item.children ?? []).map((child) => child.slug)),
    );

    return sitePages.filter((page) => {
      if (page.slug === parentSlug) {
        return false;
      }
      const isCurrentChild = site.navigationLinks
        .find((item) => item.slug === parentSlug)
        ?.children?.some((child) => child.slug === page.slug);

      return isCurrentChild || !usedChildSlugs.has(page.slug);
    });
  };

  const addChildNavigation = (parentSlug: string) => {
    const parentIndex = site.navigationLinks.findIndex((item) => item.slug === parentSlug);

    if (parentIndex < 0) {
      return;
    }

    const candidates = getChildCandidates(parentSlug);
    const candidateSlug = pendingChildByParent[parentSlug] ?? candidates[0]?.slug;
    const page = sitePages.find((item) => item.slug === candidateSlug);

    if (!candidateSlug || !page) {
      return;
    }

    const detached = detachNavigationSlug(site.navigationLinks, candidateSlug);
    const updated = [...detached];
    const normalizedParentIndex = updated.findIndex((item) => item.slug === parentSlug);

    if (normalizedParentIndex < 0) {
      return;
    }

    const parent = updated[normalizedParentIndex];
    const nextChildren = [...(parent.children ?? []), {
      label: page.title,
      href: `/sites/${page.slug}`,
      slug: page.slug,
    }];

    updated[normalizedParentIndex] = {
      ...parent,
      children: nextChildren,
    };

    updateNavigationLinks(updated);
  };

  const removeChildNavigation = (parentSlug: string, childSlug: string) => {
    const updated = site.navigationLinks.map((item) => {
      if (item.slug !== parentSlug) {
        return item;
      }

      return {
        ...item,
        children: (item.children ?? []).filter((child) => child.slug !== childSlug),
      };
    });

    updateNavigationLinks(updated);
  };

  const moveChildNavigation = (
    parentSlug: string,
    childSlug: string,
    direction: "up" | "down",
  ) => {
    const updated = [...site.navigationLinks];
    const parentIndex = updated.findIndex((item) => item.slug === parentSlug);

    if (parentIndex < 0) {
      return;
    }

    const parent = updated[parentIndex];
    const children = [...(parent.children ?? [])];
    const childIndex = children.findIndex((item) => item.slug === childSlug);

    if (childIndex < 0) {
      return;
    }

    const targetIndex = direction === "up" ? childIndex - 1 : childIndex + 1;
    if (targetIndex < 0 || targetIndex >= children.length) {
      return;
    }

    const [moved] = children.splice(childIndex, 1);
    children.splice(targetIndex, 0, moved);

    updated[parentIndex] = {
      ...parent,
      children,
    };

    updateNavigationLinks(updated);
  };

  return (
    <aside className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">公司名称</span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-700"
                onChange={(event) => updateSite("name", event.target.value)}
                placeholder={PAGEFORGE_DEFAULT_SITE_NAME}
                value={site.name}
              />
              <p className="text-xs text-slate-500">未设置时默认使用：{PAGEFORGE_DEFAULT_SITE_NAME}</p>
            </label>

            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-700">滚动动画</p>

              <label className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2">
                <span className="text-sm text-slate-700">启用滚动动效</span>
                <input
                  checked={site.scrollAnimationEnabled}
                  className="h-4 w-4 accent-indigo-600"
                  onChange={(event) => updateSite("scrollAnimationEnabled", event.target.checked)}
                  type="checkbox"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium text-slate-600">动效样式</span>
                <select
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-700"
                  onChange={(event) =>
                    updateSite(
                      "scrollAnimationPreset",
                      event.target.value as BuilderSiteConfig["scrollAnimationPreset"],
                    )
                  }
                  value={site.scrollAnimationPreset}
                >
                  <option value="rise">往上一点</option>
                  <option value="fade">渐隐渐现</option>
                  <option value="zoom">轻微放大</option>
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium text-slate-600">动效时长（ms）</span>
                <input
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-700"
                  min={300}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value);
                    if (!Number.isFinite(nextValue)) {
                      return;
                    }
                    updateSite("scrollAnimationDurationMs", Math.max(300, Math.min(5000, nextValue)));
                  }}
                  step={100}
                  type="number"
                  value={site.scrollAnimationDurationMs}
                />
              </label>
            </div>
          </div>

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
                onChange={(event) => updateLogoAndFavicon(event.target.value)}
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
              <ImageSizeHint guideKey="siteLogo" />
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
              <ImageSizeHint guideKey="siteFavicon" />
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
              <img alt={siteName} className="mt-3 h-16 w-16 rounded-lg object-cover" src={logoPreviewSrc} />
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Favicon 预览</p>
              <img
                alt={`${siteName} favicon`}
                className="mt-3 h-16 w-16 rounded-lg object-cover"
                src={faviconPreviewSrc}
              />
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "navigation" ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-sm font-semibold text-slate-900">导航样式</p>
            <p className="mt-1 text-[11px] text-slate-500">用于编辑页顶部导航和前台站点顶部导航。</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {navigationTemplateCatalog.map((template) => {
                const isActive = site.navigationTemplate === template.id;

                return (
                  <button
                    className={`rounded-md border px-2.5 py-2 text-left transition ${
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
            const parentChildren = isVisible ? site.navigationLinks[visibleIndex]?.children ?? [] : [];
            const childCandidates = isVisible ? getChildCandidates(item.slug) : [];
            const pendingChildValue =
              pendingChildByParent[item.slug] ?? childCandidates[0]?.slug ?? "";

            return (
              <div
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2.5"
                key={item.slug}
              >
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="mt-1 text-xs text-slate-400">/{item.slug}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <button
                      className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
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
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                      disabled={!canMoveUp}
                      onClick={() => handleMoveNavigation(item.slug, "up")}
                      type="button"
                    >
                      上移
                    </button>

                    <button
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                      disabled={!canMoveDown}
                      onClick={() => handleMoveNavigation(item.slug, "down")}
                      type="button"
                    >
                      下移
                    </button>
                  </div>
                </div>

                {isVisible ? (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      二级菜单
                    </p>

                    <div className="mt-2 flex items-center gap-1.5">
                      <select
                        className="h-9 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none transition focus:border-[var(--ring)]"
                        onChange={(event) =>
                          setPendingChildByParent((current) => ({
                            ...current,
                            [item.slug]: event.target.value,
                          }))
                        }
                        value={pendingChildValue}
                      >
                        {childCandidates.length === 0 ? (
                          <option value="">暂无可选页面</option>
                        ) : (
                          childCandidates.map((candidate) => (
                            <option key={`${item.slug}-${candidate.slug}`} value={candidate.slug}>
                              {candidate.title}
                            </option>
                          ))
                        )}
                      </select>
                      <button
                        className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                        disabled={childCandidates.length === 0}
                        onClick={() => addChildNavigation(item.slug)}
                        type="button"
                      >
                        添加子菜单
                      </button>
                    </div>

                    <div className="mt-2 space-y-2">
                      {parentChildren.length === 0 ? (
                        <p className="text-xs text-slate-400">当前没有二级菜单</p>
                      ) : (
                        parentChildren.map((child, childIndex) => (
                          <div
                            className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5"
                            key={`${item.slug}-${child.slug}`}
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm text-slate-700">{child.label}</p>
                              <p className="text-[11px] text-slate-400">/{child.slug}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 disabled:text-slate-300"
                                disabled={childIndex === 0}
                                onClick={() => moveChildNavigation(item.slug, child.slug, "up")}
                                type="button"
                              >
                                上移
                              </button>
                              <button
                                className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 disabled:text-slate-300"
                                disabled={childIndex === parentChildren.length - 1}
                                onClick={() => moveChildNavigation(item.slug, child.slug, "down")}
                                type="button"
                              >
                                下移
                              </button>
                              <button
                                className="rounded border border-rose-200 bg-white px-2 py-1 text-[11px] text-rose-700"
                                onClick={() => removeChildNavigation(item.slug, child.slug)}
                                type="button"
                              >
                                删除
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
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
