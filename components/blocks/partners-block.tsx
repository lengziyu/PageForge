import type { PartnersProps } from "@/lib/builder/blocks/partners";
import type { BuilderBlockComponentProps } from "@/lib/builder/types";

export function PartnersBlock({
  props,
  isEditor = false,
}: BuilderBlockComponentProps<PartnersProps>) {
  return (
    <section
      className={`px-6 py-14 md:px-10 md:py-18 ${
        isEditor ? "bg-slate-50" : "bg-slate-50"
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
            生态合作
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            {props.title}
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">{props.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {props.items.map((item, index) => (
            <div
              className="flex h-16 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition hover:shadow-[0_4px_16px_rgba(99,102,241,0.1)]"
              key={`${item.name}-${index}`}
            >
              <span className="text-sm font-semibold text-slate-600">{item.logoText}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
