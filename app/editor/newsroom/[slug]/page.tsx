import { notFound } from "next/navigation";
import { NewsEditor } from "@/components/news/news-editor";
import {
  getNewsArticleBySlug,
  listNewsCategories,
} from "@/lib/news/server/news-service";

type EditorNewsroomDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    embed?: string;
  }>;
};

export default async function EditorNewsroomDetailPage({
  params,
  searchParams,
}: EditorNewsroomDetailPageProps) {
  const { slug } = await params;
  const { embed } = await searchParams;
  const [article, categories] = await Promise.all([
    getNewsArticleBySlug(slug),
    listNewsCategories(),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <NewsEditor
      categories={categories}
      embedded={embed === "1"}
      initialArticle={article}
    />
  );
}
