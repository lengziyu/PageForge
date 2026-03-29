import { NextResponse } from "next/server";
import { z } from "zod";
import {
  enterprisePageCatalog,
  isSiteTemplateId,
  siteTemplateCatalog,
  type EnterprisePageKey,
} from "@/lib/builder/template-catalog";
import { footerTemplateCatalog } from "@/lib/builder/site-config";
import {
  createPagesFromTemplate,
  PageServiceError,
} from "@/lib/builder/server/page-service";

const templateCreateSchema = z.object({
  templateId: z.string().min(1),
  selectedPages: z
    .array(
      z.enum(
        enterprisePageCatalog.map((page) => page.key) as [
          EnterprisePageKey,
          ...EnterprisePageKey[],
        ],
      ),
    )
    .min(1),
  footerTemplate: z
    .enum(
      footerTemplateCatalog.map((template) => template.id) as [
        (typeof footerTemplateCatalog)[number]["id"],
        ...(typeof footerTemplateCatalog)[number]["id"][],
      ],
    )
    .optional(),
  replaceExisting: z.boolean().optional(),
});

export async function GET() {
  return NextResponse.json(siteTemplateCatalog);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = templateCreateSchema.safeParse(payload);

  if (!parsed.success || !isSiteTemplateId(parsed.data.templateId)) {
    return NextResponse.json(
      {
        message: "模板参数不合法。",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const pages = await createPagesFromTemplate(
      parsed.data.templateId,
      parsed.data.selectedPages,
      {
        replaceExisting: parsed.data.replaceExisting,
        footerTemplate: parsed.data.footerTemplate,
      },
    );

    return NextResponse.json(
      {
        templateId: parsed.data.templateId,
        pages,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (error instanceof PageServiceError) {
      const status = error.code === "SLUG_EXISTS" ? 409 : 400;

      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status,
        },
      );
    }

    return NextResponse.json(
      {
        message: "模板页面创建失败。",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}
