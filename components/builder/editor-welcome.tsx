import Link from "next/link";
import { ImageIcon, PenSquare, Upload } from "lucide-react";

export function EditorWelcome() {
  const flowSteps = [
    {
      step: "第一步",
      title: "页面中心",
      icon: PenSquare,
      description:
        "按行业选择模板并快速初始化站点结构，自动生成导航、页脚与核心页面骨架。",
    },
    {
      step: "第二步",
      title: "页面编辑",
      icon: Upload,
      description:
        "在可视化编辑器中拖拽模块、调整样式与信息布局，快速完成企业官网页面搭建。",
    },
    {
      step: "第三步",
      title: "内容管理",
      icon: ImageIcon,
      description:
        "统一管理产品与资讯内容，支持后台持续运营与发布，满足企业官网长期更新需求。",
    },
  ] as const;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e8eefb_0%,#f8fafc_45%,#eef2f7_100%)] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="mx-auto max-w-5xl px-6 py-10 text-center md:px-10 md:py-12">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">PAGEFORGE FLOW</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-slate-950 md:text-5xl">
            流程简单清晰，建站更快更稳。
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            PageForge 提供更便捷的企业官网搭建体验。通过多样化模板可快速完成站点初始化，
            再用可视化编辑器高效完成页面设计，并在后台持续管理产品与资讯内容，
            轻松覆盖多数企业官网“搭建 + 运营”需求。
          </p>
          <div className="mt-6">
            <Link
              className="inline-flex h-14 min-w-[320px] items-center justify-center rounded-xl bg-[linear-gradient(135deg,#2531a5_0%,#5b4df5_52%,#6b6cff_100%)] px-10 text-lg font-semibold text-white shadow-[0_16px_36px_rgba(62,73,196,0.24)] transition hover:-translate-y-0.5"
              href="/editor/start"
            >
              开始建站
            </Link>
          </div>
        </header>

        <section className="rounded-2xl border border-blue-200/70 bg-[linear-gradient(145deg,#f2f6ff_0%,#eaf1ff_100%)] p-6 shadow-sm md:p-8">
          <div className="relative">
            <span className="pointer-events-none absolute left-[16.67%] right-[16.67%] top-6 hidden h-0.5 bg-blue-300 md:block" />
            <div className="grid gap-6 md:grid-cols-3">
            {flowSteps.map((item) => {
              const Icon = item.icon;

              return (
              <article className="relative z-10 text-center" key={item.step}>
                <div className="relative mb-4 flex h-12 items-center justify-center">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-sm">
                    <Icon className="h-6 w-6" />
                  </span>
                </div>

                <p className="text-xs uppercase tracking-[0.2em] text-blue-600">{item.step}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </article>
            )})}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
