"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useBrandTheme,
  type BrandThemePreset,
} from "@/components/theme/brand-theme-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const presetThemeMeta: Record<
  BrandThemePreset,
  { label: string; color: string; description: string }
> = {
  blue: {
    label: "蓝色",
    color: "#2563eb",
    description: "稳重专业，企业官网默认风格",
  },
  violet: {
    label: "紫色",
    color: "#7c3aed",
    description: "更有科技感，适合强调品牌与产品调性",
  },
  emerald: {
    label: "翡翠绿",
    color: "#059669",
    description: "科技感+生态感，适合解决方案展示",
  },
  rose: {
    label: "玫瑰红",
    color: "#e11d48",
    description: "更有辨识度，适合传播导向型内容",
  },
};

type BrandThemeSwitcherProps = {
  tone?: "light" | "dark";
  className?: string;
};

export function BrandThemeSwitcher({
  tone = "light",
  className,
}: BrandThemeSwitcherProps) {
  const { brand, customColor, setBrand, setCustomColor, themes } = useBrandTheme();
  const [open, setOpen] = useState(false);
  const [hexDraft, setHexDraft] = useState(customColor);
  const isDark = tone === "dark";

  useEffect(() => {
    setHexDraft(customColor);
  }, [customColor]);

  const activeColor = useMemo(() => {
    if (brand === "custom") {
      return customColor;
    }

    return presetThemeMeta[brand].color;
  }, [brand, customColor]);

  const triggerClassName = cn(
    "inline-flex h-9 w-9 items-center justify-center rounded-md border transition",
    isDark
      ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
      : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]",
  );

  const handleSelectPreset = (themeKey: BrandThemePreset) => {
    setBrand(themeKey);
    setOpen(false);
  };

  const handleApplyCustomColor = (value: string) => {
    setCustomColor(value);
    setOpen(false);
  };

  const handleResetDefault = () => {
    setBrand("blue");
    setOpen(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <button
          aria-label="切换主题"
          className={cn(triggerClassName, className)}
          title="切换主题"
          type="button"
        >
          <span className="relative inline-flex h-4 w-4 items-center justify-center">
            <span
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: activeColor }}
            />
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[22rem] p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
            Theme
          </p>
          <h3 className="mt-1 text-sm font-semibold text-[var(--foreground)]">
            主题配色
          </h3>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            选择预设颜色，或使用自定义品牌色应用到官网与后台按钮主色。
          </p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {themes.map((themeKey) => {
            const theme = presetThemeMeta[themeKey];
            const isActive = brand === themeKey;

            return (
              <button
                className={cn(
                  "rounded-md border px-2.5 py-2 text-left transition",
                  isActive
                    ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                    : "border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]",
                )}
                key={themeKey}
                onClick={() => handleSelectPreset(themeKey)}
                type="button"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full border border-black/10"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className="text-xs font-semibold text-[var(--foreground)]">
                    {theme.label}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-5 text-[var(--muted-foreground)]">
                  {theme.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-3 rounded-md border border-[var(--border)] bg-[var(--muted)] p-2.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-[var(--foreground)]">自定义颜色</p>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                支持选色器或手动输入十六进制色值。
              </p>
            </div>
            {brand === "custom" ? (
              <span className="rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--primary-strong)]">
                当前
              </span>
            ) : null}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <input
              aria-label="选择主题颜色"
              className="h-9 w-11 rounded-md border border-[var(--border)] bg-[var(--card)] p-1"
              onChange={(event) => handleApplyCustomColor(event.target.value)}
              type="color"
              value={customColor}
            />
            <input
              className="h-9 flex-1 rounded-md border border-[var(--input)] bg-[var(--card)] px-2.5 text-xs text-[var(--foreground)] outline-none transition focus:border-[var(--ring)]"
              onChange={(event) => setHexDraft(event.target.value)}
              placeholder="#2563eb"
              value={hexDraft}
            />
            <button
              className="h-9 min-w-[70px] shrink-0 whitespace-nowrap rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition hover:bg-[var(--primary-strong)]"
              onClick={() => handleApplyCustomColor(hexDraft)}
              type="button"
            >
              应用
            </button>
          </div>

          <button
            className="mt-2 text-xs text-[var(--muted-foreground)] underline-offset-2 transition hover:text-[var(--foreground)] hover:underline"
            onClick={handleResetDefault}
            type="button"
          >
            恢复默认蓝色
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
