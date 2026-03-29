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
  const [page, pages] = await Promise.all([getEditablePageBySlug(slug), listPages()]);

  return <PageEditor initialPage={page} sitePages={pages} />;
}
