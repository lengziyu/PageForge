import { normalizePageSlug } from "@/lib/builder/page-factory";
import type {
  SiteNewsArticle,
  SiteNewsCategory,
  SiteNewsStatus,
  SiteNewsSummary,
} from "@/lib/news/contracts";
import { ensureAppDatabaseSchema, getPrismaClient } from "@/lib/prisma";

const defaultNewsCategories = ["品牌动态", "行业观点", "媒体报道"];

function normalizeNewsStatus(status: string): SiteNewsStatus {
  return status === "DRAFT" ? "DRAFT" : "PUBLISHED";
}

export class NewsServiceError extends Error {
  code:
    | "INVALID_SLUG"
    | "SLUG_EXISTS"
    | "ARTICLE_NOT_FOUND"
    | "CATEGORY_EXISTS"
    | "CATEGORY_NOT_FOUND"
    | "CATEGORY_IN_USE";

  constructor(
    code:
      | "INVALID_SLUG"
      | "SLUG_EXISTS"
      | "ARTICLE_NOT_FOUND"
      | "CATEGORY_EXISTS"
      | "CATEGORY_NOT_FOUND"
      | "CATEGORY_IN_USE",
    message: string,
  ) {
    super(message);
    this.code = code;
  }
}

function mapSummary(record: {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  coverImage: string;
  status: string;
  publishedAt: Date | null;
  updatedAt: Date;
}): SiteNewsSummary {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    category: record.category,
    summary: record.summary,
    coverImage: record.coverImage,
    status: normalizeNewsStatus(record.status),
    publishedAt: record.publishedAt?.toISOString() ?? null,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapArticle(record: {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  coverImage: string;
  contentHtml: string;
  status: string;
  publishedAt: Date | null;
  updatedAt: Date;
}): SiteNewsArticle {
  return {
    ...mapSummary(record),
    contentHtml: record.contentHtml,
  };
}

function mapCategory(record: {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}, articleCount = 0): SiteNewsCategory {
  return {
    id: record.id,
    name: record.name,
    articleCount,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function ensureDefaultNewsCategories() {
  await ensureAppDatabaseSchema();

  await Promise.all(
    defaultNewsCategories.map((name) =>
      getPrismaClient().siteNewsCategory.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );
}

async function ensureCategoryExists(name: string) {
  await getPrismaClient().siteNewsCategory.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

export async function listNewsCategories(): Promise<SiteNewsCategory[]> {
  try {
    await ensureDefaultNewsCategories();

    const [records, counts]: [
      Array<{ id: string; name: string; createdAt: Date; updatedAt: Date }>,
      Array<{ category: string; _count: { _all: number } }>,
    ] = await Promise.all([
      getPrismaClient().siteNewsCategory.findMany({
        orderBy: [{ name: "asc" }],
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      getPrismaClient().siteNewsArticle.groupBy({
        by: ["category"],
        _count: {
          _all: true,
        },
      }),
    ]);

    const countMap = new Map(
      counts.map((item) => [
        item.category,
        item._count._all,
      ]),
    );

    return records.map((record) => mapCategory(record, countMap.get(record.name) ?? 0));
  } catch {
    return [];
  }
}

export async function createNewsCategory(name: string): Promise<SiteNewsCategory> {
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new NewsServiceError("CATEGORY_NOT_FOUND", "请输入分类名称。");
  }

  const existing = await getPrismaClient().siteNewsCategory.findUnique({
    where: { name: normalizedName },
    select: { id: true },
  });

  if (existing) {
    throw new NewsServiceError("CATEGORY_EXISTS", `分类“${normalizedName}”已存在。`);
  }

  const record = await getPrismaClient().siteNewsCategory.create({
    data: { name: normalizedName },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return mapCategory(record);
}

export async function updateNewsCategoryById(
  id: string,
  name: string,
): Promise<SiteNewsCategory> {
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new NewsServiceError("CATEGORY_NOT_FOUND", "请输入分类名称。");
  }

  const existing = await getPrismaClient().siteNewsCategory.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
    },
  });

  if (!existing) {
    throw new NewsServiceError("CATEGORY_NOT_FOUND", "分类不存在。");
  }

  const duplicate = await getPrismaClient().siteNewsCategory.findFirst({
    where: {
      name: normalizedName,
      id: {
        not: id,
      },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new NewsServiceError("CATEGORY_EXISTS", `分类“${normalizedName}”已存在。`);
  }

  const articleCount = await getPrismaClient().siteNewsArticle.count({
    where: {
      category: existing.name,
    },
  });

  const updateCategoryOperation = getPrismaClient().siteNewsCategory.update({
    where: { id },
    data: {
      name: normalizedName,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const record =
    existing.name !== normalizedName
      ? (
          await getPrismaClient().$transaction([
            getPrismaClient().siteNewsArticle.updateMany({
              where: {
                category: existing.name,
              },
              data: {
                category: normalizedName,
              },
            }),
            updateCategoryOperation,
          ])
        )[1]
      : await updateCategoryOperation;

  return mapCategory(record, articleCount);
}

export async function deleteNewsCategoryById(id: string) {
  const category = await getPrismaClient().siteNewsCategory.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
    },
  });

  if (!category) {
    throw new NewsServiceError("CATEGORY_NOT_FOUND", "分类不存在或已删除。");
  }

  const articleCount = await getPrismaClient().siteNewsArticle.count({
    where: {
      category: category.name,
    },
  });

  if (articleCount > 0) {
    throw new NewsServiceError(
      "CATEGORY_IN_USE",
      `分类“${category.name}”下仍有新闻，不能删除。`,
    );
  }

  await getPrismaClient().siteNewsCategory.delete({
    where: { id },
  });

  return category;
}

export async function listNewsArticles(options?: {
  status?: SiteNewsStatus | "ALL";
  page?: number;
  pageSize?: number;
}): Promise<SiteNewsSummary[]> {
  try {
    const page = Math.max(options?.page ?? 1, 1);
    const pageSize = Math.max(options?.pageSize ?? 100, 1);
    const status =
      options?.status && options.status !== "ALL" ? options.status : undefined;

    const records = await getPrismaClient().siteNewsArticle.findMany({
      where: status ? { status } : undefined,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        summary: true,
        coverImage: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
      },
    });

    return records.map(mapSummary);
  } catch {
    return [];
  }
}

export async function listPublishedNewsArticles(limit = 6): Promise<SiteNewsSummary[]> {
  try {
    const records = await getPrismaClient().siteNewsArticle.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        summary: true,
        coverImage: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
      },
    });

    return records.map(mapSummary);
  } catch {
    return [];
  }
}

export async function getNewsArticleBySlug(
  slug: string,
): Promise<SiteNewsArticle | null> {
  try {
    const record = await getPrismaClient().siteNewsArticle.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        summary: true,
        coverImage: true,
        contentHtml: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
      },
    });

    return record ? mapArticle(record) : null;
  } catch {
    return null;
  }
}

export async function getPublishedNewsArticleBySlug(
  slug: string,
): Promise<SiteNewsArticle | null> {
  try {
    const record = await getPrismaClient().siteNewsArticle.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        summary: true,
        coverImage: true,
        contentHtml: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
      },
    });

    return record ? mapArticle(record) : null;
  } catch {
    return null;
  }
}

export async function createNewsArticle(input: {
  title: string;
  category: string;
  summary: string;
  coverImage: string;
  contentHtml: string;
  status: SiteNewsStatus;
}): Promise<SiteNewsArticle> {
  const slug = normalizePageSlug(input.title);

  if (!slug) {
    throw new NewsServiceError("INVALID_SLUG", "请输入有效的新闻标题。");
  }

  const existing = await getPrismaClient().siteNewsArticle.findUnique({
    where: { slug },
    select: { slug: true },
  });

  if (existing) {
    throw new NewsServiceError("SLUG_EXISTS", `新闻 slug “${slug}”已存在。`);
  }

  await ensureCategoryExists(input.category);

  const record = await getPrismaClient().siteNewsArticle.create({
    data: {
      slug,
      title: input.title,
      category: input.category,
      summary: input.summary,
      coverImage: input.coverImage,
      contentHtml: input.contentHtml,
      status: input.status,
      publishedAt: input.status === "PUBLISHED" ? new Date() : null,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      summary: true,
      coverImage: true,
      contentHtml: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  return mapArticle(record);
}

export async function saveNewsArticleBySlug(
  slug: string,
  input: {
    title: string;
    category: string;
    summary: string;
    coverImage: string;
    contentHtml: string;
    status: SiteNewsStatus;
  },
): Promise<SiteNewsArticle> {
  const existing = await getPrismaClient().siteNewsArticle.findUnique({
    where: { slug },
    select: { slug: true },
  });

  if (!existing) {
    throw new NewsServiceError("ARTICLE_NOT_FOUND", "新闻不存在。");
  }

  await ensureCategoryExists(input.category);

  const normalizedSlug = normalizePageSlug(slug);

  const record = await getPrismaClient().siteNewsArticle.update({
    where: { slug: normalizedSlug },
    data: {
      title: input.title,
      category: input.category,
      summary: input.summary,
      coverImage: input.coverImage,
      contentHtml: input.contentHtml,
      status: input.status,
      publishedAt: input.status === "PUBLISHED" ? new Date() : null,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      summary: true,
      coverImage: true,
      contentHtml: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  return mapArticle(record);
}

export async function deleteNewsArticleBySlug(slug: string) {
  const existing = await getPrismaClient().siteNewsArticle.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
    },
  });

  if (!existing) {
    throw new NewsServiceError("ARTICLE_NOT_FOUND", "新闻不存在或已删除。");
  }

  await getPrismaClient().siteNewsArticle.delete({
    where: { slug },
  });

  return existing;
}

export async function replaceDemoNewsArticles(input: {
  siteName: string;
  keyword: string;
}) {
  const demoArticles = [
    {
      slug: "annual-roadmap-update",
      title: `${input.siteName} 发布年度产品路线图与升级计划`,
      category: "品牌动态",
      summary: `围绕 ${input.keyword} 方向，系统介绍未来一年的重点升级节奏与能力布局。`,
      coverImage: "/hero/news-media-wall.svg",
      contentHtml:
        `<h2>年度升级重点</h2><p>${input.siteName} 围绕 ${input.keyword} 方向，重新梳理了年度升级节奏、客户服务流程和产品交付策略。</p><p>这篇文章可作为默认新闻详情页示例，后续你可以直接在新闻中心继续编辑。</p>`,
    },
    {
      slug: "brand-site-observation",
      title: "企业官网如何兼顾品牌表达与业务转化",
      category: "行业观点",
      summary: "从信息结构、视觉层级与内容入口三个维度讨论企业官网建设的真实重点。",
      coverImage: "/hero/about-studio.svg",
      contentHtml:
        "<h2>信息结构先行</h2><p>官网不只是做视觉，还要考虑用户理解路径、转化节点和长期维护成本。</p><p>这个默认详情页主要用于帮助你快速拥有一套完整的资讯体系。</p>",
    },
    {
      slug: "technology-trust-upgrade",
      title: "技术可信度正在成为合作评估的重要标准",
      category: "媒体报道",
      summary: "当客户更关注交付质量与长期合作时，技术表达会直接影响品牌信任。",
      coverImage: "/hero/technology-platform.svg",
      contentHtml:
        "<h2>为什么技术表达重要</h2><p>对于 B2B 企业来说，技术能力不只是研发团队内部语言，也应该成为品牌与业务沟通的一部分。</p>",
    },
  ];

  await ensureDefaultNewsCategories();
  await getPrismaClient().siteNewsArticle.deleteMany({});

  await getPrismaClient().$transaction(
    demoArticles.map((article) =>
      getPrismaClient().siteNewsArticle.create({
        data: {
          ...article,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      }),
    ),
  );
}
