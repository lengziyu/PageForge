import { z } from "zod";
import { PartnersBlock } from "@/components/blocks/partners-block";
import type { BuilderBlockDefinition } from "@/lib/builder/types";

export const partnerItemSchema = z.object({
  name: z.string().min(1),
  logoText: z.string().min(1),
});

export const partnersPropsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  items: z.array(partnerItemSchema).min(1),
});

export const partnersSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("partners"),
  props: partnersPropsSchema,
});

export type PartnerItem = z.infer<typeof partnerItemSchema>;
export type PartnersProps = z.infer<typeof partnersPropsSchema>;
export type PartnersSection = z.infer<typeof partnersSectionSchema>;

export const partnersDefaultProps: PartnersProps = {
  title: "合作伙伴",
  description: "与各行业领先企业建立深度合作，共同推动业务增长。",
  items: [
    { name: "启明科技", logoText: "启明科技" },
    { name: "远信集团", logoText: "远信集团" },
    { name: "云图数据", logoText: "云图数据" },
    { name: "恒拓网络", logoText: "恒拓网络" },
    { name: "锐途资本", logoText: "锐途资本" },
    { name: "博信智联", logoText: "博信智联" },
  ],
};

export const partnersBlockDefinition: BuilderBlockDefinition<
  "partners",
  typeof partnersPropsSchema
> = {
  type: "partners",
  label: "合作伙伴",
  description: "品牌Logo墙，展示合作客户与战略伙伴。",
  component: PartnersBlock,
  defaultProps: partnersDefaultProps,
  schema: partnersPropsSchema,
};
