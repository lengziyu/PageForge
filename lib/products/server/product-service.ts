import { normalizePageSlug } from "@/lib/builder/page-factory";
import type {
  SiteProduct,
  SiteProductCategory,
  SiteProductSpec,
  SiteProductStatus,
  SiteProductSummary,
} from "@/lib/products/contracts";
import { ensureAppDatabaseSchema, getPrismaClient } from "@/lib/prisma";

const defaultProductCategories = ["核心产品", "行业方案", "服务支持"];

type ProductRecord = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  coverImage: string;
  galleryJson: string;
  highlightsJson: string;
  specsJson: string;
  contentHtml: string;
  status: string;
  publishedAt: Date | null;
  updatedAt: Date;
};

function normalizeProductStatus(status: string): SiteProductStatus {
  return status === "DRAFT" ? "DRAFT" : "PUBLISHED";
}

function safeParseJsonArray<T>(value: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function mapSummary(record: ProductRecord): SiteProductSummary {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    category: record.category,
    summary: record.summary,
    coverImage: record.coverImage,
    status: normalizeProductStatus(record.status),
    publishedAt: record.publishedAt?.toISOString() ?? null,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapProduct(record: ProductRecord): SiteProduct {
  return {
    ...mapSummary(record),
    gallery: safeParseJsonArray<string>(record.galleryJson, []),
    highlights: safeParseJsonArray<string>(record.highlightsJson, []),
    specs: safeParseJsonArray<SiteProductSpec>(record.specsJson, []),
    contentHtml: record.contentHtml,
  };
}

function mapCategory(
  record: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  },
  productCount = 0,
): SiteProductCategory {
  return {
    id: record.id,
    name: record.name,
    productCount,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export class ProductServiceError extends Error {
  code:
    | "INVALID_SLUG"
    | "SLUG_EXISTS"
    | "PRODUCT_NOT_FOUND"
    | "CATEGORY_EXISTS"
    | "CATEGORY_NOT_FOUND"
    | "CATEGORY_IN_USE";

  constructor(
    code:
      | "INVALID_SLUG"
      | "SLUG_EXISTS"
      | "PRODUCT_NOT_FOUND"
      | "CATEGORY_EXISTS"
      | "CATEGORY_NOT_FOUND"
      | "CATEGORY_IN_USE",
    message: string,
  ) {
    super(message);
    this.code = code;
  }
}

async function ensureDefaultProductCategories() {
  await ensureAppDatabaseSchema();

  await Promise.all(
    defaultProductCategories.map((name) =>
      getPrismaClient().siteProductCategory.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );
}

async function ensureCategoryExists(name: string) {
  await getPrismaClient().siteProductCategory.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

export async function listProductCategories(): Promise<SiteProductCategory[]> {
  try {
    await ensureDefaultProductCategories();

    const [records, counts] = await Promise.all([
      getPrismaClient().siteProductCategory.findMany({
        orderBy: [{ name: "asc" }],
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      getPrismaClient().siteProduct.groupBy({
        by: ["category"],
        _count: {
          _all: true,
        },
      }),
    ]);

    const countMap = new Map(counts.map((item) => [item.category, item._count._all]));

    return records.map((record) => mapCategory(record, countMap.get(record.name) ?? 0));
  } catch {
    return [];
  }
}

export async function createProductCategory(name: string): Promise<SiteProductCategory> {
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new ProductServiceError("CATEGORY_NOT_FOUND", "请输入分类名称。");
  }

  const existing = await getPrismaClient().siteProductCategory.findUnique({
    where: { name: normalizedName },
    select: { id: true },
  });

  if (existing) {
    throw new ProductServiceError("CATEGORY_EXISTS", `分类“${normalizedName}”已存在。`);
  }

  const record = await getPrismaClient().siteProductCategory.create({
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

export async function updateProductCategoryById(
  id: string,
  name: string,
): Promise<SiteProductCategory> {
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new ProductServiceError("CATEGORY_NOT_FOUND", "请输入分类名称。");
  }

  const existing = await getPrismaClient().siteProductCategory.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
    },
  });

  if (!existing) {
    throw new ProductServiceError("CATEGORY_NOT_FOUND", "分类不存在。");
  }

  const duplicate = await getPrismaClient().siteProductCategory.findFirst({
    where: {
      name: normalizedName,
      id: {
        not: id,
      },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new ProductServiceError("CATEGORY_EXISTS", `分类“${normalizedName}”已存在。`);
  }

  const productCount = await getPrismaClient().siteProduct.count({
    where: {
      category: existing.name,
    },
  });

  const updateCategoryOperation = getPrismaClient().siteProductCategory.update({
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
            getPrismaClient().siteProduct.updateMany({
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

  return mapCategory(record, productCount);
}

export async function deleteProductCategoryById(id: string) {
  const category = await getPrismaClient().siteProductCategory.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
    },
  });

  if (!category) {
    throw new ProductServiceError("CATEGORY_NOT_FOUND", "分类不存在或已删除。");
  }

  const productCount = await getPrismaClient().siteProduct.count({
    where: {
      category: category.name,
    },
  });

  if (productCount > 0) {
    throw new ProductServiceError(
      "CATEGORY_IN_USE",
      `分类“${category.name}”下仍有产品，不能删除。`,
    );
  }

  await getPrismaClient().siteProductCategory.delete({
    where: { id },
  });

  return category;
}

export async function listProducts(options?: {
  status?: SiteProductStatus | "ALL";
  page?: number;
  pageSize?: number;
}): Promise<SiteProductSummary[]> {
  try {
    await ensureAppDatabaseSchema();

    const page = Math.max(options?.page ?? 1, 1);
    const pageSize = Math.max(options?.pageSize ?? 100, 1);
    const status =
      options?.status && options.status !== "ALL" ? options.status : undefined;

    const records = await getPrismaClient().siteProduct.findMany({
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
        galleryJson: true,
        highlightsJson: true,
        specsJson: true,
        contentHtml: true,
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

export async function listPublishedProducts(limit = 6): Promise<SiteProductSummary[]> {
  try {
    await ensureAppDatabaseSchema();

    const records = await getPrismaClient().siteProduct.findMany({
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
        galleryJson: true,
        highlightsJson: true,
        specsJson: true,
        contentHtml: true,
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

export async function getProductBySlug(slug: string): Promise<SiteProduct | null> {
  try {
    await ensureAppDatabaseSchema();

    const record = await getPrismaClient().siteProduct.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        summary: true,
        coverImage: true,
        galleryJson: true,
        highlightsJson: true,
        specsJson: true,
        contentHtml: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
      },
    });

    return record ? mapProduct(record) : null;
  } catch {
    return null;
  }
}

export async function getPublishedProductBySlug(
  slug: string,
): Promise<SiteProduct | null> {
  try {
    await ensureAppDatabaseSchema();

    const record = await getPrismaClient().siteProduct.findFirst({
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
        galleryJson: true,
        highlightsJson: true,
        specsJson: true,
        contentHtml: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
      },
    });

    return record ? mapProduct(record) : null;
  } catch {
    return null;
  }
}

export async function createProduct(input: {
  title: string;
  category: string;
  summary: string;
  coverImage: string;
  gallery: string[];
  highlights: string[];
  specs: SiteProductSpec[];
  contentHtml: string;
  status: SiteProductStatus;
}): Promise<SiteProduct> {
  await ensureAppDatabaseSchema();

  const slug = normalizePageSlug(input.title);

  if (!slug) {
    throw new ProductServiceError("INVALID_SLUG", "请输入有效的产品标题。");
  }

  const existing = await getPrismaClient().siteProduct.findUnique({
    where: { slug },
    select: { slug: true },
  });

  if (existing) {
    throw new ProductServiceError("SLUG_EXISTS", `产品 slug “${slug}”已存在。`);
  }

  await ensureCategoryExists(input.category);

  const record = await getPrismaClient().siteProduct.create({
    data: {
      slug,
      title: input.title,
      category: input.category,
      summary: input.summary,
      coverImage: input.coverImage,
      galleryJson: JSON.stringify(input.gallery),
      highlightsJson: JSON.stringify(input.highlights),
      specsJson: JSON.stringify(input.specs),
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
      galleryJson: true,
      highlightsJson: true,
      specsJson: true,
      contentHtml: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  return mapProduct(record);
}

export async function saveProductBySlug(
  slug: string,
  input: {
    title: string;
    category: string;
    summary: string;
    coverImage: string;
    gallery: string[];
    highlights: string[];
    specs: SiteProductSpec[];
    contentHtml: string;
    status: SiteProductStatus;
  },
): Promise<SiteProduct> {
  await ensureAppDatabaseSchema();

  const existing = await getPrismaClient().siteProduct.findUnique({
    where: { slug },
    select: { slug: true },
  });

  if (!existing) {
    throw new ProductServiceError("PRODUCT_NOT_FOUND", "产品不存在。");
  }

  await ensureCategoryExists(input.category);

  const normalizedSlug = normalizePageSlug(slug);

  const record = await getPrismaClient().siteProduct.update({
    where: { slug: normalizedSlug },
    data: {
      title: input.title,
      category: input.category,
      summary: input.summary,
      coverImage: input.coverImage,
      galleryJson: JSON.stringify(input.gallery),
      highlightsJson: JSON.stringify(input.highlights),
      specsJson: JSON.stringify(input.specs),
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
      galleryJson: true,
      highlightsJson: true,
      specsJson: true,
      contentHtml: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  return mapProduct(record);
}

export async function deleteProductBySlug(slug: string) {
  await ensureAppDatabaseSchema();

  const existing = await getPrismaClient().siteProduct.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
    },
  });

  if (!existing) {
    throw new ProductServiceError("PRODUCT_NOT_FOUND", "产品不存在或已删除。");
  }

  await getPrismaClient().siteProduct.delete({
    where: { slug },
  });

  return existing;
}

export async function replaceDemoProducts(input: {
  siteName: string;
  keyword: string;
}) {
  await ensureDefaultProductCategories();
  await getPrismaClient().siteProduct.deleteMany({});

  const demoProducts = [
    {
      slug: "enterprise-brand-site-suite",
      title: `${input.siteName} 企业官网解决方案`,
      category: "行业方案",
      summary: `围绕 ${input.keyword} 场景快速搭建多页面官网，兼顾品牌表达与线索转化。`,
      coverImage: "/hero/about-studio.svg",
      galleryJson: JSON.stringify([
        "/hero/about-studio.svg",
        "/hero/technology-platform.svg",
      ]),
      highlightsJson: JSON.stringify([
        "行业模板初始化",
        "模块化拖拽编辑",
        "新闻与产品内容统一管理",
      ]),
      specsJson: JSON.stringify([
        { label: "部署方式", value: "单机部署 / Docker Compose" },
        { label: "适用团队", value: "中小企业市场与品牌团队" },
        { label: "交付周期", value: "1 到 3 天完成初始化" },
      ]),
      contentHtml:
        `<h2>方案概览</h2><p>${input.siteName} 企业官网解决方案面向 ${input.keyword} 场景，帮助团队在较短周期内完成官网搭建、内容填充和上线发布。</p><h2>适用团队</h2><p>适合希望降低官网建设门槛，同时保留长期可维护性的品牌、市场和运营团队。</p>`,
    },
    {
      slug: "content-operations-kit",
      title: "内容运营组件包",
      category: "核心产品",
      summary: "内置新闻中心、产品详情和模块化页面组合能力，让内容长期可运营。",
      coverImage: "/hero/news-media-wall.svg",
      galleryJson: JSON.stringify([
        "/hero/news-media-wall.svg",
        "/hero/about-studio.svg",
      ]),
      highlightsJson: JSON.stringify([
        "新闻资讯详情页",
        "产品详情页",
        "分类与草稿发布流程",
      ]),
      specsJson: JSON.stringify([
        { label: "内容类型", value: "新闻、产品、站点页面" },
        { label: "存储方式", value: "SQLite + 本地文件上传" },
        { label: "运营方式", value: "后台可视化维护" },
      ]),
      contentHtml:
        "<h2>让内容持续运转</h2><p>内容运营组件包面向需要持续发布产品更新、行业观点和案例素材的团队，帮助官网从一次性交付变成长期运营阵地。</p>",
    },
    {
      slug: "private-deployment-package",
      title: "私有化部署包",
      category: "服务支持",
      summary: "保留完整功能的同时，让客户以更简单的方式完成安装、备份与迁移。",
      coverImage: "/hero/technology-platform.svg",
      galleryJson: JSON.stringify([
        "/hero/technology-platform.svg",
        "/hero/news-media-wall.svg",
      ]),
      highlightsJson: JSON.stringify([
        "SQLite 数据持久化",
        "本地上传目录挂载",
        "Docker Compose 一键启动",
      ]),
      specsJson: JSON.stringify([
        { label: "运行依赖", value: "Node.js 或 Docker" },
        { label: "数据目录", value: "./data 与 ./public/uploads" },
        { label: "适配客户", value: "偏简单运维的私有化场景" },
      ]),
      contentHtml:
        "<h2>简单交付</h2><p>私有化部署包强调可复制、可迁移和低门槛运维，适合对部署流程要求简单直接的客户环境。</p>",
    },
  ];

  await getPrismaClient().$transaction(
    demoProducts.map((product) =>
      getPrismaClient().siteProduct.create({
        data: {
          ...product,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      }),
    ),
  );
}
