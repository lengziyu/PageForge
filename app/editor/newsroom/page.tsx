import { NewsManager } from "@/components/news/news-manager";
import { listNewsArticles, listNewsCategories } from "@/lib/news/server/news-service";

export const dynamic = "force-dynamic";

export default async function EditorNewsroomPage() {
  const [articles, categories] = await Promise.all([
    listNewsArticles(),
    listNewsCategories(),
  ]);

  return <NewsManager initialArticles={articles} initialCategories={categories} />;
}
