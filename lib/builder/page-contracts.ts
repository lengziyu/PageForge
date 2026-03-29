import type { BuilderPageDocument } from "@/lib/builder/schema";

export type BuilderPageStatus = "PUBLISHED" | "DRAFT";
export type BuilderPageSource = "database" | "default";

export type BuilderPageResponse = {
  slug: string;
  title: string;
  status: BuilderPageStatus;
  source: BuilderPageSource;
  document: BuilderPageDocument;
};

export type BuilderPageListItem = {
  slug: string;
  title: string;
  status: BuilderPageStatus;
  source: BuilderPageSource;
  updatedAt: string | null;
  sectionCount: number;
};

