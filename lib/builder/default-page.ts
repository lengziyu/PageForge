import { ctaDefaultProps } from "@/lib/builder/blocks/cta";
import { featureListDefaultProps } from "@/lib/builder/blocks/feature-list";
import { heroDefaultProps } from "@/lib/builder/blocks/hero";
import { statsStripDefaultProps } from "@/lib/builder/blocks/stats-strip";
import { createSiteConfig } from "@/lib/builder/site-config";
import { PAGEFORGE_DEFAULT_SITE_NAME } from "@/lib/brand/identity";
import { pageDocumentSchema, type BuilderPageDocument } from "@/lib/builder/schema";

export const defaultPageDocument: BuilderPageDocument = pageDocumentSchema.parse({
  version: 1,
  site: createSiteConfig({
    name: PAGEFORGE_DEFAULT_SITE_NAME,
    tagline: "模块化企业官网搭建器",
    navigationLinks: [
      {
        label: "首页",
        href: "/sites/homepage",
        slug: "homepage",
      },
    ],
    footer: {
      template: "classic",
      registrationNumber: "沪ICP备2026000001号",
      companyAddress: "上海市徐汇区示例大道 88 号",
      phone: "400-800-1234",
      email: "hello@pageforge.example.com",
      copyrightText: "© 2026 PageForge. All rights reserved.",
    },
  }),
  page: {
    title: "首页",
    slug: "homepage",
  },
  sections: [
    {
      id: "hero-homepage",
      type: "hero",
      props: heroDefaultProps,
    },
    {
      id: "stats-homepage",
      type: "stats-strip",
      props: statsStripDefaultProps,
    },
    {
      id: "features-homepage",
      type: "feature-list",
      props: featureListDefaultProps,
    },
    {
      id: "cta-homepage",
      type: "cta",
      props: ctaDefaultProps,
    },
  ],
});
