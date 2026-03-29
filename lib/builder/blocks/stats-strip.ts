import { z } from "zod";
import { StatsStripBlock } from "@/components/blocks/stats-strip-block";
import type { BuilderBlockDefinition } from "@/lib/builder/types";

export const statsItemSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

export const statsStripPropsSchema = z.object({
  title: z.string().min(1),
  items: z.array(statsItemSchema).min(3),
});

export const statsStripSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("stats-strip"),
  props: statsStripPropsSchema,
});

export type StatsStripProps = z.infer<typeof statsStripPropsSchema>;
export type StatsStripSection = z.infer<typeof statsStripSectionSchema>;

export const statsStripDefaultProps: StatsStripProps = {
  title: "关键数据",
  items: [
    {
      value: "6+",
      label: "标准页面",
    },
    {
      value: "12+",
      label: "模块组合",
    },
    {
      value: "7天",
      label: "内容搭建周期",
    },
  ],
};

export const statsStripBlockDefinition: BuilderBlockDefinition<
  "stats-strip",
  typeof statsStripPropsSchema
> = {
  type: "stats-strip",
  label: "数据概览",
  description: "适合首页和关于页的数据条带模块。",
  component: StatsStripBlock,
  defaultProps: statsStripDefaultProps,
  schema: statsStripPropsSchema,
};
