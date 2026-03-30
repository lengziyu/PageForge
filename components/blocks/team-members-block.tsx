import type { TeamMembersProps } from "@/lib/builder/blocks/team-members";
import type { BuilderBlockComponentProps } from "@/lib/builder/types";

function MemberAvatar({ name }: { name: string }) {
  const initials = name.slice(0, 1);
  const gradients = [
    "from-indigo-400 to-violet-500",
    "from-sky-400 to-indigo-500",
    "from-violet-400 to-purple-500",
    "from-emerald-400 to-teal-500",
  ];
  const gradient = gradients[name.charCodeAt(0) % gradients.length];
  return (
    <div
      className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-xl font-semibold text-white shadow-[0_8px_16px_rgba(99,102,241,0.2)]`}
    >
      {initials}
    </div>
  );
}

export function TeamMembersBlock({
  props,
  isEditor = false,
}: BuilderBlockComponentProps<TeamMembersProps>) {
  return (
    <section
      className={`px-6 py-18 md:px-10 md:py-22 ${
        isEditor ? "bg-slate-50" : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
            团队
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            {props.title}
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">{props.description}</p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {props.items.map((item, index) => (
            <div
              className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8f9fd_100%)] p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)]"
              key={`${item.name}-${index}`}
            >
              <MemberAvatar name={item.name} />
              <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.name}</h3>
              <p className="mt-1 text-sm font-medium text-indigo-600">{item.title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
