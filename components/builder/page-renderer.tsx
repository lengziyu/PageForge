import { NewsListBlock } from "@/components/blocks/news-list-block";
import { ServiceGridBlock } from "@/components/blocks/service-grid-block";
import { renderBuilderSection } from "@/components/builder/render-builder-section";
import { SectionReveal } from "@/components/site/section-reveal";
import type { NewsListItem } from "@/lib/builder/blocks/news-list";
import type { BuilderPageDocument } from "@/lib/builder/schema";
import type { SiteProductSummary } from "@/lib/products/contracts";

type PageRendererProps = {
  document: BuilderPageDocument;
  newsArticles?: NewsListItem[];
  products?: SiteProductSummary[];
};

export function PageRenderer({ document, newsArticles, products }: PageRendererProps) {
  const { scrollAnimationDurationMs, scrollAnimationEnabled, scrollAnimationPreset } =
    document.site;

  return (
    <>
      {document.sections.map((section) => {
        if (section.type === "news-list") {
          return (
            <SectionReveal
              durationMs={scrollAnimationDurationMs}
              enabled={scrollAnimationEnabled}
              key={section.id}
              preset={scrollAnimationPreset}
            >
              <NewsListBlock
                articles={newsArticles}
                isEditor={false}
                isSelected={false}
                props={section.props}
              />
            </SectionReveal>
          );
        }

        if (section.type === "service-grid") {
          return (
            <SectionReveal
              durationMs={scrollAnimationDurationMs}
              enabled={scrollAnimationEnabled}
              key={section.id}
              preset={scrollAnimationPreset}
            >
              <ServiceGridBlock
                isEditor={false}
                isSelected={false}
                products={products}
                props={section.props}
              />
            </SectionReveal>
          );
        }

        return (
          <SectionReveal
            durationMs={scrollAnimationDurationMs}
            enabled={scrollAnimationEnabled}
            key={section.id}
            preset={scrollAnimationPreset}
          >
            {renderBuilderSection(section, {
              isEditor: false,
              isSelected: false,
            })}
          </SectionReveal>
        );
      })}
    </>
  );
}
