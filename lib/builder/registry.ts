import {
  bannerCarouselBlockDefinition,
  type BannerCarouselProps,
} from "@/lib/builder/blocks/banner-carousel";
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
  faqBlockDefinition,
  type FaqProps,
} from "@/lib/builder/blocks/faq";
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
  locationMapBlockDefinition,
  type LocationMapProps,
} from "@/lib/builder/blocks/location-map";
import {
  partnersBlockDefinition,
  type PartnersProps,
} from "@/lib/builder/blocks/partners";
import {
  serviceGridBlockDefinition,
  type ServiceGridProps,
} from "@/lib/builder/blocks/service-grid";
import {
  statsStripBlockDefinition,
  type StatsStripProps,
} from "@/lib/builder/blocks/stats-strip";
import {
  teamMembersBlockDefinition,
  type TeamMembersProps,
} from "@/lib/builder/blocks/team-members";
import {
  techHighlightsBlockDefinition,
  type TechHighlightsProps,
} from "@/lib/builder/blocks/tech-highlights";
import {
  testimonialsBlockDefinition,
  type TestimonialsProps,
} from "@/lib/builder/blocks/testimonials";

export const blockDefinitions = [
  heroBlockDefinition,
  bannerCarouselBlockDefinition,
  statsStripBlockDefinition,
  featureListBlockDefinition,
  serviceGridBlockDefinition,
  techHighlightsBlockDefinition,
  newsListBlockDefinition,
  locationMapBlockDefinition,
  companyIntroBlockDefinition,
  contactMethodsBlockDefinition,
  ctaBlockDefinition,
  testimonialsBlockDefinition,
  faqBlockDefinition,
  partnersBlockDefinition,
  teamMembersBlockDefinition,
] as const;

export type BuilderBlockType = (typeof blockDefinitions)[number]["type"];

type BlockDefinitionRecord = {
  [K in BuilderBlockType]: Extract<(typeof blockDefinitions)[number], { type: K }>;
};

export const blockRegistry = Object.fromEntries(
  blockDefinitions.map((block) => [block.type, block]),
) as BlockDefinitionRecord;

export type {
  BannerCarouselProps,
  CompanyIntroProps,
  ContactMethodsProps,
  CtaBlockProps,
  FaqProps,
  FeatureListBlockProps,
  HeroBlockProps,
  NewsListProps,
  LocationMapProps,
  PartnersProps,
  ServiceGridProps,
  StatsStripProps,
  TeamMembersProps,
  TechHighlightsProps,
  TestimonialsProps,
};
