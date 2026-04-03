import { defaultPageDocument } from "@/lib/builder/default-page";
import {
  createPageDocument,
  normalizePageSlug,
} from "@/lib/builder/page-factory";
import type {
  BuilderPageListItem,
  BuilderPageResponse,
  BuilderPageStatus,
} from "@/lib/builder/page-contracts";
import { pageDocumentSchema, type BuilderPageDocument } from "@/lib/builder/schema";
import type {
  EnterprisePageKey,
  SiteTemplateId,
} from "@/lib/builder/template-catalog";
import { enterprisePageCatalog } from "@/lib/builder/template-catalog";
import { buildSiteTemplateDocuments } from "@/lib/builder/template-library";
import type { FooterTemplateId } from "@/lib/builder/site-config";
import { resolveSiteName } from "@/lib/brand/identity";
import { replaceDemoNewsArticles } from "@/lib/news/server/news-service";
import { replaceDemoProducts } from "@/lib/products/server/product-service";
import { ensureAppDatabaseSchema, getPrismaClient } from "@/lib/prisma";

type PageRecord = {
  slug: string;
  title: string;
  status: string;
  content: string;
};

type PageListRecord = PageRecord & {
  updatedAt: Date;
};

const pageRecordSelect = {
  slug: true,
  title: true,
  status: true,
  content: true,
} as const;

const pageListSelect = {
  ...pageRecordSelect,
  updatedAt: true,
} as const;

export class PageServiceError extends Error {
  code: "INVALID_SLUG" | "SLUG_EXISTS" | "DELETE_FORBIDDEN" | "PAGE_NOT_FOUND";

  constructor(
    code: "INVALID_SLUG" | "SLUG_EXISTS" | "DELETE_FORBIDDEN" | "PAGE_NOT_FOUND",
    message: string,
  ) {
    super(message);
    this.code = code;
  }
}

function getPageOrderIndex(slug: string) {
  const standardIndex = enterprisePageCatalog.findIndex((page) => page.slug === slug);
  return standardIndex >= 0 ? standardIndex : enterprisePageCatalog.length + 10;
}

function sortPageList<T extends { slug: string; title: string }>(pages: readonly T[]): T[] {
  return [...pages].sort((left, right) => {
    const indexDiff = getPageOrderIndex(left.slug) - getPageOrderIndex(right.slug);

    if (indexDiff !== 0) {
      return indexDiff;
    }

    return left.title.localeCompare(right.title, "zh-CN");
  });
}

function normalizePageStatus(status: string): BuilderPageStatus {
  return status === "DRAFT" ? "DRAFT" : "PUBLISHED";
}

function parsePageDocument(content: string): BuilderPageDocument {
  return pageDocumentSchema.parse(JSON.parse(content));
}

function mapPageRecord(record: PageRecord): BuilderPageResponse {
  return {
    slug: record.slug,
    title: record.title,
    status: normalizePageStatus(record.status),
    source: "database",
    document: parsePageDocument(record.content),
  };
}

function mapPageListItem(record: PageListRecord): BuilderPageListItem {
  const document = parsePageDocument(record.content);

  return {
    slug: record.slug,
    title: record.title,
    status: normalizePageStatus(record.status),
    source: "database",
    updatedAt: record.updatedAt.toISOString(),
    sectionCount: document.sections.length,
  };
}

function mapValidPageListItems(records: PageListRecord[]): BuilderPageListItem[] {
  return records.flatMap((record) => {
    try {
      return [mapPageListItem(record)];
    } catch (error) {
      console.error(`Skipping invalid page record in list: ${record.slug}`, error);
      return [];
    }
  });
}

function createFallbackPage(slug: string): BuilderPageResponse {
  const document = createPageDocument({
    slug,
    title: slug === "homepage" ? defaultPageDocument.page.title : `${slug} Page`,
  });
  const status: BuilderPageStatus =
    slug === defaultPageDocument.page.slug ? "PUBLISHED" : "DRAFT";

  return {
    slug,
    title: document.page.title,
    status,
    source: "default",
    document,
  };
}

function createFallbackHomepageListItem(): BuilderPageListItem {
  return {
    slug: defaultPageDocument.page.slug,
    title: defaultPageDocument.page.title,
    status: "PUBLISHED",
    source: "default",
    updatedAt: null,
    sectionCount: defaultPageDocument.sections.length,
  };
}

async function seedDemoNewsSafely(input: { siteName: string; keyword: string }) {
  try {
    await replaceDemoNewsArticles(input);
  } catch (error) {
    console.warn("Skipping demo newsroom seed:", error);
  }
}

async function seedDemoProductsSafely(input: { siteName: string; keyword: string }) {
  try {
    await replaceDemoProducts(input);
  } catch (error) {
    console.warn("Skipping demo products seed:", error);
  }
}

export async function listPages(): Promise<BuilderPageListItem[]> {
  try {
    await ensureAppDatabaseSchema();

    const pages = await getPrismaClient().sitePage.findMany({
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      select: pageListSelect,
    });

    const items: BuilderPageListItem[] = sortPageList(mapValidPageListItems(pages));

    if (!items.some((page) => page.slug === defaultPageDocument.page.slug)) {
      return [createFallbackHomepageListItem(), ...items];
    }

    return items;
  } catch (error) {
    console.error("Failed to list pages:", error);
    return [createFallbackHomepageListItem()];
  }
}

export async function listPublishedPages(): Promise<BuilderPageListItem[]> {
  try {
    await ensureAppDatabaseSchema();

    const pages = await getPrismaClient().sitePage.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      select: pageListSelect,
    });

    const items: BuilderPageListItem[] = sortPageList(mapValidPageListItems(pages));

    if (items.length === 0) {
      return [createFallbackHomepageListItem()];
    }

    if (!items.some((page) => page.slug === defaultPageDocument.page.slug)) {
      return [createFallbackHomepageListItem(), ...items];
    }

    return items;
  } catch (error) {
    console.error("Failed to list published pages:", error);
    return [createFallbackHomepageListItem()];
  }
}

export async function getEditablePageBySlug(
  slug: string,
): Promise<BuilderPageResponse> {
  try {
    await ensureAppDatabaseSchema();

    const page = await getPrismaClient().sitePage.findUnique({
      where: { slug },
      select: pageRecordSelect,
    });

    if (!page) {
      return createFallbackPage(slug);
    }

    return mapPageRecord(page);
  } catch (error) {
    console.error(`Failed to load editable page: ${slug}`, error);
    return createFallbackPage(slug);
  }
}

export async function getPublishedPageBySlug(
  slug: string,
): Promise<BuilderPageResponse | null> {
  try {
    await ensureAppDatabaseSchema();

    const page = await getPrismaClient().sitePage.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
      },
      select: pageRecordSelect,
    });

    if (page) {
      return mapPageRecord(page);
    }

    if (slug === defaultPageDocument.page.slug) {
      return createFallbackPage(slug);
    }

    return null;
  } catch (error) {
    console.error(`Failed to load published page: ${slug}`, error);
    if (slug === defaultPageDocument.page.slug) {
      return createFallbackPage(slug);
    }

    return null;
  }
}

export async function createPage(input: {
  title: string;
  slug?: string;
}): Promise<BuilderPageResponse> {
  await ensureAppDatabaseSchema();

  const normalizedSlug = normalizePageSlug(input.slug?.trim() || input.title);

  if (!normalizedSlug) {
    throw new PageServiceError("INVALID_SLUG", "请输入有效的页面标题或 slug。");
  }

  const existingPage = await getPrismaClient().sitePage.findUnique({
    where: { slug: normalizedSlug },
    select: { slug: true },
  });

  if (existingPage) {
    throw new PageServiceError("SLUG_EXISTS", `页面 slug “${normalizedSlug}” 已存在。`);
  }

  const document = createPageDocument({
    slug: normalizedSlug,
    title: input.title.trim(),
  });

  const createdPage = await getPrismaClient().sitePage.create({
    data: {
      slug: normalizedSlug,
      title: document.page.title,
      status: "DRAFT",
      content: JSON.stringify(document),
    },
    select: {
      slug: true,
      title: true,
      status: true,
      content: true,
    },
  });

  return mapPageRecord(createdPage);
}

export async function createPagesFromTemplate(
  templateId: SiteTemplateId,
  selectedPages: EnterprisePageKey[],
  options?: {
    replaceExisting?: boolean;
    footerTemplate?: FooterTemplateId;
  },
): Promise<BuilderPageResponse[]> {
  await ensureAppDatabaseSchema();

  const documents = buildSiteTemplateDocuments(
    templateId,
    selectedPages,
    options?.footerTemplate,
  );
  const slugs = documents.map((document) => document.page.slug);
  const replaceExisting = options?.replaceExisting ?? false;

  const existingPages: PageRecord[] = await getPrismaClient().sitePage.findMany({
    where: {
      slug: {
        in: slugs,
      },
    },
    select: pageRecordSelect,
  });

  if (replaceExisting) {
    const transactionResults = await getPrismaClient().$transaction([
      getPrismaClient().sitePage.deleteMany({}),
      ...documents.map((document) =>
        getPrismaClient().sitePage.create({
          data: {
            slug: document.page.slug,
            title: document.page.title,
            status: "DRAFT",
            content: JSON.stringify(document),
          },
          select: pageRecordSelect,
        }),
      ),
    ]);
    const recreatedPages = transactionResults.slice(1) as PageRecord[];

    const pages: BuilderPageResponse[] = sortPageList(recreatedPages).map(mapPageRecord);
    const siteName = resolveSiteName(pages[0]?.document.site.name);
    await seedDemoNewsSafely({
      siteName,
      keyword: templateId,
    });
    await seedDemoProductsSafely({
      siteName,
      keyword: templateId,
    });

    return pages;
  }

  if (existingPages.length === slugs.length) {
    return sortPageList(existingPages).map(mapPageRecord);
  }

  if (existingPages.length > 0) {
    throw new PageServiceError(
      "SLUG_EXISTS",
      `模板页面已部分存在：${existingPages.map((page) => page.slug).join("、")}。请先清理后再重新初始化模板。`,
    );
  }

  const createdPages: PageRecord[] = await getPrismaClient().$transaction(
    documents.map((document) =>
      getPrismaClient().sitePage.create({
        data: {
          slug: document.page.slug,
          title: document.page.title,
          status: "DRAFT",
          content: JSON.stringify(document),
        },
        select: pageRecordSelect,
      }),
    ),
  );

  const pages: BuilderPageResponse[] = sortPageList(createdPages).map(mapPageRecord);
  const siteName = resolveSiteName(pages[0]?.document.site.name);
  await seedDemoNewsSafely({
    siteName,
    keyword: templateId,
  });
  await seedDemoProductsSafely({
    siteName,
    keyword: templateId,
  });

  return pages;
}

export async function deletePageBySlug(slug: string) {
  await ensureAppDatabaseSchema();

  if (slug === defaultPageDocument.page.slug) {
    throw new PageServiceError("DELETE_FORBIDDEN", "首页暂不支持删除。");
  }

  const existingPage = await getPrismaClient().sitePage.findUnique({
    where: { slug },
    select: {
      slug: true,
      title: true,
    },
  });

  if (!existingPage) {
    throw new PageServiceError("PAGE_NOT_FOUND", "页面不存在或已经删除。");
  }

  await getPrismaClient().sitePage.delete({
    where: { slug },
  });

  return existingPage;
}

export async function savePageBySlug(
  slug: string,
  document: BuilderPageDocument,
  status: BuilderPageStatus,
): Promise<BuilderPageResponse> {
  await ensureAppDatabaseSchema();

  const parsedDocument = pageDocumentSchema.parse({
    ...document,
    page: {
      ...document.page,
      slug,
    },
  });

  const savedPage = await getPrismaClient().sitePage.upsert({
    where: { slug },
    update: {
      title: parsedDocument.page.title,
      status,
      content: JSON.stringify(parsedDocument),
    },
    create: {
      slug,
      title: parsedDocument.page.title,
      status,
      content: JSON.stringify(parsedDocument),
    },
    select: {
      slug: true,
      title: true,
      status: true,
      content: true,
    },
  });

  return mapPageRecord(savedPage);
}

export async function publishSite(input?: {
  currentPageSlug?: string;
  currentDocument?: BuilderPageDocument;
}) {
  await ensureAppDatabaseSchema();

  if (input?.currentPageSlug && input.currentDocument) {
    await savePageBySlug(input.currentPageSlug, input.currentDocument, "PUBLISHED");

    const pages: Array<Pick<PageRecord, "slug" | "content">> =
      await getPrismaClient().sitePage.findMany({
      select: {
        slug: true,
        content: true,
      },
    });
    const pageDocuments = pages.map((page) => ({
      slug: page.slug,
      document: parsePageDocument(page.content),
    }));
    const pageTitleMap = new Map(
      pageDocuments.map((page) => [page.slug, page.document.page.title]),
    );
    const normalizeNavigationLinks = (
      links: BuilderPageDocument["site"]["navigationLinks"],
    ) =>
      links.map((link) => ({
        ...link,
        label: pageTitleMap.get(link.slug) ?? link.label,
        href: `/sites/${link.slug}`,
        children: (link.children ?? []).map((child) => ({
          ...child,
          label: pageTitleMap.get(child.slug) ?? child.label,
          href: `/sites/${child.slug}`,
        })),
      }));
    const currentSiteConfig = {
      ...input.currentDocument.site,
      navigationLinks: normalizeNavigationLinks(input.currentDocument.site.navigationLinks),
    };

    await getPrismaClient().$transaction(
      pageDocuments.map((page) => {
        return getPrismaClient().sitePage.update({
          where: { slug: page.slug },
          data: {
            content: JSON.stringify({
              ...page.document,
              site: currentSiteConfig,
            }),
          },
        });
      }),
    );
  }

  await getPrismaClient().sitePage.updateMany({
    data: {
      status: "PUBLISHED",
    },
  });

  return listPublishedPages();
}
