import {
  enterprisePageCatalog,
  type EnterprisePageKey,
  type SiteTemplateId,
} from "@/lib/builder/template-catalog";
import {
  resolveSiteFaviconSrc,
  resolveSiteLogoSrc,
  resolveSiteName,
} from "@/lib/brand/identity";
import { normalizeHeroBannerSources } from "@/lib/builder/banner-media";

export const footerTemplateCatalog = [
  {
    id: "classic",
    name: "经典双栏",
    description: "左侧放品牌与说明，右侧集中展示地址、电话和备案号。",
  },
  {
    id: "stacked",
    name: "信息分组",
    description: "把联系方式拆成三列信息块，更适合企业站点首页和品牌页。",
  },
  {
    id: "minimal",
    name: "极简横栏",
    description: "更轻量的底部样式，适合科技和 SaaS 风格。",
  },
] as const;

export type FooterTemplateId = (typeof footerTemplateCatalog)[number]["id"];

export const navigationTemplateCatalog = [
  {
    id: "filled",
    name: "胶囊高亮",
    description: "当前页面使用主色胶囊高亮，其它项使用浅底悬浮。",
  },
  {
    id: "underline",
    name: "下划线导航",
    description: "文字更轻量，当前页面通过下划线与主色强调。",
  },
  {
    id: "outline",
    name: "描边分段",
    description: "所有菜单项都有描边，当前页面使用浅背景强调。",
  },
] as const;

export type NavigationTemplateId = (typeof navigationTemplateCatalog)[number]["id"];

export type SiteNavigationLink = {
  label: string;
  href: string;
  slug: string;
};

export type SiteFooterConfig = {
  template: FooterTemplateId;
  registrationNumber: string;
  companyAddress: string;
  phone: string;
  email: string;
  copyrightText: string;
};

export type SiteConfigInput = {
  name: string;
  tagline?: string;
  logoSrc?: string;
  faviconSrc?: string;
  heroBannerSources?: string[];
  navigationTemplate?: NavigationTemplateId;
  navigationLinks?: SiteNavigationLink[];
  footer?: Partial<SiteFooterConfig>;
};

export function getDefaultFooterTemplate(templateId: SiteTemplateId): FooterTemplateId {
  switch (templateId) {
    case "corporate-services":
      return "classic";
    case "manufacturing":
      return "stacked";
    case "research-lab":
      return "minimal";
    case "saas":
    default:
      return "minimal";
  }
}

export function buildNavigationLinks(
  selectedPages: EnterprisePageKey[],
): SiteNavigationLink[] {
  return enterprisePageCatalog
    .filter((page) => selectedPages.includes(page.key))
    .map((page) => ({
      label: page.title,
      href: `/sites/${page.slug}`,
      slug: page.slug,
    }));
}

export function createSiteFooterConfig(
  overrides?: Partial<SiteFooterConfig>,
): SiteFooterConfig {
  return {
    template: overrides?.template ?? "classic",
    registrationNumber: overrides?.registrationNumber ?? "沪ICP备2026000001号",
    companyAddress: overrides?.companyAddress ?? "上海市徐汇区示例大道 88 号",
    phone: overrides?.phone ?? "400-800-1234",
    email: overrides?.email ?? "hello@example.com",
    copyrightText: overrides?.copyrightText ?? "© 2026 PageForge. All rights reserved.",
  };
}

export function createSiteConfig(input: SiteConfigInput) {
  return {
    name: resolveSiteName(input.name),
    tagline: input.tagline ?? "",
    logoSrc: resolveSiteLogoSrc(input.logoSrc),
    faviconSrc: resolveSiteFaviconSrc({
      faviconSrc: input.faviconSrc,
      logoSrc: input.logoSrc,
    }),
    heroBannerSources: normalizeHeroBannerSources(input.heroBannerSources),
    navigationTemplate: input.navigationTemplate ?? "filled",
    navigationLinks: input.navigationLinks ?? [],
    footer: createSiteFooterConfig(input.footer),
  };
}
