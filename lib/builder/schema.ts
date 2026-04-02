import { z } from "zod";
import { ctaSectionSchema } from "@/lib/builder/blocks/cta";
import { companyIntroSectionSchema } from "@/lib/builder/blocks/company-intro";
import { contactMethodsSectionSchema } from "@/lib/builder/blocks/contact-methods";
import { faqSectionSchema } from "@/lib/builder/blocks/faq";
import { featureListSectionSchema } from "@/lib/builder/blocks/feature-list";
import { heroSectionSchema } from "@/lib/builder/blocks/hero";
import { newsListSectionSchema } from "@/lib/builder/blocks/news-list";
import { partnersSectionSchema } from "@/lib/builder/blocks/partners";
import { serviceGridSectionSchema } from "@/lib/builder/blocks/service-grid";
import { statsStripSectionSchema } from "@/lib/builder/blocks/stats-strip";
import { teamMembersSectionSchema } from "@/lib/builder/blocks/team-members";
import { techHighlightsSectionSchema } from "@/lib/builder/blocks/tech-highlights";
import { testimonialsSectionSchema } from "@/lib/builder/blocks/testimonials";
import {
  createSiteConfig,
  footerTemplateCatalog,
  navigationTemplateCatalog,
} from "@/lib/builder/site-config";

export const siteNavigationLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  slug: z.string().min(1),
});

export const siteFooterSchema = z.object({
  template: z.enum(
    footerTemplateCatalog.map((template) => template.id) as [
      (typeof footerTemplateCatalog)[number]["id"],
      ...(typeof footerTemplateCatalog)[number]["id"][],
    ],
  ),
  registrationNumber: z.string().default(""),
  companyAddress: z.string().default(""),
  phone: z.string().default(""),
  email: z.string().default(""),
  copyrightText: z.string().default(""),
});

export const pageSectionSchema = z.discriminatedUnion("type", [
  heroSectionSchema,
  statsStripSectionSchema,
  featureListSectionSchema,
  serviceGridSectionSchema,
  techHighlightsSectionSchema,
  newsListSectionSchema,
  companyIntroSectionSchema,
  contactMethodsSectionSchema,
  ctaSectionSchema,
  testimonialsSectionSchema,
  faqSectionSchema,
  partnersSectionSchema,
  teamMembersSectionSchema,
]);

export const pageDocumentSchema = z.object({
  version: z.literal(1),
  site: z.object({
    name: z.string().min(1),
    tagline: z.string().default(""),
    logoSrc: z.string().default(""),
    faviconSrc: z.string().default(""),
    navigationTemplate: z
      .enum(
        navigationTemplateCatalog.map((template) => template.id) as [
          (typeof navigationTemplateCatalog)[number]["id"],
          ...(typeof navigationTemplateCatalog)[number]["id"][],
        ],
      )
      .default("filled"),
    navigationLinks: z.array(siteNavigationLinkSchema).default([]),
    footer: siteFooterSchema.default(createSiteConfig({ name: "PageForge" }).footer),
  }),
  page: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
  }),
  sections: z.array(pageSectionSchema).min(1),
});

export type BuilderPageDocument = z.infer<typeof pageDocumentSchema>;
export type BuilderPageSection = z.infer<typeof pageSectionSchema>;
export type BuilderSiteConfig = z.infer<typeof pageDocumentSchema.shape.site>;
export type BuilderSiteFooter = z.infer<typeof siteFooterSchema>;
