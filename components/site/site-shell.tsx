/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandThemeSwitcher } from "@/components/theme/brand-theme-switcher";
import type { BuilderPageListItem } from "@/lib/builder/page-contracts";
import type { BuilderPageDocument } from "@/lib/builder/schema";
import { resolveSiteLogoSrc, resolveSiteName } from "@/lib/brand/identity";

type SiteShellProps = {
  activeSlug: string;
  document: BuilderPageDocument;
  pages: BuilderPageListItem[];
  children: ReactNode;
};

function buildNavigationItems(
  document: BuilderPageDocument,
  pages: BuilderPageListItem[],
) {
  const publishedSlugs = new Set(pages.map((page) => page.slug));
  const configuredLinks = document.site.navigationLinks.filter((link) =>
    publishedSlugs.has(link.slug),
  );

  if (configuredLinks.length > 0) {
    return configuredLinks;
  }

  return pages.map((page) => ({
    label: page.title,
    href: `/sites/${page.slug}`,
    slug: page.slug,
  }));
}

function getNavigationContainerClass(
  template: BuilderPageDocument["site"]["navigationTemplate"],
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

function getNavigationItemClass(
  template: BuilderPageDocument["site"]["navigationTemplate"],
  isActive: boolean,
) {
  switch (template) {
    case "underline":
      return isActive
        ? "relative px-1 py-2 text-sm font-semibold text-[var(--primary)] after:absolute after:-bottom-0.5 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-[var(--primary)]"
        : "relative px-1 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900";
    case "outline":
      return isActive
        ? "rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900"
        : "rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50";
    case "filled":
    default:
      return isActive
        ? "rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
        : "rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100";
  }
}

function FooterClassic({ document }: { document: BuilderPageDocument }) {
  const footer = document.site.footer;
  const siteName = resolveSiteName(document.site.name);

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-lg font-semibold text-slate-950">{siteName}</p>
          <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">
            {document.site.tagline || "以模块化方式搭建更清晰、更可信的企业官网。"}
          </p>
        </div>
        <div className="grid gap-3 text-sm text-slate-600">
          <p>公司地址：{footer.companyAddress}</p>
          <p>联系电话：{footer.phone}</p>
          <p>联系邮箱：{footer.email}</p>
          <p>备案号：{footer.registrationNumber}</p>
          <p className="text-slate-500">{footer.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterStacked({ document }: { document: BuilderPageDocument }) {
  const footer = document.site.footer;
  const siteName = resolveSiteName(document.site.name);

  return (
    <footer className="border-t border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-950">{siteName}</p>
            <p className="mt-2 text-sm text-slate-600">
              {document.site.tagline || "为企业提供清晰的官网表达与长期内容沉淀。"}
            </p>
          </div>
          <p className="text-sm text-slate-500">{footer.copyrightText}</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { title: "公司地址", value: footer.companyAddress },
            { title: "联系电话", value: footer.phone },
            { title: "备案号", value: footer.registrationNumber },
          ].map((item) => (
            <div
              className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
              key={item.title}
            >
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                {item.title}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-700">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

function FooterMinimal({ document }: { document: BuilderPageDocument }) {
  const footer = document.site.footer;
  const siteName = resolveSiteName(document.site.name);

  return (
    <footer className="border-t border-slate-200 bg-[var(--primary-strong)] text-[var(--primary-foreground)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">{siteName}</p>
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
    </footer>
  );
}

function SiteFooter({ document }: { document: BuilderPageDocument }) {
  switch (document.site.footer.template) {
    case "stacked":
      return <FooterStacked document={document} />;
    case "minimal":
      return <FooterMinimal document={document} />;
    case "classic":
    default:
      return <FooterClassic document={document} />;
  }
}

export function SiteShell({
  activeSlug,
  document,
  pages,
  children,
}: SiteShellProps) {
  const navigationItems = buildNavigationItems(document, pages);
  const navigationTemplate = document.site.navigationTemplate ?? "filled";
  const siteName = resolveSiteName(document.site.name);
  const logoSrc = resolveSiteLogoSrc(document.site.logoSrc);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/92 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <img
              alt={siteName}
              className="h-11 w-11 rounded-lg object-cover"
              src={logoSrc}
            />
            <div>
              <Link
                className="text-lg font-semibold text-slate-950"
                href="/sites/homepage"
                style={{ color: "#020617" }}
              >
                {siteName}
              </Link>
              <p className="mt-1 text-sm text-slate-500">{document.site.tagline}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <nav className={getNavigationContainerClass(navigationTemplate)}>
              {navigationItems.map((item) => {
                const isActive = item.slug === activeSlug;

                return (
                  <Link
                    className={getNavigationItemClass(navigationTemplate, isActive)}
                    href={item.href}
                    key={item.slug}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <BrandThemeSwitcher />
          </div>
        </div>
      </header>

      <main>{children}</main>

      <SiteFooter document={document} />
    </div>
  );
}
