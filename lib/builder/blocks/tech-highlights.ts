import { z } from "zod";
import { TechHighlightsBlock } from "@/components/blocks/tech-highlights-block";
import type { BuilderBlockDefinition } from "@/lib/builder/types";

export const techHighlightItemSchema = z.object({
  metric: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const techHighlightsPropsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  items: z.array(techHighlightItemSchema).min(3),
});

export const techHighlightsSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("tech-highlights"),
  props: techHighlightsPropsSchema,
});

export type TechHighlightsProps = z.infer<typeof techHighlightsPropsSchema>;
export type TechHighlightsSection = z.infer<typeof techHighlightsSectionSchema>;

export const techHighlightsDefaultProps: TechHighlightsProps = {
  title: "技术研发",
  description:
    "用更可信的方式展示架构能力、研发体系与工程质量，让技术表达更专业。",
  items: [
    {
      metric: "100+",
      title: "研发迭代",
      description: "通过稳定节奏完成需求拆解、开发、测试与上线交付。",
    },
    {
      metric: "99.9%",
      title: "平台可用性",
      description: "面向企业客户保持高可用、高稳定与高安全的服务标准。",
    },
    {
      metric: "24/7",
      title: "监控保障",
      description: "构建完善的日志、监控与告警响应体系，降低线上不确定性。",
    },
  ],
};

export const techHighlightsBlockDefinition: BuilderBlockDefinition<
  "tech-highlights",
  typeof techHighlightsPropsSchema
> = {
  type: "tech-highlights",
  label: "技术研发",
  description: "架构能力与研发优势展示模块。",
  component: TechHighlightsBlock,
  defaultProps: techHighlightsDefaultProps,
  schema: techHighlightsPropsSchema,
};
