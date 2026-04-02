import { redirect } from "next/navigation";
import { EditorWelcome } from "@/components/builder/editor-welcome";
import { listPages } from "@/lib/builder/server/page-service";

export const dynamic = "force-dynamic";

export default async function EditorWelcomePage() {
  const pages = await listPages();
  const hasDatabasePages = pages.some((page) => page.source === "database");

  if (hasDatabasePages) {
    redirect("/editor");
  }

  return <EditorWelcome />;
}
