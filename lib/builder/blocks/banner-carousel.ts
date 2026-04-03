import { z } from "zod";
import { BannerCarouselBlock } from "@/components/blocks/banner-carousel-block";
import { defaultHeroBannerSources } from "@/lib/builder/banner-media";
import type { BuilderBlockDefinition } from "@/lib/builder/types";

export const bannerCarouselPropsSchema = z.object({
  slides: z.array(z.string().min(1)).min(1).max(10),
  autoPlay: z.boolean().default(true),
  intervalMs: z.number().int().min(1500).max(12000).default(3500),
  showDots: z.boolean().default(true),
  showArrows: z.boolean().default(true),
});

export const bannerCarouselSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("banner-carousel"),
  props: bannerCarouselPropsSchema,
});

export type BannerCarouselProps = z.infer<typeof bannerCarouselPropsSchema>;
export type BannerCarouselSection = z.infer<typeof bannerCarouselSectionSchema>;

export const bannerCarouselDefaultProps: BannerCarouselProps = {
  slides: defaultHeroBannerSources.slice(0, 3),
  autoPlay: true,
  intervalMs: 3500,
  showDots: true,
  showArrows: true,
};

export const bannerCarouselBlockDefinition: BuilderBlockDefinition<
  "banner-carousel",
  typeof bannerCarouselPropsSchema
> = {
  type: "banner-carousel",
  label: "Banner 轮播",
  description: "支持多图轮播的首屏视觉模块。",
  component: BannerCarouselBlock,
  defaultProps: bannerCarouselDefaultProps,
  schema: bannerCarouselPropsSchema,
};
