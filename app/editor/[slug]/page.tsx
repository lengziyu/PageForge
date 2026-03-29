import { redirect } from "next/navigation";

type LegacyEditorPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LegacyEditorPage({ params }: LegacyEditorPageProps) {
  const { slug } = await params;
  redirect(`/editor/pages/${slug}`);
}
