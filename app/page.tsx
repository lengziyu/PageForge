import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-10 px-6 py-16">
      <div className="max-w-3xl space-y-6">
        <span className="inline-flex rounded-md border border-teal-800/20 bg-teal-700/10 px-4 py-1 text-sm font-medium text-teal-900">
          PageForge MVP
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
          企业官网模板 + 模块化拖拽编辑器
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">
          当前版本已经具备模板预设、标准企业页面生成、模块化编辑、页面管理以及草稿发布流。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          href="/editor"
        >
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Editor
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">
            打开模板与页面管理
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            先选择模板生成标准页面，再进入编辑器调整模块、内容与页面状态。
          </p>
        </Link>

        <Link
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          href="/sites/homepage"
        >
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Site
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">查看线上首页</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            使用同一份 JSON schema 与 block registry 渲染已发布页面。
          </p>
        </Link>
      </div>
    </main>
  );
}
