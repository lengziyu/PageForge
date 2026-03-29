import { z } from "zod";
import { CompanyIntroBlock } from "@/components/blocks/company-intro-block";
import type { BuilderBlockDefinition } from "@/lib/builder/types";

export const companyIntroItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const companyIntroPropsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  items: z.array(companyIntroItemSchema).min(2),
});

export const companyIntroSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("company-intro"),
  props: companyIntroPropsSchema,
});

export type CompanyIntroProps = z.infer<typeof companyIntroPropsSchema>;
export type CompanyIntroSection = z.infer<typeof companyIntroSectionSchema>;

export const companyIntroDefaultProps: CompanyIntroProps = {
  title: "关于我们",
  description:
    "我们专注于企业官网、品牌表达与数字化内容交付，让复杂信息更清晰，也让客户更容易建立信任。",
  items: [
    {
      title: "品牌定位清晰",
      description: "从行业价值、服务能力到企业气质，用统一叙事讲清楚品牌。",
    },
    {
      title: "交付节奏稳定",
      description: "以模块化搭建和可维护代码为基础，保证交付效率与后续扩展空间。",
    },
    {
      title: "长期持续迭代",
      description: "上线不是结束，后续内容扩展、页面新增和样式演进都更容易。",
    },
  ],
};

export const companyIntroBlockDefinition: BuilderBlockDefinition<
  "company-intro",
  typeof companyIntroPropsSchema
> = {
  type: "company-intro",
  label: "企业介绍",
  description: "适合关于我们页面的企业介绍模块。",
  component: CompanyIntroBlock,
  defaultProps: companyIntroDefaultProps,
  schema: companyIntroPropsSchema,
};
