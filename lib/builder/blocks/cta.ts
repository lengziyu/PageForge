import { z } from "zod";
import { CtaBlock } from "@/components/blocks/cta-block";
import type { BuilderBlockDefinition } from "@/lib/builder/types";

export const ctaPropsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  buttonLabel: z.string().min(1),
  buttonHref: z.string().min(1),
});

export const ctaSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("cta"),
  props: ctaPropsSchema,
});

export type CtaBlockProps = z.infer<typeof ctaPropsSchema>;
export type CtaSection = z.infer<typeof ctaSectionSchema>;

export const ctaDefaultProps: CtaBlockProps = {
  title: "让官网真正服务品牌增长与客户沟通",
  description:
    "用统一的模板、页面结构与模块组件，快速完成企业官网从搭建到发布的最小闭环。",
  buttonLabel: "联系我们",
  buttonHref: "#contact",
};

export const ctaBlockDefinition: BuilderBlockDefinition<
  "cta",
  typeof ctaPropsSchema
> = {
  type: "cta",
  label: "行动引导",
  description: "页面底部的转化引导模块。",
  component: CtaBlock,
  defaultProps: ctaDefaultProps,
  schema: ctaPropsSchema,
};
