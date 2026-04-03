"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { BuilderSiteConfig } from "@/lib/builder/schema";

type SectionRevealProps = {
  enabled: boolean;
  preset: BuilderSiteConfig["scrollAnimationPreset"];
  durationMs: number;
  children: ReactNode;
};

function getHiddenTransform(preset: BuilderSiteConfig["scrollAnimationPreset"]) {
  switch (preset) {
    case "fade":
      return "translate3d(0, 0, 0)";
    case "zoom":
      return "translate3d(0, 10px, 0) scale(0.97)";
    case "rise":
    default:
      return "translate3d(0, 28px, 0)";
  }
}

export function SectionReveal({
  enabled,
  preset,
  durationMs,
  children,
}: SectionRevealProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(!enabled);
  const safeDuration = Math.max(300, Math.min(5000, durationMs));
  const hiddenTransform = useMemo(() => getHiddenTransform(preset), [preset]);
  const resolvedVisible = !enabled || isVisible;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const target = hostRef.current;

    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [enabled, preset]);

  return (
    <div
      ref={hostRef}
      style={{
        opacity: resolvedVisible ? 1 : 0,
        transform: resolvedVisible ? "translate3d(0,0,0) scale(1)" : hiddenTransform,
        transitionDuration: `${safeDuration}ms`,
        transitionProperty: "opacity, transform",
        transitionTimingFunction: "cubic-bezier(0.22, 0.61, 0.36, 1)",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
