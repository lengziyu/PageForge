import { z } from "zod";
import { pageDocumentSchema } from "@/lib/builder/schema";

export const createPageInputSchema = z.object({
  title: z.string().trim().min(1).max(80),
  slug: z.string().trim().max(80).optional().default(""),
});

export const pageStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);

export const savePageInputSchema = z.object({
  document: pageDocumentSchema,
  status: pageStatusSchema,
});

export type CreatePageInput = z.infer<typeof createPageInputSchema>;
export type SavePageInput = z.infer<typeof savePageInputSchema>;
