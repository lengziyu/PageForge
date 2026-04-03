import type { CtaBlockProps } from "@/lib/builder/blocks/cta";
import type { CompanyIntroProps } from "@/lib/builder/blocks/company-intro";
import type { ContactMethodsProps } from "@/lib/builder/blocks/contact-methods";
import type { FeatureListBlockProps } from "@/lib/builder/blocks/feature-list";
import type { HeroBlockProps } from "@/lib/builder/blocks/hero";
import type { LocationMapProps } from "@/lib/builder/blocks/location-map";
import type { NewsListProps } from "@/lib/builder/blocks/news-list";
import type { ServiceGridProps } from "@/lib/builder/blocks/service-grid";
import type { StatsStripProps } from "@/lib/builder/blocks/stats-strip";
import type { TechHighlightsProps } from "@/lib/builder/blocks/tech-highlights";
import { createPageDocument } from "@/lib/builder/page-factory";
import {
  buildNavigationLinks,
  createSiteConfig,
  getDefaultFooterTemplate,
} from "@/lib/builder/site-config";
import type {
  BuilderPageDocument,
  BuilderPageSection,
  BuilderSiteConfig,
} from "@/lib/builder/schema";
import {
  defaultSelectedEnterprisePages,
  enterprisePageCatalog,
  type EnterprisePageKey,
  type SiteTemplateId,
} from "@/lib/builder/template-catalog";

type TemplateConfig = {
  siteName: string;
  siteTagline: string;
  logoSrc: string;
  keyword: string;
  contactEmail: string;
  phone: string;
  address: string;
  registrationNumber: string;
  heroImages: Record<EnterprisePageKey, string>;
  homepageHero: Omit<HeroBlockProps, "backgroundImageSrc">;
  homepageStats: StatsStripProps;
  homepageFeatures: FeatureListBlockProps;
};

type TemplatePageBuilderContext = {
  config: TemplateConfig;
  selectedPages: EnterprisePageKey[];
  site: BuilderSiteConfig;
};

function pageUrl(slug: string) {
  return `/sites/${slug}`;
}

function createSection<TType extends BuilderPageSection["type"]>(
  slug: string,
  type: TType,
  props: Extract<BuilderPageSection, { type: TType }>["props"],
): Extract<BuilderPageSection, { type: TType }> {
  return {
    id: `${slug}-${type}-${crypto.randomUUID().slice(0, 8)}`,
    type,
    props,
  } as Extract<BuilderPageSection, { type: TType }>;
}

function createHero(
  image: string,
  input: Omit<HeroBlockProps, "backgroundImageSrc">,
): HeroBlockProps {
  return {
    ...input,
    backgroundImageSrc: image,
  };
}

function createTemplatePageDocument(input: {
  site: BuilderSiteConfig;
  slug: string;
  title: string;
  sections: BuilderPageSection[];
}): BuilderPageDocument {
  return createPageDocument({
    slug: input.slug,
    title: input.title,
    sections: input.sections,
    site: input.site,
  });
}

function createServiceGrid(keyword: string): ServiceGridProps {
  return {
    title: "服务与产品",
    description: `围绕 ${keyword} 场景，拆解清晰的服务矩阵、解决方案和交付方式，方便客户快速理解你的能力。`,
    sourceMode: "manual",
    variant: "cards",
    showCount: 3,
    ctaLabel: "查看详情",
    items: [
      {
        tag: "01",
        title: "咨询策划",
        description: "从业务目标、客户画像到官网结构梳理，先把表达讲清楚，再进入页面搭建。",
        slug: "",
        coverImage: "/hero/about-studio.svg",
      },
      {
        tag: "02",
        title: "解决方案",
        description: "把复杂能力拆成更易理解的方案包、产品线和服务组合，降低商务沟通门槛。",
        slug: "",
        coverImage: "/hero/technology-platform.svg",
      },
      {
        tag: "03",
        title: "上线运营",
        description: "覆盖发布、内容迭代和持续优化，让官网长期服务业务增长。",
        slug: "",
        coverImage: "/hero/news-media-wall.svg",
      },
    ],
  };
}

function createTechHighlights(keyword: string): TechHighlightsProps {
  return {
    title: "技术研发",
    description: `用更可信的方式展示 ${keyword} 背后的研发体系、架构能力和工程标准。`,
    items: [
      {
        metric: "100+",
        title: "需求迭代",
        description: "以稳定节奏组织需求、开发、测试与上线交付，让研发过程清晰可见。",
      },
      {
        metric: "99.9%",
        title: "服务稳定性",
        description: "在可用性、安全性与性能标准上保持企业级要求，降低平台运行风险。",
      },
      {
        metric: "24/7",
        title: "监控响应",
        description: "建立日志、监控与告警机制，确保关键业务链路可观察、可响应。",
      },
    ],
  };
}

function createNewsList(keyword: string): NewsListProps {
  return {
    title: "新闻资讯",
    description: `围绕 ${keyword} 持续沉淀品牌动态、行业观点和内容资产。`,
    sourceMode: "newsroom",
    showCount: 3,
    items: [
      {
        category: "品牌动态",
        title: "发布年度产品路线图与升级计划",
        date: "2026-03-29",
        summary: "系统梳理未来一年的重点推进方向，帮助客户理解下一阶段的能力布局。",
        slug: "annual-roadmap-update",
        coverImage: "/hero/news-media-wall.svg",
      },
      {
        category: "行业观点",
        title: "企业官网如何兼顾品牌表达与业务转化",
        date: "2026-03-20",
        summary: "从信息结构、内容表达与线索入口三个维度讨论官网建设重点。",
        slug: "brand-site-observation",
        coverImage: "/hero/about-studio.svg",
      },
      {
        category: "媒体报道",
        title: "技术可信度正在成为合作评估的重要标准",
        date: "2026-03-11",
        summary: "聚焦企业如何把技术表达转化为品牌信任，并支撑长期合作。",
        slug: "technology-trust-upgrade",
        coverImage: "/hero/technology-platform.svg",
      },
    ],
  };
}

function createCompanyIntro(siteName: string): CompanyIntroProps {
  return {
    title: "关于我们",
    description: `${siteName} 专注于企业官网、品牌表达与数字化内容交付，强调结构清晰、风格克制和长期可维护。`,
    items: [
      {
        title: "品牌表达清楚",
        description: "从定位、能力边界到客户价值，用统一叙事建立更可信的品牌认知。",
      },
      {
        title: "工程交付稳定",
        description: "通过模块化和类型化约束，让官网项目更容易交付，也更容易维护。",
      },
      {
        title: "后续演进顺畅",
        description: "新增页面、替换模板和扩展模块时，都能沿着已有结构继续迭代。",
      },
    ],
  };
}

function createAboutStats(siteName: string): StatsStripProps {
  return {
    title: `${siteName} 关键数据`,
    items: [
      { value: "10+", label: "行业项目经验" },
      { value: "30+", label: "模块沉淀能力" },
      { value: "长期", label: "合作与迭代" },
    ],
  };
}

function createContactMethods(config: TemplateConfig): ContactMethodsProps {
  return {
    title: "联系我们",
    description: "把咨询入口做得更清晰，让潜在客户可以更快找到合适的沟通方式。",
    items: [
      {
        label: "商务邮箱",
        value: config.contactEmail,
        detail: "适合项目咨询、合作洽谈、方案资料索取与产品演示预约。",
      },
      {
        label: "联系电话",
        value: config.phone,
        detail: "适合需求确认、采购咨询、售前沟通与紧急事项处理。",
      },
      {
        label: "公司地址",
        value: config.address,
        detail: "支持线下会面、方案评审、项目启动和长期合作对接。",
      },
    ],
  };
}

function createLocationMap(config: TemplateConfig): LocationMapProps {
  return {
    title: "公司地址与到访路线",
    description: "支持高德与百度地图切换，客户可以直接定位公司地址并发起联系。",
    provider: "amap",
    layout: "split",
    companyName: config.siteName,
    address: config.address,
    phone: config.phone,
    email: config.contactEmail,
    mapEmbedSrc: "",
    heightDesktop: 460,
    heightMobile: 320,
  };
}

function createHomeCta(): CtaBlockProps {
  return {
    title: "让企业官网真正承担品牌表达与业务转化",
    description: "从模板初始化到模块化拖拽编辑，让官网既能快速上线，也能继续被团队长期维护。",
    buttonLabel: "进入联系我们",
    buttonHref: pageUrl("contact"),
  };
}

function buildHomepage({ config, site, selectedPages }: TemplatePageBuilderContext) {
  const sections: BuilderPageSection[] = [
    createSection("homepage", "hero", createHero(config.heroImages.homepage, config.homepageHero)),
    createSection("homepage", "stats-strip", config.homepageStats),
    createSection("homepage", "feature-list", config.homepageFeatures),
    createSection("homepage", "service-grid", createServiceGrid(config.keyword)),
  ];

  if (selectedPages.includes("technology-rd")) {
    sections.push(
      createSection("homepage", "tech-highlights", createTechHighlights(config.keyword)),
    );
  }

  if (selectedPages.includes("news")) {
    sections.push(createSection("homepage", "news-list", createNewsList(config.keyword)));
  }

  sections.push(createSection("homepage", "cta", createHomeCta()));

  return createTemplatePageDocument({
    site,
    slug: "homepage",
    title: "首页",
    sections,
  });
}

function buildServicesProducts({ config, site }: TemplatePageBuilderContext) {
  return createTemplatePageDocument({
    site,
    slug: "services-products",
    title: "服务与产品",
    sections: [
      createSection(
        "services-products",
        "hero",
        createHero(config.heroImages["services-products"], {
          eyebrow: "服务与产品",
          title: `围绕 ${config.keyword} 打造清晰的服务与产品结构`,
          description: "把复杂服务、产品能力和解决方案拆解成客户更容易理解的页面层次。",
          primaryCtaLabel: "获取方案",
          primaryCtaHref: pageUrl("contact"),
          secondaryCtaLabel: "了解我们",
          secondaryCtaHref: pageUrl("about-us"),
        }),
      ),
      createSection("services-products", "service-grid", {
        ...createServiceGrid(config.keyword),
        title: "用更丰富的产品形态讲清楚你的能力",
        description: "支持产品详情、图集、亮点和规格参数，让服务与产品页面不再只是静态卡片。",
        sourceMode: "products",
        variant: "cards",
        showCount: 6,
      }),
      createSection("services-products", "feature-list", {
        title: "更适合企业官网的服务表达方式",
        description: "把服务页做成客户更容易理解、团队更容易维护的结构。",
        items: [
          {
            icon: "layers",
            title: "信息层级清楚",
            description: "从能力概览到细分服务逐层展开，方便客户快速定位关键信息。",
          },
          {
            icon: "spark",
            title: "方案表达更稳",
            description: "把原本零散的产品和服务整合成清晰的解决方案矩阵。",
          },
          {
            icon: "shield",
            title: "合作信任更强",
            description: "通过结构化内容和一致视觉语言，建立更稳的商务可信感。",
          },
        ],
      }),
      createSection("services-products", "cta", {
        title: "想把服务结构整理得更清楚一些？",
        description: "可以从当前模板继续补充更多服务项、能力卡片和行业方案。",
        buttonLabel: "进入联系我们",
        buttonHref: pageUrl("contact"),
      }),
    ],
  });
}

function buildTechnology({ config, site }: TemplatePageBuilderContext) {
  return createTemplatePageDocument({
    site,
    slug: "technology-rd",
    title: "技术研发",
    sections: [
      createSection(
        "technology-rd",
        "hero",
        createHero(config.heroImages["technology-rd"], {
          eyebrow: "技术研发",
          title: "展示研发体系、平台能力与工程方法",
          description: "让技术表达既有专业深度，也能被客户和业务决策者快速看懂。",
          primaryCtaLabel: "联系技术团队",
          primaryCtaHref: pageUrl("contact"),
          secondaryCtaLabel: "查看服务与产品",
          secondaryCtaHref: pageUrl("services-products"),
        }),
      ),
      createSection("technology-rd", "tech-highlights", createTechHighlights(config.keyword)),
      createSection("technology-rd", "stats-strip", {
        title: "研发数据",
        items: [
          { value: "3层", label: "平台架构" },
          { value: "50+", label: "能力沉淀" },
          { value: "持续", label: "版本迭代" },
        ],
      }),
      createSection("technology-rd", "cta", {
        title: "让研发能力成为官网里最可信的一部分",
        description: "通过模块化页面结构，把技术深度稳稳传达给客户与合作伙伴。",
        buttonLabel: "进入联系我们",
        buttonHref: pageUrl("contact"),
      }),
    ],
  });
}

function buildNews({ config, site }: TemplatePageBuilderContext) {
  return createTemplatePageDocument({
    site,
    slug: "news",
    title: "新闻资讯",
    sections: [
      createSection(
        "news",
        "hero",
        createHero(config.heroImages.news, {
          eyebrow: "新闻资讯",
          title: "沉淀企业动态、行业洞察与品牌内容",
          description: "把资讯页做成长期内容阵地，兼顾品牌表达、搜索可见性和专业影响力。",
          primaryCtaLabel: "了解我们",
          primaryCtaHref: pageUrl("about-us"),
          secondaryCtaLabel: "联系团队",
          secondaryCtaHref: pageUrl("contact"),
        }),
      ),
      createSection("news", "news-list", createNewsList(config.keyword)),
      createSection("news", "cta", {
        title: "让内容持续为品牌带来长期价值",
        description: "后续你可以继续新增更多新闻详情、栏目内容和专题页面。",
        buttonLabel: "联系团队",
        buttonHref: pageUrl("contact"),
      }),
    ],
  });
}

function buildAbout({ config, site }: TemplatePageBuilderContext) {
  return createTemplatePageDocument({
    site,
    slug: "about-us",
    title: "关于我们",
    sections: [
      createSection(
        "about-us",
        "hero",
        createHero(config.heroImages["about-us"], {
          eyebrow: "关于我们",
          title: "讲清企业定位、团队能力与长期价值",
          description: "帮助客户在正式沟通前更快建立认知、信任与合作预期。",
          primaryCtaLabel: "查看服务与产品",
          primaryCtaHref: pageUrl("services-products"),
          secondaryCtaLabel: "进入联系我们",
          secondaryCtaHref: pageUrl("contact"),
        }),
      ),
      createSection("about-us", "company-intro", createCompanyIntro(config.siteName)),
      createSection("about-us", "stats-strip", createAboutStats(config.siteName)),
      createSection("about-us", "contact-methods", createContactMethods(config)),
      createSection("about-us", "cta", {
        title: "把企业信任感建立在清晰表达之上",
        description: "公司介绍、数据概览和联系入口组合在一起，能让客户更自然进入下一步沟通。",
        buttonLabel: "进入联系我们",
        buttonHref: pageUrl("contact"),
      }),
    ],
  });
}

function buildContact({ config, site }: TemplatePageBuilderContext) {
  return createTemplatePageDocument({
    site,
    slug: "contact",
    title: "联系我们",
    sections: [
      createSection(
        "contact",
        "hero",
        createHero(config.heroImages.contact, {
          eyebrow: "联系我们",
          title: "建立清晰、低摩擦的商务沟通入口",
          description: "让潜在客户快速找到合适的联系渠道，减少咨询流失，提升沟通效率。",
          primaryCtaLabel: "发送邮件",
          primaryCtaHref: `mailto:${config.contactEmail}`,
          secondaryCtaLabel: "返回首页",
          secondaryCtaHref: pageUrl("homepage"),
        }),
      ),
      createSection("contact", "contact-methods", createContactMethods(config)),
      createSection("contact", "location-map", createLocationMap(config)),
      createSection("contact", "company-intro", {
        title: "为什么值得联系我们",
        description: "让客户在发起咨询前，先对合作方式、交付节奏和团队响应建立预期。",
        items: [
          {
            title: "响应更明确",
            description: "商务邮箱、电话与地址信息清楚可见，客户能快速找到合适入口。",
          },
          {
            title: "沟通更高效",
            description: "从需求确认到后续推进，都可以沿着当前站点结构顺畅承接。",
          },
          {
            title: "合作更安心",
            description: "统一的页面结构、公共导航和页脚信息，会让官网整体更像完整企业站点。",
          },
        ],
      }),
      createSection("contact", "cta", {
        title: "现在就开始一次更高效的业务沟通",
        description: "你可以先从模板站点开始，后续再按业务继续拖拽调整模块内容。",
        buttonLabel: "返回首页",
        buttonHref: pageUrl("homepage"),
      }),
    ],
  });
}

const pageBuilders: Record<
  EnterprisePageKey,
  (context: TemplatePageBuilderContext) => BuilderPageDocument
> = {
  homepage: buildHomepage,
  "services-products": buildServicesProducts,
  "technology-rd": buildTechnology,
  news: buildNews,
  "about-us": buildAbout,
  contact: buildContact,
};

const templateMap: Record<SiteTemplateId, TemplateConfig> = {
  saas: {
    siteName: "超好用建站股份有限公司",
    siteTagline: "极简、可信、可持续演进的科技企业官网",
    logoSrc: "/brand/xingyun-logo.svg",
    keyword: "科技产品",
    contactEmail: "hello@xingyun.example.com",
    phone: "400-820-1024",
    address: "上海市浦东新区星海路 16 号",
    registrationNumber: "沪ICP备2026011024号",
    heroImages: {
      homepage: "/hero/homepage-minimal.svg",
      "services-products": "/hero/services-grid.svg",
      "technology-rd": "/hero/technology-platform.svg",
      news: "/hero/news-media-wall.svg",
      "about-us": "/hero/about-studio.svg",
      contact: "/hero/contact-network.svg",
    },
    homepageHero: {
      eyebrow: "科技 SaaS 官网模板",
      title: "为现代科技企业打造清晰、克制、可信的官网体验",
      description: "适合软件平台、AI 工具与云服务团队，突出产品能力、品牌认知与业务转化。",
      primaryCtaLabel: "查看服务与产品",
      primaryCtaHref: pageUrl("services-products"),
      secondaryCtaLabel: "联系我们",
      secondaryCtaHref: pageUrl("contact"),
    },
    homepageStats: {
      title: "站点关键信息",
      items: [
        { value: "独立页面", label: "标准企业站结构" },
        { value: "模块化", label: "支持拖拽编辑" },
        { value: "MVP", label: "快速上线" },
      ],
    },
    homepageFeatures: {
      title: "适合科技企业官网的表达方式",
      description: "聚焦品牌可信度、产品说明与业务转化效率，避免花哨但难用的页面结构。",
      items: [
        { icon: "layers", title: "结构清楚", description: "从首页到联系页保持统一信息层次。" },
        { icon: "spark", title: "转化明确", description: "咨询入口和关键按钮更聚焦，减少页面噪音。" },
        { icon: "chip", title: "持续迭代", description: "后续新增页面、模板和模块都能继续沉淀。" },
      ],
    },
  },
  "corporate-services": {
    siteName: "冷子雨科技有限公司",
    siteTagline: "更适合咨询与企业服务行业的稳健型官网",
    logoSrc: "/brand/shanhe-logo.svg",
    keyword: "企业服务",
    contactEmail: "hello@shanhe.example.com",
    phone: "400-800-2600",
    address: "北京市朝阳区望京企业大道 26 号",
    registrationNumber: "京ICP备2026026000号",
    heroImages: {
      homepage: "/hero/homepage-minimal.svg",
      "services-products": "/hero/services-grid.svg",
      "technology-rd": "/hero/technology-platform.svg",
      news: "/hero/news-media-wall.svg",
      "about-us": "/hero/about-studio.svg",
      contact: "/hero/contact-network.svg",
    },
    homepageHero: {
      eyebrow: "企业服务官网模板",
      title: "面向咨询与服务型企业的稳健表达方式",
      description: "兼顾品牌表达、服务说明与商务转化，适合咨询、方案型服务与 B2B 企业。",
      primaryCtaLabel: "查看服务与产品",
      primaryCtaHref: pageUrl("services-products"),
      secondaryCtaLabel: "关于我们",
      secondaryCtaHref: pageUrl("about-us"),
    },
    homepageStats: {
      title: "服务型站点特征",
      items: [
        { value: "多页", label: "完整业务表达" },
        { value: "清晰", label: "更适合商务沟通" },
        { value: "长期", label: "便于持续运营" },
      ],
    },
    homepageFeatures: {
      title: "稳健、克制、可落地的企业服务表达",
      description: "通过极简样式与清晰信息结构，提升内容可读性和商务可信感。",
      items: [
        { icon: "globe", title: "服务覆盖清楚", description: "把服务范围、交付方式与合作对象讲清楚。" },
        { icon: "layers", title: "方案结构统一", description: "将分散服务能力整合为易于理解的方案矩阵。" },
        { icon: "spark", title: "品牌质感稳重", description: "在克制风格里保留企业应有的专业感。" },
      ],
    },
  },
  manufacturing: {
    siteName: "铸星制造",
    siteTagline: "更适合工业制造与工程企业的能力展示站",
    logoSrc: "/brand/zhuzao-logo.svg",
    keyword: "工业制造",
    contactEmail: "business@zhuxing.example.com",
    phone: "400-880-1830",
    address: "苏州市工业园区智造大道 80 号",
    registrationNumber: "苏ICP备2026018300号",
    heroImages: {
      homepage: "/hero/homepage-minimal.svg",
      "services-products": "/hero/services-grid.svg",
      "technology-rd": "/hero/technology-platform.svg",
      news: "/hero/news-media-wall.svg",
      "about-us": "/hero/about-studio.svg",
      contact: "/hero/contact-network.svg",
    },
    homepageHero: {
      eyebrow: "工业制造官网模板",
      title: "用更清晰的结构展示制造能力、交付实力与企业资质",
      description: "适合设备制造、工程服务与工业企业，突出实力、案例与长期合作信任。",
      primaryCtaLabel: "查看服务与产品",
      primaryCtaHref: pageUrl("services-products"),
      secondaryCtaLabel: "联系我们",
      secondaryCtaHref: pageUrl("contact"),
    },
    homepageStats: {
      title: "制造型企业信息",
      items: [
        { value: "20+", label: "行业项目经验" },
        { value: "稳定", label: "交付能力" },
        { value: "长期", label: "合作客户" },
      ],
    },
    homepageFeatures: {
      title: "制造企业官网更应该讲清的内容",
      description: "重点说明交付实力、服务范围、质量标准和客户信任基础。",
      items: [
        { icon: "shield", title: "质量可靠", description: "突出标准化流程、质量控制能力与稳定交付经验。" },
        { icon: "layers", title: "业务清晰", description: "将制造能力、产品范围和项目类型分层展示。" },
        { icon: "globe", title: "合作信任", description: "通过案例、资质和联系信息建立合作前信任。" },
      ],
    },
  },
  "research-lab": {
    siteName: "源研科技",
    siteTagline: "适合技术团队与研发平台的理性型企业官网",
    logoSrc: "/brand/yuanyan-logo.svg",
    keyword: "研发创新",
    contactEmail: "lab@yuanyan.example.com",
    phone: "400-860-2407",
    address: "深圳市南山区创新科技路 24 号",
    registrationNumber: "粤ICP备2026024070号",
    heroImages: {
      homepage: "/hero/homepage-minimal.svg",
      "services-products": "/hero/services-grid.svg",
      "technology-rd": "/hero/technology-platform.svg",
      news: "/hero/news-media-wall.svg",
      "about-us": "/hero/about-studio.svg",
      contact: "/hero/contact-network.svg",
    },
    homepageHero: {
      eyebrow: "研发实验室官网模板",
      title: "把研发实力转化为客户可感知的品牌信任",
      description: "突出平台架构、研发体系与工程方法，适合科研平台、技术团队和创新型企业。",
      primaryCtaLabel: "查看技术研发",
      primaryCtaHref: pageUrl("technology-rd"),
      secondaryCtaLabel: "联系我们",
      secondaryCtaHref: pageUrl("contact"),
    },
    homepageStats: {
      title: "研发型站点数据",
      items: [
        { value: "99.9%", label: "稳定性目标" },
        { value: "24/7", label: "响应机制" },
        { value: "长期", label: "技术沉淀" },
      ],
    },
    homepageFeatures: {
      title: "技术型官网应重点表达的内容",
      description: "既要有专业深度，也要让非技术决策者快速理解企业的研发价值。",
      items: [
        { icon: "chip", title: "平台架构", description: "清晰呈现系统架构、平台能力与可扩展空间。" },
        { icon: "pulse", title: "研发流程", description: "展示需求评审、开发协同、测试机制和上线节奏。" },
        { icon: "shield", title: "安全稳定", description: "强调合规、安全、性能与可用性的建设标准。" },
      ],
    },
  },
};

export function buildSiteTemplateDocuments(
  templateId: SiteTemplateId,
  selectedPages: EnterprisePageKey[] = defaultSelectedEnterprisePages,
  footerTemplate = getDefaultFooterTemplate(templateId),
): BuilderPageDocument[] {
  const config = templateMap[templateId];
  const site = createSiteConfig({
    name: config.siteName,
    tagline: config.siteTagline,
    logoSrc: config.logoSrc,
    faviconSrc: config.logoSrc,
    navigationLinks: buildNavigationLinks(selectedPages),
    footer: {
      template: footerTemplate,
      registrationNumber: config.registrationNumber,
      companyAddress: config.address,
      phone: config.phone,
      email: config.contactEmail,
      copyrightText: `© 2026 ${config.siteName}. All rights reserved.`,
    },
  });

  const context: TemplatePageBuilderContext = {
    config,
    selectedPages,
    site,
  };

  const orderedKeys = enterprisePageCatalog
    .map((page) => page.key)
    .filter((pageKey) => selectedPages.includes(pageKey));

  return orderedKeys.map((pageKey) => pageBuilders[pageKey](context));
}
