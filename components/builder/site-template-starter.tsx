"use client";

import { useState } from "react";
import type {
  EnterprisePageKey,
  SiteTemplateId,
} from "@/lib/builder/template-catalog";
import type { FooterTemplateId } from "@/lib/builder/site-config";
import {
  getDefaultFooterTemplateBySite,
  getDefaultSelectedPages,
  TemplateSelectionPanel,
} from "@/components/builder/template-selection-panel";

type SiteTemplateStarterProps = {
  isSubmitting: boolean;
  message: string;
  onCreateSite: (input: {
    templateId: SiteTemplateId;
    selectedPages: EnterprisePageKey[];
    footerTemplate: FooterTemplateId;
  }) => void;
};

export function SiteTemplateStarter({
  isSubmitting,
  message,
  onCreateSite,
}: SiteTemplateStarterProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<SiteTemplateId>("saas");
  const [selectedPages, setSelectedPages] = useState<EnterprisePageKey[]>(
    getDefaultSelectedPages("saas"),
  );
  const [selectedFooterTemplate, setSelectedFooterTemplate] =
    useState<FooterTemplateId>(getDefaultFooterTemplateBySite("saas"));

  const handleTemplateChange = (templateId: SiteTemplateId) => {
    setSelectedTemplateId(templateId);
    setSelectedPages(getDefaultSelectedPages(templateId));
    setSelectedFooterTemplate(getDefaultFooterTemplateBySite(templateId));
  };

  const handleTogglePage = (pageKey: EnterprisePageKey, required: boolean) => {
    if (required) {
      return;
    }

    setSelectedPages((current) =>
      current.includes(pageKey)
        ? current.filter((item) => item !== pageKey)
        : [...current, pageKey],
    );
  };

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">站点初始化</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              先选行业模板，再生成独立页面
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              第一步选择行业模板，第二步勾选要生成的页面和公共页脚样式。生成完成后会自动进入首页编辑，后续可继续拖拽修改各页面内容。
            </p>
          </div>
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        </div>
      </div>

      <TemplateSelectionPanel
        onFooterTemplateChange={setSelectedFooterTemplate}
        onPageToggle={handleTogglePage}
        onTemplateChange={handleTemplateChange}
        selectedFooterTemplate={selectedFooterTemplate}
        selectedPages={selectedPages}
        selectedTemplateId={selectedTemplateId}
      />

      <div className="flex justify-end">
        <button
          className="inline-flex items-center justify-center rounded-lg bg-[linear-gradient(135deg,#2531a5_0%,#5b4df5_50%,#6b6cff_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(62,73,196,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSubmitting}
          onClick={() =>
            onCreateSite({
              templateId: selectedTemplateId,
              selectedPages,
              footerTemplate: selectedFooterTemplate,
            })
          }
          type="button"
        >
          {isSubmitting ? "正在生成站点..." : "生成站点并进入首页编辑"}
        </button>
      </div>
    </section>
  );
}
