import type { ContactMethodsProps } from "@/lib/builder/blocks/contact-methods";
import type { BuilderBlockComponentProps } from "@/lib/builder/types";

export function ContactMethodsBlock({
  props,
  isEditor = false,
}: BuilderBlockComponentProps<ContactMethodsProps>) {
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
            联系方式
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
              className="rounded-xl border border-slate-200 bg-white p-7 shadow-[0_12px_24px_rgba(15,23,42,0.05)]"
              key={`${item.label}-${index}`}
            >
              <p className="text-sm font-medium text-indigo-600">{item.label}</p>
              <h3 className="mt-4 text-xl font-semibold text-slate-950">{item.value}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
