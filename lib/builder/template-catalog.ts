export const enterprisePageCatalog = [
  {
    key: "homepage",
    slug: "homepage",
    title: "首页",
    description: "品牌总览页，用来承接企业简介、核心能力与主要转化入口。",
    required: true,
    defaultSelected: true,
  },
  {
    key: "services-products",
    slug: "services-products",
    title: "服务与产品",
    description: "说明服务矩阵、解决方案和产品能力边界。",
    required: false,
    defaultSelected: true,
  },
  {
    key: "technology-rd",
    slug: "technology-rd",
    title: "技术研发",
    description: "适合需要突出平台能力、架构深度和研发体系的企业。",
    required: false,
    defaultSelected: false,
  },
  {
    key: "news",
    slug: "news",
    title: "新闻资讯",
    description: "沉淀企业动态、行业观点和品牌内容资产。",
    required: false,
    defaultSelected: true,
  },
  {
    key: "about-us",
    slug: "about-us",
    title: "关于我们",
    description: "介绍企业定位、团队能力和发展历程。",
    required: true,
    defaultSelected: true,
  },
  {
    key: "contact",
    slug: "contact",
    title: "联系我们",
    description: "提供清晰的商务沟通入口与联系信息。",
    required: false,
    defaultSelected: true,
  },
] as const;

export type EnterprisePageKey = (typeof enterprisePageCatalog)[number]["key"];

export const defaultSelectedEnterprisePages = enterprisePageCatalog
  .filter((page) => page.defaultSelected)
  .map((page) => page.key) as EnterprisePageKey[];

export const standardEnterprisePages = enterprisePageCatalog.map(
  (page) => page.title,
) as readonly string[];

export const siteTemplateCatalog = [
  {
    id: "saas",
    name: "科技 SaaS",
    industry: "适合软件平台、云服务、AI 工具类企业官网。",
    summary: "偏极简 SaaS 气质，强调产品能力、品牌可信度和线索转化效率。",
    accent: "深蓝偏紫",
    previewPages: ["首页", "服务与产品", "新闻资讯", "关于我们", "联系我们"],
  },
  {
    id: "corporate-services",
    name: "企业服务",
    industry: "适合咨询、解决方案、B2B 服务型企业。",
    summary: "风格更稳健，重点突出服务结构、合作方式与商务可信感。",
    accent: "克制商务",
    previewPages: ["首页", "服务与产品", "新闻资讯", "关于我们", "联系我们"],
  },
  {
    id: "manufacturing",
    name: "工业制造",
    industry: "适合制造、设备、工程类企业官网。",
    summary: "强调制造能力、交付实力、资质案例与企业信任感。",
    accent: "工业理性",
    previewPages: ["首页", "服务与产品", "关于我们", "联系我们"],
  },
  {
    id: "research-lab",
    name: "研发实验室",
    industry: "适合科研平台、技术团队、创新研发型企业。",
    summary: "强调研发体系、技术可信度与长期创新能力。",
    accent: "冷静理性",
    previewPages: ["首页", "服务与产品", "技术研发", "新闻资讯", "关于我们", "联系我们"],
  },
] as const;

export type SiteTemplateId = (typeof siteTemplateCatalog)[number]["id"];

export function isSiteTemplateId(value: string): value is SiteTemplateId {
  return siteTemplateCatalog.some((template) => template.id === value);
}

export function isEnterprisePageKey(value: string): value is EnterprisePageKey {
  return enterprisePageCatalog.some((page) => page.key === value);
}
