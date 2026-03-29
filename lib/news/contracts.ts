export type SiteNewsStatus = "DRAFT" | "PUBLISHED";

export type SiteNewsCategory = {
  id: string;
  name: string;
  articleCount: number;
  createdAt: string;
  updatedAt: string;
};

export type SiteNewsSummary = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  coverImage: string;
  status: SiteNewsStatus;
  publishedAt: string | null;
  updatedAt: string;
};

export type SiteNewsArticle = SiteNewsSummary & {
  contentHtml: string;
};
