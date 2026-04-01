"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { blockDefinitions, type BuilderBlockType } from "@/lib/builder/registry";

type BlockPaletteProps = {
  onAddBlock: (blockType: BuilderBlockType) => void;
};

function MiniHeroPreview() {
  return (
    <div className="rounded-lg border border-slate-200 bg-[linear-gradient(180deg,#f5f7fb_0%,#ffffff_100%)] p-3">
      <div className="grid grid-cols-[1.2fr_0.9fr] gap-3">
        <div className="space-y-2">
          <div className="h-2 w-16 rounded bg-slate-200" />
          <div className="h-3 w-4/5 rounded bg-slate-300" />
          <div className="h-3 w-3/5 rounded bg-slate-300" />
          <div className="h-2 w-full rounded bg-slate-200" />
          <div className="h-2 w-2/3 rounded bg-slate-100" />
          <div className="flex gap-2 pt-1">
            <div className="h-7 w-16 rounded-lg bg-[linear-gradient(135deg,#2531a5_0%,#5b4df5_100%)]" />
            <div className="h-7 w-14 rounded-lg border border-slate-200 bg-white" />
          </div>
        </div>
        <div className="rounded-lg bg-[radial-gradient(circle_at_top_left,#dbe4ff_0%,#eef2ff_55%,#f8fafc_100%)]" />
      </div>
    </div>
  );
}

function MiniStatsPreview() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-3 h-2 w-20 rounded bg-slate-200" />
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((item) => (
          <div className="rounded-lg bg-slate-50 p-2" key={item}>
            <div className="h-3 w-8 rounded bg-slate-300" />
            <div className="mt-2 h-2 w-12 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniFeaturePreview() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="h-3 w-28 rounded bg-slate-300" />
      <div className="mt-2 h-2 w-2/3 rounded bg-slate-200" />
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((item) => (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2" key={item}>
            <div className="h-6 w-6 rounded-lg bg-slate-200" />
            <div className="mt-2 h-2 w-4/5 rounded bg-slate-300" />
            <div className="mt-2 h-2 w-full rounded bg-slate-200" />
            <div className="mt-1 h-2 w-2/3 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniServicePreview() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="h-3 w-24 rounded bg-slate-300" />
      <div className="mt-2 h-2 w-3/4 rounded bg-slate-200" />
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((item) => (
          <div
            className="rounded-lg border border-slate-200 bg-white p-2 shadow-[0_8px_16px_rgba(15,23,42,0.04)]"
            key={item}
          >
            <div className="h-5 w-5 rounded-md bg-slate-900/90" />
            <div className="mt-2 h-2 w-4/5 rounded bg-slate-300" />
            <div className="mt-2 h-2 w-full rounded bg-slate-200" />
            <div className="mt-1 h-2 w-3/4 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniTechPreview() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="h-3 w-24 rounded bg-slate-300" />
      <div className="mt-2 h-2 w-2/3 rounded bg-slate-200" />
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((item) => (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2" key={item}>
            <div className="h-3 w-8 rounded bg-indigo-200" />
            <div className="mt-2 h-2 w-4/5 rounded bg-slate-300" />
            <div className="mt-2 h-2 w-full rounded bg-slate-200" />
            <div className="mt-1 h-2 w-2/3 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniNewsPreview() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="space-y-2">
        {[0, 1].map((item) => (
          <div
            className="grid grid-cols-[90px_56px_minmax(0,1fr)_28px] gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2"
            key={item}
          >
            <div className="h-14 rounded-md bg-slate-200" />
            <div>
              <div className="h-4 w-10 rounded bg-slate-300" />
              <div className="mt-2 h-2 w-8 rounded bg-slate-200" />
            </div>
            <div>
              <div className="h-2 w-full rounded bg-slate-300" />
              <div className="mt-2 h-2 w-5/6 rounded bg-slate-200" />
            </div>
            <div className="h-8 w-8 rounded-md bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniCompanyPreview() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="h-3 w-24 rounded bg-slate-300" />
      <div className="mt-2 h-2 w-2/3 rounded bg-slate-200" />
      <div className="mt-3 grid gap-2">
        {[0, 1].map((item) => (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2" key={item}>
            <div className="h-2 w-24 rounded bg-slate-300" />
            <div className="mt-2 h-2 w-full rounded bg-slate-200" />
            <div className="mt-1 h-2 w-3/4 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniContactPreview() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="h-3 w-24 rounded bg-slate-300" />
      <div className="mt-2 h-2 w-2/3 rounded bg-slate-200" />
      <div className="mt-3 space-y-2">
        {[0, 1, 2].map((item) => (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" key={item}>
            <div className="h-2 w-12 rounded bg-slate-200" />
            <div className="mt-2 h-2 w-4/5 rounded bg-slate-300" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniCtaPreview() {
  return (
    <div className="rounded-lg border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] p-3">
      <div className="mx-auto max-w-[140px] text-center">
        <div className="mx-auto h-3 w-20 rounded bg-slate-300" />
        <div className="mx-auto mt-2 h-2 w-full rounded bg-slate-200" />
        <div className="mx-auto mt-1 h-2 w-2/3 rounded bg-slate-100" />
        <div className="mx-auto mt-3 h-7 w-20 rounded-lg bg-[linear-gradient(135deg,#2531a5_0%,#5b4df5_100%)]" />
      </div>
    </div>
  );
}

function MiniTestimonialsPreview() {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 h-2 w-24 rounded bg-slate-300" />
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div className="rounded-lg border border-slate-200 bg-white p-2" key={i}>
            <div className="flex gap-0.5 mb-1">
              {[0,1,2,3,4].map((s) => <div className="h-1.5 w-1.5 rounded-full bg-amber-400" key={s} />)}
            </div>
            <div className="h-2 w-full rounded bg-slate-200" />
            <div className="mt-1 h-2 w-3/4 rounded bg-slate-100" />
            <div className="mt-2 h-2 w-2/3 rounded bg-slate-300" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniFaqPreview() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 h-3 w-20 rounded bg-slate-300" />
      <div className="space-y-1.5">
        {[0, 1, 2].map((i) => (
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5" key={i}>
            <div className="h-2 w-3/4 rounded bg-slate-200" />
            <div className="h-3 w-3 rounded-full border border-slate-300" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniPartnersPreview() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 mx-auto h-2 w-20 rounded bg-slate-300" />
      <div className="grid grid-cols-4 gap-2">
        {[0,1,2,3,4,5,6,7].map((i) => (
          <div className="h-6 rounded-lg border border-slate-200 bg-slate-50" key={i} />
        ))}
      </div>
    </div>
  );
}

function MiniTeamPreview() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 h-2 w-20 rounded bg-slate-300" />
      <div className="grid grid-cols-4 gap-2">
        {[0,1,2,3].map((i) => (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2" key={i}>
            <div className="mx-auto mb-1 h-8 w-8 rounded-full bg-slate-200" />
            <div className="h-2 w-full rounded bg-slate-300" />
            <div className="mt-1 h-1.5 w-3/4 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

function BlockPreview({ type }: { type: BuilderBlockType }) {
  switch (type) {
    case "hero":
      return <MiniHeroPreview />;
    case "stats-strip":
      return <MiniStatsPreview />;
    case "feature-list":
      return <MiniFeaturePreview />;
    case "service-grid":
      return <MiniServicePreview />;
    case "tech-highlights":
      return <MiniTechPreview />;
    case "news-list":
      return <MiniNewsPreview />;
    case "company-intro":
      return <MiniCompanyPreview />;
    case "contact-methods":
      return <MiniContactPreview />;
    case "cta":
      return <MiniCtaPreview />;
    case "testimonials":
      return <MiniTestimonialsPreview />;
    case "faq":
      return <MiniFaqPreview />;
    case "partners":
      return <MiniPartnersPreview />;
    case "team-members":
      return <MiniTeamPreview />;
    default:
      return null;
  }
}

function DraggablePaletteItem({
  type,
  label,
  onClick,
}: {
  type: BuilderBlockType;
  label: string;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: {
      source: "palette",
      blockType: type,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <button
      {...attributes}
      {...listeners}
      className={`group w-full overflow-hidden rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#fbfcff_0%,#f4f6fb_100%)] p-3 text-left transition hover:border-indigo-300 hover:shadow-[0_12px_24px_rgba(99,102,241,0.08)] ${
        isDragging ? "opacity-70" : ""
      }`}
      onClick={onClick}
      ref={setNodeRef}
      style={style}
      type="button"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 text-sm font-semibold text-slate-950">{label}</span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition group-hover:border-indigo-300 group-hover:text-indigo-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </span>
      </div>

      <div className="mt-3 overflow-hidden">
        <BlockPreview type={type} />
      </div>
    </button>
  );
}

export function BlockPalette({ onAddBlock }: BlockPaletteProps) {
  return (
    <aside className="min-w-0 overflow-x-hidden rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur xl:max-h-[calc(100vh-2rem)] xl:overflow-hidden">
      <div className="mb-3">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">模块库</p>
        <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-950">
          可添加模块
        </h3>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">
          支持点击添加，也支持直接拖到中间画布。
        </p>
      </div>

      <div className="min-w-0 grid gap-2.5 overflow-x-hidden xl:max-h-[calc(100vh-11rem)] xl:overflow-y-auto xl:pr-1">
        {blockDefinitions.map((block) => (
          <DraggablePaletteItem
            key={block.type}
            label={block.label}
            onClick={() => onAddBlock(block.type)}
            type={block.type}
          />
        ))}
      </div>
    </aside>
  );
}
