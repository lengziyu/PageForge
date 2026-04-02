import { redirect } from "next/navigation";
import { PageEditor } from "@/components/builder/page-editor";
import { getEditablePageBySlug, listPages } from "@/lib/builder/server/page-service";

type EditorPagesDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EditorPagesDetailPage({
  params,
}: EditorPagesDetailPageProps) {
  const { slug } = await params;
  const pages = await listPages();
  const hasDatabasePages = pages.some((pageItem) => pageItem.source === "database");

  if (!hasDatabasePages) {
    redirect("/editor/start");
  }

  const page = await getEditablePageBySlug(slug);

  return <PageEditor initialPage={page} sitePages={pages} />;
}
