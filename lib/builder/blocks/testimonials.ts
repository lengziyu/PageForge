import { z } from "zod";
import { TestimonialsBlock } from "@/components/blocks/testimonials-block";
import type { BuilderBlockDefinition } from "@/lib/builder/types";

export const testimonialItemSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  company: z.string().min(1),
  content: z.string().min(1),
  avatar: z.string().default(""),
});

export const testimonialsPropsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  items: z.array(testimonialItemSchema).min(1),
});

export const testimonialsSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("testimonials"),
  props: testimonialsPropsSchema,
});

export type TestimonialItem = z.infer<typeof testimonialItemSchema>;
export type TestimonialsProps = z.infer<typeof testimonialsPropsSchema>;
export type TestimonialsSection = z.infer<typeof testimonialsSectionSchema>;

export const testimonialsDefaultProps: TestimonialsProps = {
  title: "客户怎么说",
  description: "真实客户反馈，记录每一段合作带来的价值与改变。",
  items: [
    {
      name: "张伟",
      title: "产品总监",
      company: "启明科技",
      content: "上线后官网整体气质提升了一个量级，客户访问后的反馈也更正面，转化率明显改善。",
      avatar: "",
    },
    {
      name: "李晓梅",
      title: "市场负责人",
      company: "远信集团",
      content: "模块化的搭建方式让我们可以快速更新内容，不再依赖开发资源，效率提升非常明显。",
      avatar: "",
    },
    {
      name: "陈浩",
      title: "CEO",
      company: "云图数据",
      content: "从规划到上线仅花了两周，页面结构清晰，品牌感强，完全达到我们预期的效果。",
      avatar: "",
    },
  ],
};

export const testimonialsBlockDefinition: BuilderBlockDefinition<
  "testimonials",
  typeof testimonialsPropsSchema
> = {
  type: "testimonials",
  label: "客户评价",
  description: "展示真实客户评价与推荐的引用卡片模块。",
  component: TestimonialsBlock,
  defaultProps: testimonialsDefaultProps,
  schema: testimonialsPropsSchema,
};
