import { redirect } from "next/navigation";
import { PageManager } from "@/components/builder/page-manager";
import { listPages } from "@/lib/builder/server/page-service";

export const dynamic = "force-dynamic";

export default async function EditorStartPage() {
  const pages = await listPages();
  const hasDatabasePages = pages.some((page) => page.source === "database");

  if (hasDatabasePages) {
    redirect("/editor");
  }

  return <PageManager initialPages={pages} />;
}
