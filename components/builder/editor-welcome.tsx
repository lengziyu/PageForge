import Link from "next/link";
import { ImageIcon, PenSquare, Upload } from "lucide-react";

export function EditorWelcome() {
  const flowSteps = [
    { id: "1", label: "Step 1", icon: PenSquare },
    { id: "2", label: "Step 2", icon: Upload },
    { id: "3", label: "Step 3", icon: ImageIcon },
  ] as const;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e8eefb_0%,#f8fafc_45%,#eef2f7_100%)] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">PAGEFORGE FLOW</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-slate-950 md:text-5xl">
            先看清流程，再开始建站。
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            这是一套从“站点初始化”到“页面编辑”再到“内容运营”的连续工作流。首次登录先看一遍，
            点击下方按钮即可进入第一步 Editor 开始建站。
          </p>
          <div className="mt-6">
            <Link
              className="inline-flex h-14 min-w-[260px] items-center justify-center rounded-xl bg-[linear-gradient(135deg,#2531a5_0%,#5b4df5_52%,#6b6cff_100%)] px-10 text-lg font-semibold text-white shadow-[0_16px_36px_rgba(62,73,196,0.24)] transition hover:-translate-y-0.5"
              href="/editor/start"
            >
              开始建站
            </Link>
          </div>
        </header>

        <section className="rounded-2xl bg-slate-950 px-4 py-6 shadow-sm md:px-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-start">
            {flowSteps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === flowSteps.length - 1;

              return (
                <div className="contents" key={step.id}>
                  <article className="space-y-4 text-blue-400">
                    <Icon className="h-9 w-9" strokeWidth={2} />
                    <p className="text-4xl font-semibold leading-none tracking-tight">
                      {step.id}
                    </p>
                    <p className="text-2xl font-semibold">{step.label}</p>
                  </article>
                  {!isLast ? <div className="hidden h-0.5 bg-blue-400/70 md:block" /> : null}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
