import type { TechHighlightsProps } from "@/lib/builder/blocks/tech-highlights";
import type { BuilderBlockComponentProps } from "@/lib/builder/types";

export function TechHighlightsBlock({
  props,
  isEditor = false,
}: BuilderBlockComponentProps<TechHighlightsProps>) {
  return (
    <section
      className={`px-6 py-18 md:px-10 md:py-22 ${
        isEditor
          ? "bg-slate-50"
          : "bg-[linear-gradient(180deg,#f6f8fd_0%,#ffffff_100%)]"
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
            技术研发
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            {props.title}
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            {props.description}
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {props.items.map((item, index) => (
            <article
              className="rounded-xl border border-slate-200 bg-slate-950 p-7 text-white shadow-[0_12px_24px_rgba(15,23,42,0.12)]"
              key={`${item.title}-${index}`}
            >
              <p className="text-3xl font-semibold text-indigo-300">{item.metric}</p>
              <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/72">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
