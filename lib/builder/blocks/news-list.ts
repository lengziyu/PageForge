import { z } from "zod";
import { NewsListBlock } from "@/components/blocks/news-list-block";
import type { BuilderBlockDefinition } from "@/lib/builder/types";

export const newsItemSchema = z.object({
  category: z.string().min(1),
  title: z.string().min(1),
  date: z.string().min(1),
  summary: z.string().min(1),
  slug: z.string().min(1),
  coverImage: z.string().min(1),
});

export const newsListPropsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  sourceMode: z.enum(["newsroom", "manual"]).default("newsroom"),
  showCount: z.number().int().min(1).max(12).default(3),
  items: z.array(newsItemSchema).min(1),
});

export const newsListSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("news-list"),
  props: newsListPropsSchema,
});

export type NewsListItem = z.infer<typeof newsItemSchema>;
export type NewsListProps = z.infer<typeof newsListPropsSchema>;
export type NewsListSection = z.infer<typeof newsListSectionSchema>;

export const newsListDefaultProps: NewsListProps = {
  title: "新闻资讯",
  description: "沉淀企业动态、行业观点和品牌内容资产，适合资讯页与品牌内容页。",
  sourceMode: "newsroom",
  showCount: 3,
  items: [
    {
      category: "品牌动态",
      title: "发布年度产品路线图与平台升级计划",
      date: "2026-03-29",
      summary: "从战略方向到交付节奏，系统说明未来一年的重点推进事项。",
      slug: "annual-roadmap-update",
      coverImage: "/hero/news-media-wall.svg",
    },
    {
      category: "行业观察",
      title: "企业官网如何兼顾品牌表达与业务转化",
      date: "2026-03-20",
      summary: "从信息结构、内容表达与线索入口三个维度讨论企业官网建设的重点。",
      slug: "brand-site-observation",
      coverImage: "/hero/about-studio.svg",
    },
    {
      category: "媒体报道",
      title: "技术可信度正在成为客户评估合作的重要标准",
      date: "2026-03-11",
      summary: "聚焦技术表达如何影响企业品牌感知与商业决策。",
      slug: "technology-trust-upgrade",
      coverImage: "/hero/technology-platform.svg",
    },
  ],
};

export const newsListBlockDefinition: BuilderBlockDefinition<
  "news-list",
  typeof newsListPropsSchema
> = {
  type: "news-list",
  label: "新闻资讯",
  description: "新闻与文章列表模块，可连接新闻后台。",
  component: NewsListBlock,
  defaultProps: newsListDefaultProps,
  schema: newsListPropsSchema,
};
