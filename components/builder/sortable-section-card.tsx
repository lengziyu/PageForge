"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { renderBuilderSection } from "@/components/builder/render-builder-section";
import { blockRegistry } from "@/lib/builder/registry";
import type { BuilderPageSection } from "@/lib/builder/schema";

type SortableSectionCardProps = {
  section: BuilderPageSection;
  index: number;
  isSelected: boolean;
  isCollapsed: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onToggleCollapse: () => void;
};

export function SortableSectionCard({
  section,
  index,
  isSelected,
  isCollapsed,
  onSelect,
  onRemove,
  onToggleCollapse,
}: SortableSectionCardProps) {
  const definition = blockRegistry[section.type];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-white shadow-sm transition ${
        isSelected
          ? "border-indigo-500 ring-2 ring-indigo-100"
          : "border-slate-200 hover:border-slate-300"
      } ${isDragging ? "opacity-70 shadow-lg" : ""}`}
      onClick={onSelect}
      ref={setNodeRef}
      style={style}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
            {index + 1}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-950">{definition.label}</p>
            <p className="text-xs text-slate-500">
              {isCollapsed ? "当前已收起，方便拖拽排序" : "点击选中并编辑当前模块"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            onClick={(event) => {
              event.stopPropagation();
              onToggleCollapse();
            }}
            type="button"
          >
            {isCollapsed ? "展开" : "收起"}
          </button>
          <button
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            type="button"
          >
            删除
          </button>
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 active:cursor-grabbing"
            onClick={(event) => event.stopPropagation()}
            type="button"
          >
            拖拽
          </button>
        </div>
      </div>

      {isCollapsed ? (
        <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-600">模块预览已收起，点击展开可继续查看内容。</p>
          <span className="rounded-md bg-white px-3 py-1 text-xs text-slate-500">
            {section.type}
          </span>
        </div>
      ) : (
        <div className="p-4">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            {renderBuilderSection(section, {
              isEditor: true,
              isSelected,
            })}
          </div>
        </div>
      )}
    </article>
  );
}
