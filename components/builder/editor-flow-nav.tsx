"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
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
  const edgeMargin = 12;
  const storageKey = "pageforge.editor-flow-nav-position";
  const [expanded, setExpanded] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const dragHandleRef = useRef<HTMLButtonElement | null>(null);
  const dragSessionRef = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

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

  const clampPosition = (input: { x: number; y: number }) => {
    if (typeof window === "undefined") {
      return input;
    }

    const rect = navRef.current?.getBoundingClientRect();
    const panelWidth = rect?.width ?? (expanded ? 208 : 48);
    const panelHeight = rect?.height ?? 240;
    const maxX = Math.max(edgeMargin, window.innerWidth - panelWidth - edgeMargin);
    const maxY = Math.max(edgeMargin, window.innerHeight - panelHeight - edgeMargin);

    return {
      x: Math.min(maxX, Math.max(edgeMargin, input.x)),
      y: Math.min(maxY, Math.max(edgeMargin, input.y)),
    };
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const rect = navRef.current?.getBoundingClientRect();
      const panelHeight = rect?.height ?? 240;
      const fallback = clampPosition({
        x: edgeMargin,
        y: (window.innerHeight - panelHeight) / 2,
      });

      try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) {
          setPosition(fallback);
          return;
        }
        const parsed = JSON.parse(raw) as { x?: number; y?: number };
        if (typeof parsed.x !== "number" || typeof parsed.y !== "number") {
          setPosition(fallback);
          return;
        }
        setPosition(clampPosition({ x: parsed.x, y: parsed.y }));
      } catch {
        setPosition(fallback);
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!position) {
      return;
    }

    const handleResize = () => {
      setPosition((current) => (current ? clampPosition(current) : current));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, expanded]);

  useEffect(() => {
    if (!dragging) {
      return;
    }

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const session = dragSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) {
        return;
      }

      const next = clampPosition({
        x: event.clientX - session.offsetX,
        y: event.clientY - session.offsetY,
      });
      setPosition(next);
    };

    const handlePointerUp = (event: globalThis.PointerEvent) => {
      const session = dragSessionRef.current;
      dragSessionRef.current = null;
      setDragging(false);

      if (!session || event.pointerId !== session.pointerId) {
        return;
      }

      const handle = dragHandleRef.current;
      if (handle?.hasPointerCapture(session.pointerId)) {
        handle.releasePointerCapture(session.pointerId);
      }

      const panelRect = navRef.current?.getBoundingClientRect();
      const currentPosition = {
        x: panelRect?.left ?? position?.x ?? edgeMargin,
        y: panelRect?.top ?? position?.y ?? edgeMargin,
      };
      const clamped = clampPosition(currentPosition);
      const snappedRect = navRef.current?.getBoundingClientRect();
      const panelWidth = snappedRect?.width ?? (expanded ? 208 : 48);
      const rightEdgeX = Math.max(edgeMargin, window.innerWidth - panelWidth - edgeMargin);
      const snapX =
        Math.abs(clamped.x - edgeMargin) <= Math.abs(clamped.x - rightEdgeX)
          ? edgeMargin
          : rightEdgeX;
      const snapped = {
        x: snapX,
        y: clamped.y,
      };

      setPosition(snapped);

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(snapped));
      } catch {
        // noop
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, expanded, position]);

  const handleDragPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) {
      return;
    }

    const rect = navRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    dragSessionRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    setDragging(true);
    dragHandleRef.current = event.currentTarget;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  return (
    <aside
      ref={navRef}
      className={cn(
        "fixed z-40 hidden flex-col rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_90%,white)] shadow-lg backdrop-blur md:flex",
        expanded ? "w-52 p-2.5" : "w-12 p-1.5",
        dragging ? "cursor-grabbing" : "",
      )}
      style={{
        left: position?.x ?? edgeMargin,
        top: position?.y ?? edgeMargin,
      }}
    >
      <button
        aria-label={expanded ? "收起流程导航" : "展开流程导航"}
        className="inline-flex h-8 w-full items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-xs font-medium text-[var(--foreground)] transition hover:bg-[var(--muted)]"
        onClick={() => setExpanded((current) => !current)}
        type="button"
      >
        {expanded ? "收起" : "展"}
      </button>
      <button
        aria-label="拖拽流程导航"
        className="mt-1 inline-flex h-7 w-full items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[11px] font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--muted)]"
        onPointerDown={handleDragPointerDown}
        type="button"
      >
        {expanded ? "拖拽" : "拖"}
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
