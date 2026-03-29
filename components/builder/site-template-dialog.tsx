"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import {
  getDefaultFooterTemplateBySite,
  getDefaultSelectedPages,
  TemplateSelectionPanel,
} from "@/components/builder/template-selection-panel";
import type {
  EnterprisePageKey,
  SiteTemplateId,
} from "@/lib/builder/template-catalog";
import type { FooterTemplateId } from "@/lib/builder/site-config";

type SiteTemplateDialogProps = {
  isSubmitting: boolean;
  onReplaceSite: (input: {
    templateId: SiteTemplateId;
    selectedPages: EnterprisePageKey[];
    footerTemplate: FooterTemplateId;
  }) => void;
};

export function SiteTemplateDialog({
  isSubmitting,
  onReplaceSite,
}: SiteTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
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

  const handleConfirmReplace = () => {
    setConfirmOpen(false);
    setOpen(false);
    onReplaceSite({
      templateId: selectedTemplateId,
      selectedPages,
      footerTemplate: selectedFooterTemplate,
    });
  };

  return (
    <>
      <Dialog.Root onOpenChange={setOpen} open={open}>
        <Dialog.Trigger asChild>
          <button
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            type="button"
          >
            更换行业模板
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[min(1120px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl border border-slate-200 bg-[#f8fafc] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.24)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="text-2xl font-semibold text-slate-950">
                  更换行业模板
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm leading-7 text-slate-600">
                  重新选择行业模板、要生成的页面和公共页脚样式。确认后会覆盖当前站点页面结构和默认内容。
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                  type="button"
                >
                  关闭
                </button>
              </Dialog.Close>
            </div>

            <div className="mt-6">
              <TemplateSelectionPanel
                compact
                onFooterTemplateChange={setSelectedFooterTemplate}
                onPageToggle={handleTogglePage}
                onTemplateChange={handleTemplateChange}
                selectedFooterTemplate={selectedFooterTemplate}
                selectedPages={selectedPages}
                selectedTemplateId={selectedTemplateId}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  type="button"
                >
                  取消
                </button>
              </Dialog.Close>
              <button
                className="rounded-lg bg-[linear-gradient(135deg,#2531a5_0%,#5b4df5_50%,#6b6cff_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(62,73,196,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
                onClick={() => setConfirmOpen(true)}
                type="button"
              >
                应用并覆盖现有站点
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog.Root onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-[60] bg-slate-950/45 backdrop-blur-sm" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[70] w-[min(520px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.24)]">
            <AlertDialog.Title className="text-xl font-semibold text-slate-950">
              确认覆盖当前站点？
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-3 text-sm leading-7 text-slate-600">
              这会删除当前站点已存在的页面，并按新模板重新生成独立页面、统一导航和公共页脚。此操作不可撤销。
            </AlertDialog.Description>

            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <button
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  type="button"
                >
                  返回检查
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                  onClick={handleConfirmReplace}
                  type="button"
                >
                  确认覆盖
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
