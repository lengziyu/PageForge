import { NewsListBlock } from "@/components/blocks/news-list-block";
import { renderBuilderSection } from "@/components/builder/render-builder-section";
import type { NewsListItem } from "@/lib/builder/blocks/news-list";
import type { BuilderPageDocument } from "@/lib/builder/schema";

type PageRendererProps = {
  document: BuilderPageDocument;
  newsArticles?: NewsListItem[];
};

export function PageRenderer({ document, newsArticles }: PageRendererProps) {
  return (
    <>
      {document.sections.map((section) => {
        if (section.type === "news-list") {
          return (
            <NewsListBlock
              articles={newsArticles}
              isEditor={false}
              isSelected={false}
              key={section.id}
              props={section.props}
            />
          );
        }

        return renderBuilderSection(section, {
          key: section.id,
          isEditor: false,
          isSelected: false,
        });
      })}
    </>
  );
}
