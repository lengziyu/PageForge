import type { TestimonialsProps } from "@/lib/builder/blocks/testimonials";
import type { BuilderBlockComponentProps } from "@/lib/builder/types";

function AvatarPlaceholder({ name }: { name: string }) {
  const initials = name.slice(0, 1);
  const colors = [
    "bg-indigo-100 text-indigo-700",
    "bg-violet-100 text-violet-700",
    "bg-sky-100 text-sky-700",
    "bg-emerald-100 text-emerald-700",
  ];
  const colorClass = colors[name.charCodeAt(0) % colors.length];
  return (
    <span
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${colorClass}`}
    >
      {initials}
    </span>
  );
}

export function TestimonialsBlock({
  props,
  isEditor = false,
}: BuilderBlockComponentProps<TestimonialsProps>) {
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
            客户口碑
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            {props.title}
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">{props.description}</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {props.items.map((item, index) => (
            <figure
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_8px_24px_rgba(15,23,42,0.05)]"
              key={`${item.name}-${index}`}
            >
              <blockquote>
                <svg className="mb-4 h-6 w-6 text-indigo-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-sm leading-7 text-slate-700">{item.content}</p>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <AvatarPlaceholder name={item.name} />
                <div>
                  <p className="text-sm font-semibold text-slate-950">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    {item.title} · {item.company}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
