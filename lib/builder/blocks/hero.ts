import { z } from "zod";
import { HeroBlock } from "@/components/blocks/hero-block";
import { heroImagePresets } from "@/lib/builder/hero-media";
import type { BuilderBlockDefinition } from "@/lib/builder/types";

export const heroPropsSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  primaryCtaLabel: z.string().min(1),
  primaryCtaHref: z.string().min(1),
  secondaryCtaLabel: z.string().min(1),
  secondaryCtaHref: z.string().min(1),
  backgroundImageSrc: z.string().min(1),
});

export const heroSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("hero"),
  props: heroPropsSchema,
});

export type HeroBlockProps = z.infer<typeof heroPropsSchema>;
export type HeroSection = z.infer<typeof heroSectionSchema>;

export const heroDefaultProps: HeroBlockProps = {
  eyebrow: "企业官网模板",
  title: "建立清晰、低摩擦的商务沟通入口",
  description: "先保证结构正确，再逐步把内容、品牌和业务表达做完整。",
  primaryCtaLabel: "预约演示",
  primaryCtaHref: "/sites/contact",
  secondaryCtaLabel: "了解方案",
  secondaryCtaHref: "/sites/services-products",
  backgroundImageSrc: heroImagePresets[0].src,
};

export const heroBlockDefinition: BuilderBlockDefinition<
  "hero",
  typeof heroPropsSchema
> = {
  type: "hero",
  label: "首屏横幅",
  description: "左侧文案右侧背景视觉的企业级首屏模块。",
  component: HeroBlock,
  defaultProps: heroDefaultProps,
  schema: heroPropsSchema,
};
