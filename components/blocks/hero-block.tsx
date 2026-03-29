import type { HeroBlockProps } from "@/lib/builder/blocks/hero";
import type { BuilderBlockComponentProps } from "@/lib/builder/types";

export function HeroBlock({
  props,
  isEditor = false,
}: BuilderBlockComponentProps<HeroBlockProps>) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundImage: `url(${props.backgroundImageSrc})` }}
    >
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${
          isEditor ? "scale-[1.02]" : ""
        }`}
        style={{ backgroundImage: `url(${props.backgroundImageSrc})` }}
      />
      <div
        className={`absolute inset-0 ${
          isEditor
            ? "bg-[linear-gradient(90deg,rgba(248,250,252,0.96)_0%,rgba(248,250,252,0.92)_34%,rgba(241,245,249,0.58)_62%,rgba(15,23,42,0.18)_100%)]"
            : "bg-[linear-gradient(90deg,rgba(248,250,252,0.97)_0%,rgba(248,250,252,0.9)_36%,rgba(241,245,249,0.38)_64%,rgba(15,23,42,0.12)_100%)]"
        }`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.08),transparent_28%)]" />

      <div className="relative mx-auto max-w-6xl px-6 py-18 md:px-10 md:py-24">
        <div className="max-w-2xl">
          <p className="inline-flex rounded-md border border-white/70 bg-white/82 px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm backdrop-blur">
            {props.eyebrow}
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
            {props.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">{props.description}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              className="inline-flex rounded-lg bg-[linear-gradient(135deg,#2531a5_0%,#5b4df5_50%,#6b6cff_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(62,73,196,0.24)] transition hover:-translate-y-0.5"
              href={props.primaryCtaHref}
            >
              {props.primaryCtaLabel}
            </a>
            <a
              className="inline-flex rounded-lg border border-slate-200 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
              href={props.secondaryCtaHref}
            >
              {props.secondaryCtaLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
