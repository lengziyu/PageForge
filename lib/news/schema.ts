import { z } from "zod";

export const newsCategoryInputSchema = z.object({
  name: z.string().trim().min(1),
});

export const newsArticleInputSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  category: z.string().min(1),
  summary: z.string().min(1),
  coverImage: z.string().min(1),
  contentHtml: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export const createNewsArticleSchema = newsArticleInputSchema.omit({
  slug: true,
  coverImage: true,
  contentHtml: true,
  summary: true,
}).extend({
  summary: z.string().default("请补充新闻摘要。"),
  coverImage: z.string().default("/hero/news-media-wall.svg"),
  contentHtml: z.string().default("<p>请开始编辑新闻正文。</p>"),
});
