import { z } from "zod";
import { ContactMethodsBlock } from "@/components/blocks/contact-methods-block";
import type { BuilderBlockDefinition } from "@/lib/builder/types";

export const contactMethodItemSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  detail: z.string().min(1),
});

export const contactMethodsPropsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  items: z.array(contactMethodItemSchema).min(3),
});

export const contactMethodsSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("contact-methods"),
  props: contactMethodsPropsSchema,
});

export type ContactMethodsProps = z.infer<typeof contactMethodsPropsSchema>;
export type ContactMethodsSection = z.infer<typeof contactMethodsSectionSchema>;

export const contactMethodsDefaultProps: ContactMethodsProps = {
  title: "联系我们",
  description: "为潜在客户提供清晰、低摩擦的沟通入口，让咨询和合作意向更快落地。",
  items: [
    {
      label: "商务邮箱",
      value: "hello@example.com",
      detail: "工作日 24 小时内回复，适合项目咨询与合作洽谈。",
    },
    {
      label: "联系电话",
      value: "400-800-1234",
      detail: "适合紧急需求确认、方案沟通与售前支持。",
    },
    {
      label: "公司地址",
      value: "上海市徐汇区示例大道 88 号",
      detail: "支持线下会面、方案评审与长期合作对接。",
    },
  ],
};

export const contactMethodsBlockDefinition: BuilderBlockDefinition<
  "contact-methods",
  typeof contactMethodsPropsSchema
> = {
  type: "contact-methods",
  label: "联系入口",
  description: "适合联系我们页面的联系信息模块。",
  component: ContactMethodsBlock,
  defaultProps: contactMethodsDefaultProps,
  schema: contactMethodsPropsSchema,
};
