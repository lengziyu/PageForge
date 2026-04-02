"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type EditorFlowStep = "editor" | "page-editor" | "content";

type EditorFlowNavProps = {
  activeStep: EditorFlowStep;
  pageSlug?: string;
  editorHref?: string;
};

export function EditorFlowNav({
  activeStep,
  pageSlug = "homepage",
  editorHref = "/editor",
}: EditorFlowNavProps) {
  const [expanded, setExpanded] = useState(true);

  const steps = useMemo(
    () => [
      {
        key: "editor" as const,
        label: "页面中心",
        description: "建站流程入口",
        href: editorHref,
      },
      {
        key: "page-editor" as const,
        label: "页面编辑",
        description: "模块与布局",
        href: `/editor/pages/${pageSlug}`,
      },
      {
        key: "content" as const,
        label: "内容管理",
        description: "产品与资讯维护",
        href: "/editor/content",
      },
    ],
    [editorHref, pageSlug],
  );

  return (
    <aside
      className={cn(
        "fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_90%,white)] shadow-lg backdrop-blur md:flex",
        expanded ? "w-52 p-2.5" : "w-12 p-1.5",
      )}
    >
      <button
        aria-label={expanded ? "收起流程导航" : "展开流程导航"}
        className="inline-flex h-8 w-full items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-xs font-medium text-[var(--foreground)] transition hover:bg-[var(--muted)]"
        onClick={() => setExpanded((current) => !current)}
        type="button"
      >
        {expanded ? "收起" : "展"}
      </button>

      <div className="mt-2 space-y-1.5">
        {steps.map((step, index) => {
          const isActive = activeStep === step.key;

          return (
            <Link
              className={cn(
                "group flex w-full items-center rounded-md transition",
                expanded ? "gap-2 px-2 py-2" : "justify-center px-0 py-2",
                isActive
                  ? "bg-[var(--primary-soft)] text-[var(--primary-strong)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
              )}
              href={step.href}
              key={step.key}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  isActive
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]",
                )}
              >
                {index + 1}
              </span>

              {expanded ? (
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold">{step.label}</span>
                  <span className="block truncate text-[11px] opacity-80">{step.description}</span>
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
