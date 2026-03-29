import { redirect } from "next/navigation";

type LegacyNewsEditorPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LegacyNewsEditorPage({
  params,
}: LegacyNewsEditorPageProps) {
  const { slug } = await params;
  redirect(`/editor/newsroom/${slug}`);
}
