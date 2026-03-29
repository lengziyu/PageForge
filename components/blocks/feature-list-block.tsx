import type {
  FeatureIcon,
  FeatureListBlockProps,
} from "@/lib/builder/blocks/feature-list";
import type { BuilderBlockComponentProps } from "@/lib/builder/types";

type FeatureIconProps = {
  icon: FeatureIcon;
};

function FeatureCardIcon({ icon }: FeatureIconProps) {
  const commonClassName = "h-5 w-5 stroke-[1.7]";

  if (icon === "shield") {
    return (
      <svg className={commonClassName} fill="none" viewBox="0 0 24 24">
        <path d="M12 3 5 6v5c0 4.5 2.8 7.7 7 10 4.2-2.3 7-5.5 7-10V6l-7-3Z" stroke="currentColor" />
      </svg>
    );
  }

  if (icon === "pulse") {
    return (
      <svg className={commonClassName} fill="none" viewBox="0 0 24 24">
        <path d="M3 12h4l2-4 4 8 2-4h6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "spark") {
    return (
      <svg className={commonClassName} fill="none" viewBox="0 0 24 24">
        <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" stroke="currentColor" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "globe") {
    return (
      <svg className={commonClassName} fill="none" viewBox="0 0 24 24">
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" />
        <path d="M3 12h18M12 3c2.5 2.4 4 5.7 4 9s-1.5 6.6-4 9c-2.5-2.4-4-5.7-4-9s1.5-6.6 4-9Z" stroke="currentColor" />
      </svg>
    );
  }

  if (icon === "chip") {
    return (
      <svg className={commonClassName} fill="none" viewBox="0 0 24 24">
        <path d="M8 8h8v8H8zM4 10h2M4 14h2M18 10h2M18 14h2M10 4v2M14 4v2M10 18v2M14 18v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg className={commonClassName} fill="none" viewBox="0 0 24 24">
      <path d="M4 7h16M4 12h16M4 17h16M7 4v16M12 4v16M17 4v16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FeatureListBlock({
  props,
  isEditor = false,
}: BuilderBlockComponentProps<FeatureListBlockProps>) {
  return (
    <section
      className={`px-6 py-18 md:px-10 md:py-22 ${
        isEditor
          ? "bg-slate-50"
          : "bg-[linear-gradient(180deg,#f7f8fc_0%,#ffffff_100%)]"
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
            核心能力
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
              className="rounded-xl border border-slate-200/80 bg-white p-7 shadow-[0_12px_24px_rgba(15,23,42,0.06)]"
              key={`${item.title}-${index}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#23308f_0%,#5b4df5_100%)] text-white shadow-lg shadow-indigo-200/60">
                <FeatureCardIcon icon={item.icon} />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-950">
                {item.title}
              </h3>
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
