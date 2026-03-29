import type {
  BuilderPageDocument,
  BuilderPageSection,
  BuilderSiteConfig,
} from "@/lib/builder/schema";
import { pageDocumentSchema } from "@/lib/builder/schema";
import { defaultPageDocument } from "@/lib/builder/default-page";

type CreatePageDocumentInput = {
  slug: string;
  title: string;
  sections?: BuilderPageSection[];
  site?: BuilderSiteConfig;
};

export function normalizePageSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function createPageDocument({
  slug,
  title,
  sections,
  site,
}: CreatePageDocumentInput): BuilderPageDocument {
  return pageDocumentSchema.parse({
    ...defaultPageDocument,
    site: site ?? defaultPageDocument.site,
    page: {
      ...defaultPageDocument.page,
      slug,
      title,
    },
    sections:
      sections ??
      defaultPageDocument.sections.map((section, index) => ({
        ...section,
        id: `${section.type}-${slug}-${index + 1}`,
      })),
  });
}
