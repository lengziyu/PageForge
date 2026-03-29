import type { CompanyIntroProps } from "@/lib/builder/blocks/company-intro";
import type { BuilderBlockComponentProps } from "@/lib/builder/types";

export function CompanyIntroBlock({
  props,
  isEditor = false,
}: BuilderBlockComponentProps<CompanyIntroProps>) {
  return (
    <section
      className={`px-6 py-18 md:px-10 md:py-22 ${
        isEditor ? "bg-slate-50" : "bg-white"
      }`}
    >
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
            关于我们
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            {props.title}
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600">
            {props.description}
          </p>
        </div>

        <div className="grid gap-4">
          {props.items.map((item, index) => (
            <article
              className="rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8f9fd_100%)] p-6 shadow-[0_12px_24px_rgba(15,23,42,0.05)]"
              key={`${item.title}-${index}`}
            >
              <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
