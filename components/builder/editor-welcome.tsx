import Link from "next/link";

export function EditorWelcome() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e8eefb_0%,#f8fafc_45%,#eef2f7_100%)] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur md:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">PAGEFORGE FLOW</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-slate-950 md:text-5xl">
            先看清流程，再开始建站。
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            这是一套从“站点初始化”到“页面编辑”再到“内容运营”的连续工作流。首次登录先看一遍，
            点击下方按钮即可进入第一步 Editor 开始建站。
          </p>
          <div className="mt-6">
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-[linear-gradient(135deg,#2531a5_0%,#5b4df5_52%,#6b6cff_100%)] px-8 py-4 text-base font-semibold text-white shadow-[0_16px_36px_rgba(62,73,196,0.24)] transition hover:-translate-y-0.5"
              href="/editor/start"
            >
              开始建站
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              step: "第一步",
              title: "页面中心",
              description:
                "选择行业模板，勾选要生成的页面，初始化整站结构与导航、页脚。",
            },
            {
              step: "第二步",
              title: "页面编辑",
              description:
                "进入页面编辑器，按模块拖拽和字段配置完成首页与各独立页面细化。",
            },
            {
              step: "第三步",
              title: "内容管理",
              description:
                "统一管理产品与资讯内容，持续更新内容资产，再按需发布整站。",
            },
          ].map((item) => (
            <article
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              key={item.step}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.step}</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
