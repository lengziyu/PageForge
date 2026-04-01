import { NewsListBlock } from "@/components/blocks/news-list-block";
import { ServiceGridBlock } from "@/components/blocks/service-grid-block";
import { renderBuilderSection } from "@/components/builder/render-builder-section";
import type { NewsListItem } from "@/lib/builder/blocks/news-list";
import type { BuilderPageDocument } from "@/lib/builder/schema";
import type { SiteProductSummary } from "@/lib/products/contracts";

type PageRendererProps = {
  document: BuilderPageDocument;
  newsArticles?: NewsListItem[];
  products?: SiteProductSummary[];
};

export function PageRenderer({ document, newsArticles, products }: PageRendererProps) {
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

        if (section.type === "service-grid") {
          return (
            <ServiceGridBlock
              isEditor={false}
              isSelected={false}
              key={section.id}
              products={products}
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
