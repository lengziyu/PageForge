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
import { replaceDemoNewsArticles } from "@/lib/news/server/news-service";
import { getPrismaClient } from "@/lib/prisma";

type PageRecord = {
  slug: string;
  title: string;
  status: string;
  content: string;
};

type PageListRecord = PageRecord & {
  updatedAt: Date;
};

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

function sortPageList<T extends { slug: string; title: string }>(pages: T[]) {
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

function mapPageRecord(record: PageRecord): BuilderPageResponse {
  return {
    slug: record.slug,
    title: record.title,
    status: normalizePageStatus(record.status),
    source: "database",
    document: pageDocumentSchema.parse(JSON.parse(record.content)),
  };
}

function mapPageListItem(record: PageListRecord): BuilderPageListItem {
  const document = pageDocumentSchema.parse(JSON.parse(record.content));

  return {
    slug: record.slug,
    title: record.title,
    status: normalizePageStatus(record.status),
    source: "database",
    updatedAt: record.updatedAt.toISOString(),
    sectionCount: document.sections.length,
  };
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

export async function listPages(): Promise<BuilderPageListItem[]> {
  try {
    const pages = await getPrismaClient().sitePage.findMany({
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      select: {
        slug: true,
        title: true,
        status: true,
        updatedAt: true,
        content: true,
      },
    });

    const items = sortPageList(pages.map(mapPageListItem));

    if (!items.some((page) => page.slug === defaultPageDocument.page.slug)) {
      return [createFallbackHomepageListItem(), ...items];
    }

    return items;
  } catch {
    return [createFallbackHomepageListItem()];
  }
}

export async function listPublishedPages(): Promise<BuilderPageListItem[]> {
  try {
    const pages = await getPrismaClient().sitePage.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      select: {
        slug: true,
        title: true,
        status: true,
        updatedAt: true,
        content: true,
      },
    });

    const items = sortPageList(pages.map(mapPageListItem));

    if (items.length === 0) {
      return [createFallbackHomepageListItem()];
    }

    if (!items.some((page) => page.slug === defaultPageDocument.page.slug)) {
      return [createFallbackHomepageListItem(), ...items];
    }

    return items;
  } catch {
    return [createFallbackHomepageListItem()];
  }
}

export async function getEditablePageBySlug(
  slug: string,
): Promise<BuilderPageResponse> {
  try {
    const page = await getPrismaClient().sitePage.findUnique({
      where: { slug },
      select: {
        slug: true,
        title: true,
        status: true,
        content: true,
      },
    });

    if (!page) {
      return createFallbackPage(slug);
    }

    return mapPageRecord(page);
  } catch {
    return createFallbackPage(slug);
  }
}

export async function getPublishedPageBySlug(
  slug: string,
): Promise<BuilderPageResponse | null> {
  try {
    const page = await getPrismaClient().sitePage.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
      },
      select: {
        slug: true,
        title: true,
        status: true,
        content: true,
      },
    });

    if (page) {
      return mapPageRecord(page);
    }

    if (slug === defaultPageDocument.page.slug) {
      return createFallbackPage(slug);
    }

    return null;
  } catch {
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
  const documents = buildSiteTemplateDocuments(
    templateId,
    selectedPages,
    options?.footerTemplate,
  );
  const slugs = documents.map((document) => document.page.slug);
  const replaceExisting = options?.replaceExisting ?? false;

  const existingPages = await getPrismaClient().sitePage.findMany({
    where: {
      slug: {
        in: slugs,
      },
    },
    select: {
      slug: true,
      title: true,
      status: true,
      content: true,
    },
  });

  if (replaceExisting) {
    await getPrismaClient().sitePage.deleteMany({});

    const recreatedPages = await getPrismaClient().$transaction(
      documents.map((document) =>
        getPrismaClient().sitePage.create({
          data: {
            slug: document.page.slug,
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
        }),
      ),
    );

    const pages = sortPageList(recreatedPages).map(mapPageRecord);
    await seedDemoNewsSafely({
      siteName: pages[0]?.document.site.name ?? "企业站点",
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

  const createdPages = await getPrismaClient().$transaction(
    documents.map((document) =>
      getPrismaClient().sitePage.create({
        data: {
          slug: document.page.slug,
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
      }),
    ),
  );

  const pages = sortPageList(createdPages).map(mapPageRecord);
  await seedDemoNewsSafely({
    siteName: pages[0]?.document.site.name ?? "企业站点",
    keyword: templateId,
  });

  return pages;
}

export async function deletePageBySlug(slug: string) {
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
  if (input?.currentPageSlug && input.currentDocument) {
    await savePageBySlug(input.currentPageSlug, input.currentDocument, "PUBLISHED");

    const pages = await getPrismaClient().sitePage.findMany({
      select: {
        slug: true,
        content: true,
      },
    });
    const pageDocuments = pages.map((page) => ({
      slug: page.slug,
      document: pageDocumentSchema.parse(JSON.parse(page.content)),
    }));
    const pageTitleMap = new Map(
      pageDocuments.map((page) => [page.slug, page.document.page.title]),
    );
    const currentSiteConfig = {
      ...input.currentDocument.site,
      navigationLinks: input.currentDocument.site.navigationLinks.map((link) => ({
        ...link,
        label: pageTitleMap.get(link.slug) ?? link.label,
        href: `/sites/${link.slug}`,
      })),
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
