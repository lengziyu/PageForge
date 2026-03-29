import { z } from "zod";
import { FeatureListBlock } from "@/components/blocks/feature-list-block";
import type { BuilderBlockDefinition } from "@/lib/builder/types";

export const featureIconSchema = z.enum([
  "layers",
  "shield",
  "pulse",
  "spark",
  "globe",
  "chip",
]);

export const featureItemSchema = z.object({
  icon: featureIconSchema.default("layers"),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const featureListPropsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  items: z.array(featureItemSchema).min(1),
});

export const featureListSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("feature-list"),
  props: featureListPropsSchema,
});

export type FeatureIcon = z.infer<typeof featureIconSchema>;
export type FeatureListBlockProps = z.infer<typeof featureListPropsSchema>;
export type FeatureListSection = z.infer<typeof featureListSectionSchema>;

export const featureListDefaultProps: FeatureListBlockProps = {
  title: "核心能力",
  description:
    "围绕品牌展示、技术表达与业务增长设计的三列能力卡片，适合企业首页和解决方案页面。",
  items: [
    {
      icon: "layers",
      title: "模块化搭建",
      description: "以稳定的 block 结构复用页面能力，提升交付效率与后续扩展空间。",
    },
    {
      icon: "shield",
      title: "企业级表达",
      description: "用统一设计语言承载服务、产品、研发与品牌信息，保证页面气质一致。",
    },
    {
      icon: "chip",
      title: "技术可扩展",
      description: "基于 JSON schema、Prisma 与 Next.js 持续演进，便于后续新增模块和流程。",
    },
  ],
};

export const featureListBlockDefinition: BuilderBlockDefinition<
  "feature-list",
  typeof featureListPropsSchema
> = {
  type: "feature-list",
  label: "能力卡片",
  description: "三列轻阴影能力卡片模块。",
  component: FeatureListBlock,
  defaultProps: featureListDefaultProps,
  schema: featureListPropsSchema,
};
