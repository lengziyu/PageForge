import Link from "next/link";
import type { Metadata } from "next";

const highlights = [
  {
    label: "搭建方式",
    value: "模块化编辑",
    description: "像搭积木一样组织官网内容，不需要从零写每一页。",
  },
  {
    label: "适用场景",
    value: "企业官网",
    description: "适合品牌官网、产品介绍站、新闻资讯页和联系页统一搭建。",
  },
  {
    label: "交付节奏",
    value: "快速上线",
    description: "先生成标准站点骨架，再逐页细化文案、图片、模块与导航。",
  },
] as const;

const steps = [
  {
    index: "01",
    title: "选择站点模板",
    description: "先按行业模板生成首页、服务页、新闻页、关于页和联系页的标准结构。",
  },
  {
    index: "02",
    title: "进入可视化编辑",
    description: "在编辑器里拖拽模块、修改标题、描述、按钮、图片和全站公共设置。",
  },
  {
    index: "03",
    title: "配置导航与内容",
    description: "统一维护菜单、页脚、品牌信息和新闻内容，让多页面保持一致表达。",
  },
  {
    index: "04",
    title: "整站发布上线",
    description: "构建完成后发布整站，对外展示完整的企业官网，而不是单页 Demo。",
  },
] as const;

const advantages = [
  "不是只做一个首页，而是面向完整企业官网的信息架构。",
  "页面、模块、导航、页脚、新闻中心都在同一套后台里维护。",
  "模块有 schema 约束，内容结构更稳定，后续演进不容易失控。",
  "既能快速生成初版，又保留继续精细编辑的空间。",
  "更适合团队协作交付，而不是一次性的静态切图页面。",
] as const;

const audiences = [
  "想快速搭一个像样企业官网的产品或运营团队",
  "需要交付标准企业站模板的外包或工作室团队",
  "希望把官网维护权交回内容团队，而不是每次都找开发改页面",
] as const;

export const metadata: Metadata = {
  title: "关于 PageForge",
  description: "PageForge 是一个用于搭建企业官网的模板化、模块化可视化编辑系统。",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d7efe8_0%,transparent_28%),linear-gradient(180deg,#f7fbfa_0%,#eef2f7_48%,#f8fafc_100%)] text-slate-900">
      <section className="border-b border-slate-200/70">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-teal-700">PageForge</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
                企业官网的模板化建站器
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                PageForge 用来快速生成并维护一套完整的企业官网。它不是单个落地页模板，
                而是一套包含多页面结构、模块拖拽编辑、新闻中心和整站发布能力的后台系统。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                href="/editor"
                style={{ color: "#ffffff" }}
              >
                进入编辑后台
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                href="/sites/homepage"
              >
                查看当前站点
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <article
                className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur"
                key={item.label}
              >
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{item.label}</p>
                <h2 className="mt-4 text-2xl font-semibold text-slate-950">{item.value}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs uppercase tracking-[0.28em] text-teal-700">它是什么</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              一套为企业官网准备好的内容骨架和编辑系统
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-8 text-slate-600">
              <p>
                它会先帮你生成一套完整的网站基础结构，比如首页、服务与产品、新闻资讯、关于我们、联系我们。
                然后你可以继续在后台里逐页编辑，而不是从空白项目开始搭。
              </p>
              <p>
                相比传统“静态页面模板”，PageForge 更强调长期可维护。页面不是写死的，
                模块是可拖拽、可复用、可校验的，适合团队持续更新内容。
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#0f172a_0%,#162337_100%)] p-8 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <p className="text-xs uppercase tracking-[0.28em] text-teal-200">它适合谁</p>
            <div className="mt-6 space-y-4">
              {audiences.map((item) => (
                <div
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm leading-7 text-slate-200"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.28em] text-teal-700">怎么使用</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              从模板初始化到整站发布的完整流程
            </h2>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {steps.map((step) => (
              <article
                className="rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#fbfffe_0%,#f7fafc_100%)] p-6"
                key={step.index}
              >
                <p className="text-sm font-semibold text-teal-700">{step.index}</p>
                <h3 className="mt-4 text-xl font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs uppercase tracking-[0.28em] text-teal-700">优势</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              比普通模板更适合真正交付和维护
            </h2>
            <div className="mt-6 space-y-3">
              {advantages.map((item) => (
                <div
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-teal-200 bg-[linear-gradient(145deg,#e8fbf5_0%,#ffffff_62%)] p-8 shadow-[0_24px_60px_rgba(20,184,166,0.08)]">
            <p className="text-xs uppercase tracking-[0.28em] text-teal-700">快速入口</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              现在就能开始使用
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-8 text-slate-600">
              <p>
                如果你是第一次接触这个项目，建议先进入编辑后台看模板初始化流程；
                如果站点已经有内容，再去看当前公开站点的实际展示效果。
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link
                className="rounded-3xl bg-slate-950 px-6 py-6 text-white shadow-[0_18px_36px_rgba(15,23,42,0.18)] transition hover:bg-slate-800"
                href="/editor"
                style={{ color: "#ffffff" }}
              >
                <p className="text-sm font-semibold">/editor</p>
                <p className="mt-2 text-sm text-slate-300">进入后台，初始化模板并开始编辑页面。</p>
              </Link>
              <Link
                className="rounded-3xl border border-slate-200 bg-white px-6 py-6 transition hover:border-slate-300 hover:bg-slate-50"
                href="/sites/homepage"
              >
                <p className="text-sm font-semibold text-slate-950">/sites/homepage</p>
                <p className="mt-2 text-sm text-slate-600">查看当前公开站点的首页展示效果。</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
