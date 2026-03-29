import type { CtaBlockProps } from "@/lib/builder/blocks/cta";
import type { BuilderBlockComponentProps } from "@/lib/builder/types";

export function CtaBlock({
  props,
  isEditor = false,
}: BuilderBlockComponentProps<CtaBlockProps>) {
  return (
    <section
      className={`px-6 py-18 md:px-10 md:py-22 ${
        isEditor
          ? "bg-slate-50"
          : "bg-[linear-gradient(180deg,#f5f7fc_0%,#eef2f9_100%)]"
      }`}
    >
      <div className="mx-auto max-w-5xl rounded-xl border border-slate-200 bg-slate-950 px-8 py-12 text-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] md:px-12">
        <div className="max-w-3xl space-y-5">
          <p className="text-sm uppercase tracking-[0.22em] text-indigo-300">
            行动引导
          </p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {props.title}
          </h2>
          <p className="text-base leading-8 text-white/72">
            {props.description}
          </p>
          <a
            className="inline-flex rounded-lg bg-[linear-gradient(135deg,#2531a5_0%,#5b4df5_50%,#6b6cff_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(62,73,196,0.24)] transition hover:-translate-y-0.5"
            href={props.buttonHref}
          >
            {props.buttonLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
