import { z } from "zod";
import { ServiceGridBlock } from "@/components/blocks/service-grid-block";
import type { BuilderBlockDefinition } from "@/lib/builder/types";

export const serviceGridItemSchema = z.object({
  tag: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const serviceGridPropsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  items: z.array(serviceGridItemSchema).min(3),
});

export const serviceGridSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("service-grid"),
  props: serviceGridPropsSchema,
});

export type ServiceGridProps = z.infer<typeof serviceGridPropsSchema>;
export type ServiceGridSection = z.infer<typeof serviceGridSectionSchema>;

export const serviceGridDefaultProps: ServiceGridProps = {
  title: "服务与产品",
  description:
    "围绕企业增长、品牌表达与数字化交付，构建清晰的服务矩阵与产品能力。",
  items: [
    {
      tag: "01",
      title: "官网策划",
      description: "梳理品牌定位、内容层级与页面转化路径，让信息结构更清楚。",
    },
    {
      tag: "02",
      title: "产品展示",
      description: "把复杂能力拆成易理解的产品模块与解决方案，降低沟通门槛。",
    },
    {
      tag: "03",
      title: "持续运营",
      description: "覆盖上线、优化、迭代与内容持续更新，让官网能长期服务业务。",
    },
  ],
};

export const serviceGridBlockDefinition: BuilderBlockDefinition<
  "service-grid",
  typeof serviceGridPropsSchema
> = {
  type: "service-grid",
  label: "服务产品",
  description: "服务矩阵与产品能力展示模块。",
  component: ServiceGridBlock,
  defaultProps: serviceGridDefaultProps,
  schema: serviceGridPropsSchema,
};
