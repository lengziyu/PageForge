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
};

export default async function EditorNewsroomDetailPage({
  params,
}: EditorNewsroomDetailPageProps) {
  const { slug } = await params;
  const [article, categories] = await Promise.all([
    getNewsArticleBySlug(slug),
    listNewsCategories(),
  ]);

  if (!article) {
    notFound();
  }

  return <NewsEditor categories={categories} initialArticle={article} />;
}
