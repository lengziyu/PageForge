/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import type { BannerCarouselProps } from "@/lib/builder/blocks/banner-carousel";
import type { BuilderBlockComponentProps } from "@/lib/builder/types";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function BannerCarouselBlock({
  props,
  isEditor = false,
}: BuilderBlockComponentProps<BannerCarouselProps>) {
  const slides = useMemo(
    () => (props.slides.length > 0 ? props.slides.slice(0, 10) : ["/banners/banner1.jpg"]),
    [props.slides],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const currentIndex = Math.min(activeIndex, slides.length - 1);
  const safeIntervalMs = clamp(props.intervalMs, 1500, 12000);

  useEffect(() => {
    if (!props.autoPlay || slides.length <= 1 || isEditor) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, safeIntervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [props.autoPlay, safeIntervalMs, slides.length, isEditor]);

  return (
    <section className="w-full">
      <div className="relative w-full overflow-hidden bg-slate-100">
        <div className="relative h-[clamp(260px,50vw,620px)] w-full">
          {slides.map((source, index) => {
            const isActive = index === currentIndex;

            return (
              <div
                className={`absolute inset-0 transition-opacity duration-500 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                key={`${source}-${index}`}
              >
                <img
                  alt={`banner-${index + 1}`}
                  className="h-full w-full object-cover"
                  src={source}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.28)_100%)]" />
              </div>
            );
          })}

          {isEditor ? (
            <div className="absolute left-4 top-4 rounded-md bg-white/90 px-3 py-1 text-xs font-medium text-slate-700">
              Banner 轮播（{slides.length} 张）
            </div>
          ) : null}

          {props.showArrows && slides.length > 1 ? (
            <>
              <button
                aria-label="上一张"
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/80 text-slate-700 backdrop-blur transition hover:bg-white"
                onClick={() =>
                  setActiveIndex((current) => (current - 1 + slides.length) % slides.length)
                }
                type="button"
              >
                ‹
              </button>
              <button
                aria-label="下一张"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/80 text-slate-700 backdrop-blur transition hover:bg-white"
                onClick={() => setActiveIndex((current) => (current + 1) % slides.length)}
                type="button"
              >
                ›
              </button>
            </>
          ) : null}

          {props.showDots && slides.length > 1 ? (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur">
              {slides.map((source, index) => {
                const isActive = index === currentIndex;

                return (
                  <button
                    aria-label={`切换到第 ${index + 1} 张`}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      isActive ? "bg-white" : "bg-white/45 hover:bg-white/70"
                    }`}
                    key={`${source}-dot-${index}`}
                    onClick={() => setActiveIndex(index)}
                    type="button"
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
