import { PageManager } from "@/components/builder/page-manager";
import { listPages } from "@/lib/builder/server/page-service";

export const dynamic = "force-dynamic";

export default async function EditorIndexPage() {
  const pages = await listPages();

  return <PageManager initialPages={pages} />;
}
