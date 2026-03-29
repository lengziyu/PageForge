import { ctaBlockDefinition, type CtaBlockProps } from "@/lib/builder/blocks/cta";
import {
  companyIntroBlockDefinition,
  type CompanyIntroProps,
} from "@/lib/builder/blocks/company-intro";
import {
  contactMethodsBlockDefinition,
  type ContactMethodsProps,
} from "@/lib/builder/blocks/contact-methods";
import {
  featureListBlockDefinition,
  type FeatureListBlockProps,
} from "@/lib/builder/blocks/feature-list";
import {
  heroBlockDefinition,
  type HeroBlockProps,
} from "@/lib/builder/blocks/hero";
import {
  newsListBlockDefinition,
  type NewsListProps,
} from "@/lib/builder/blocks/news-list";
import {
  serviceGridBlockDefinition,
  type ServiceGridProps,
} from "@/lib/builder/blocks/service-grid";
import {
  statsStripBlockDefinition,
  type StatsStripProps,
} from "@/lib/builder/blocks/stats-strip";
import {
  techHighlightsBlockDefinition,
  type TechHighlightsProps,
} from "@/lib/builder/blocks/tech-highlights";

export const blockDefinitions = [
  heroBlockDefinition,
  statsStripBlockDefinition,
  featureListBlockDefinition,
  serviceGridBlockDefinition,
  techHighlightsBlockDefinition,
  newsListBlockDefinition,
  companyIntroBlockDefinition,
  contactMethodsBlockDefinition,
  ctaBlockDefinition,
] as const;

export type BuilderBlockType = (typeof blockDefinitions)[number]["type"];

type BlockDefinitionRecord = {
  [K in BuilderBlockType]: Extract<(typeof blockDefinitions)[number], { type: K }>;
};

export const blockRegistry = Object.fromEntries(
  blockDefinitions.map((block) => [block.type, block]),
) as BlockDefinitionRecord;

export type {
  CompanyIntroProps,
  ContactMethodsProps,
  CtaBlockProps,
  FeatureListBlockProps,
  HeroBlockProps,
  NewsListProps,
  ServiceGridProps,
  StatsStripProps,
  TechHighlightsProps,
};
