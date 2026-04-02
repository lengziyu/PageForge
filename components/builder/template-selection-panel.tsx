"use client";

import {
  defaultSelectedEnterprisePages,
  enterprisePageCatalog,
  siteTemplateCatalog,
  type EnterprisePageKey,
  type SiteTemplateId,
} from "@/lib/builder/template-catalog";
import {
  footerTemplateCatalog,
  getDefaultFooterTemplate,
  type FooterTemplateId,
} from "@/lib/builder/site-config";

type TemplateSelectionPanelProps = {
  selectedTemplateId: SiteTemplateId;
  selectedPages: EnterprisePageKey[];
  selectedFooterTemplate: FooterTemplateId;
  onTemplateChange: (templateId: SiteTemplateId) => void;
  onPageToggle: (pageKey: EnterprisePageKey, required: boolean) => void;
  onFooterTemplateChange: (footerTemplate: FooterTemplateId) => void;
  compact?: boolean;
};

export function getDefaultSelectedPages(templateId: SiteTemplateId): EnterprisePageKey[] {
  const defaults = [...defaultSelectedEnterprisePages];

  if (templateId === "research-lab") {
    return defaults.includes("technology-rd")
      ? defaults
      : [...defaults, "technology-rd"];
  }

  return defaults.filter((pageKey) => pageKey !== "technology-rd");
}

export function getDefaultFooterTemplateBySite(templateId: SiteTemplateId) {
  return getDefaultFooterTemplate(templateId);
}

export function TemplateSelectionPanel({
  selectedTemplateId,
  selectedPages,
  selectedFooterTemplate,
  onTemplateChange,
  onPageToggle,
  onFooterTemplateChange,
  compact = false,
}: TemplateSelectionPanelProps) {
  const selectedTemplate =
    siteTemplateCatalog.find((template) => template.id === selectedTemplateId) ??
    siteTemplateCatalog[0];
  const selectedPageCount = selectedPages.length;

  return (
    <div className={compact ? "space-y-5" : "grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"}>
      <div className="grid gap-4 xl:grid-cols-2">
        {siteTemplateCatalog.map((template) => {
          const isActive = template.id === selectedTemplateId;

          return (
            <button
              className={`rounded-xl border p-5 text-left transition ${
                isActive
                  ? "border-indigo-500 bg-indigo-50 shadow-[0_12px_24px_rgba(99,102,241,0.08)]"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
              key={template.id}
              onClick={() => onTemplateChange(template.id)}
              type="button"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {template.accent}
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  {template.id}
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-slate-950">{template.name}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{template.industry}</p>
              <p className="mt-2 text-sm leading-7 text-slate-500">{template.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {template.previewPages.map((page) => (
                  <span
                    className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
                    key={`${template.id}-${page}`}
                  >
                    {page}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">生成内容</p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-950">{selectedTemplate.name}</h3>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          先勾选要生成的独立页面，再选择公共页脚样式。首页会作为整站总览页，其它页面都是独立页面，不是单页锚点。
        </p>

        <div className="mt-5 space-y-3">
          {enterprisePageCatalog.map((page) => {
            const checked = selectedPages.includes(page.key);

            return (
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition ${
                  checked
                    ? "border-indigo-200 bg-indigo-50"
                    : "border-slate-200 bg-slate-50"
                }`}
                key={page.key}
              >
                <input
                  checked={checked}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600"
                  disabled={page.required}
                  onChange={() => onPageToggle(page.key, page.required)}
                  type="checkbox"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-950">{page.title}</span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] ${
                        page.required
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-500"
                      }`}
                    >
                      {page.required ? "必选" : "可选"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-6 text-slate-500">{page.description}</p>
                </div>
              </label>
            );
          })}
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">公共页脚样式</p>
            <span className="text-xs text-slate-500">所有页面共用</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {footerTemplateCatalog.map((template) => {
              const isActive = selectedFooterTemplate === template.id;

              return (
                <button
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "border-slate-900 bg-slate-950 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300"
                  }`}
                  key={template.id}
                  onClick={() => onFooterTemplateChange(template.id)}
                  type="button"
                >
                  {template.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          本次将生成 <span className="font-semibold text-slate-950">{selectedPageCount}</span>{" "}
          个独立页面，并应用统一导航与公共页脚。
        </div>
      </aside>
    </div>
  );
}
