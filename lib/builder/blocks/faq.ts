import { z } from "zod";
import { FaqBlock } from "@/components/blocks/faq-block";
import type { BuilderBlockDefinition } from "@/lib/builder/types";

export const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const faqPropsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  items: z.array(faqItemSchema).min(1),
});

export const faqSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("faq"),
  props: faqPropsSchema,
});

export type FaqItem = z.infer<typeof faqItemSchema>;
export type FaqProps = z.infer<typeof faqPropsSchema>;
export type FaqSection = z.infer<typeof faqSectionSchema>;

export const faqDefaultProps: FaqProps = {
  title: "常见问题",
  description: "整理客户在了解与合作过程中最常关注的问题，帮助你快速建立判断。",
  items: [
    {
      question: "交付周期一般是多久？",
      answer: "标准官网项目通常在 2-4 周内完成，具体视页面数量与定制程度而定。我们在启动前会给出明确的排期计划。",
    },
    {
      question: "上线后如何维护和更新内容？",
      answer: "系统提供可视化的内容编辑后台，市场或运营同学无需开发背景即可独立完成文案、图片和新闻资讯的更新。",
    },
    {
      question: "是否支持多语言版本？",
      answer: "目前支持中文主站，国际化多语言版本在路线图中，如有需求可提前联系我们了解定制方案。",
    },
    {
      question: "是否有私有化部署选项？",
      answer: "支持私有化部署，可部署在客户自有服务器或云环境，满足数据安全与合规要求，详情请联系商务团队。",
    },
  ],
};

export const faqBlockDefinition: BuilderBlockDefinition<
  "faq",
  typeof faqPropsSchema
> = {
  type: "faq",
  label: "常见问题",
  description: "FAQ 展开收起式问答模块，适合解答客户疑虑。",
  component: FaqBlock,
  defaultProps: faqDefaultProps,
  schema: faqPropsSchema,
};
