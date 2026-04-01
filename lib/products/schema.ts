import { z } from "zod";

export const productCategoryInputSchema = z.object({
  name: z.string().trim().min(1),
});

export const productSpecSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
});

export const productInputSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  category: z.string().min(1),
  summary: z.string().min(1),
  coverImage: z.string().min(1),
  gallery: z.array(z.string().min(1)).default([]),
  highlights: z.array(z.string().min(1)).default([]),
  specs: z.array(productSpecSchema).default([]),
  contentHtml: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export const createProductSchema = productInputSchema.omit({
  slug: true,
  coverImage: true,
  gallery: true,
  highlights: true,
  specs: true,
  contentHtml: true,
  summary: true,
}).extend({
  summary: z.string().default("请补充产品摘要。"),
  coverImage: z.string().default("/hero/technology-platform.svg"),
  gallery: z.array(z.string().min(1)).default(["/hero/technology-platform.svg"]),
  highlights: z.array(z.string().min(1)).default(["请补充产品亮点"]),
  specs: z.array(productSpecSchema).default([
    {
      label: "适用场景",
      value: "请补充适用场景",
    },
    {
      label: "交付方式",
      value: "请补充交付方式",
    },
  ]),
  contentHtml: z.string().default("<p>请开始编辑产品详情。</p>"),
});
