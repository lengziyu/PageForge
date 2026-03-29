import type { ComponentType } from "react";
import { blockRegistry } from "@/lib/builder/registry";
import type { BuilderPageSection } from "@/lib/builder/schema";
import type { BuilderBlockComponentProps } from "@/lib/builder/types";

type RenderBuilderSectionOptions = {
  key?: string;
  isEditor: boolean;
  isSelected: boolean;
};

export function renderBuilderSection(
  section: BuilderPageSection,
  options: RenderBuilderSectionOptions,
) {
  const BlockComponent = blockRegistry[section.type]
    .component as ComponentType<BuilderBlockComponentProps<unknown>>;

  return (
    <BlockComponent
      isEditor={options.isEditor}
      isSelected={options.isSelected}
      key={options.key ?? section.id}
      props={section.props}
    />
  );
}
