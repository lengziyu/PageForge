export type SiteProductStatus = "DRAFT" | "PUBLISHED";

export type SiteProductCategory = {
  id: string;
  name: string;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

export type SiteProductSpec = {
  label: string;
  value: string;
};

export type SiteProductSummary = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  coverImage: string;
  status: SiteProductStatus;
  publishedAt: string | null;
  updatedAt: string;
};

export type SiteProduct = SiteProductSummary & {
  gallery: string[];
  highlights: string[];
  specs: SiteProductSpec[];
  contentHtml: string;
};
