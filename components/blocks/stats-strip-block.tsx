import type { StatsStripProps } from "@/lib/builder/blocks/stats-strip";
import type { BuilderBlockComponentProps } from "@/lib/builder/types";

export function StatsStripBlock({
  props,
  isEditor = false,
}: BuilderBlockComponentProps<StatsStripProps>) {
  return (
    <section
      className={`px-6 py-12 md:px-10 md:py-16 ${
        isEditor
          ? "bg-slate-50"
          : "bg-[linear-gradient(180deg,#f4f6fb_0%,#ffffff_100%)]"
      }`}
    >
      <div className="mx-auto max-w-6xl rounded-xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_12px_24px_rgba(15,23,42,0.05)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
              数据概览
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
              {props.title}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:min-w-[60%]">
            {props.items.map((item, index) => (
              <article
                className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4"
                key={`${item.label}-${index}`}
              >
                <p className="text-2xl font-semibold text-slate-950 md:text-3xl">
                  {item.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">{item.label}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
