"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type BrandThemePreset = "blue" | "violet" | "emerald" | "rose";
export type BrandTheme = BrandThemePreset | "custom";

const storageKey = "pageforge.brand-theme";
const defaultThemeState = {
  brand: "blue" as BrandTheme,
  customColor: "#2563eb",
};

const availableThemes: ReadonlyArray<BrandThemePreset> = [
  "blue",
  "violet",
  "emerald",
  "rose",
];

const customVariableKeys = [
  "--primary",
  "--primary-foreground",
  "--primary-strong",
  "--primary-soft",
  "--secondary",
  "--secondary-foreground",
  "--ring",
  "--page-glow",
  "--bg-gradient-start",
  "--bg-gradient-end",
] as const;

type BrandThemeContextValue = {
  brand: BrandTheme;
  customColor: string;
  setBrand: (next: BrandTheme) => void;
  setCustomColor: (nextColor: string) => void;
  themes: ReadonlyArray<BrandThemePreset>;
};

const BrandThemeContext = createContext<BrandThemeContextValue | null>(null);

type RGBColor = {
  r: number;
  g: number;
  b: number;
};

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function normalizeHexColor(value: string | null | undefined): string {
  if (!value) {
    return defaultThemeState.customColor;
  }

  const normalized = value.trim().toLowerCase();
  const fullHexMatch = /^#([0-9a-f]{6})$/i.exec(normalized);
  const shortHexMatch = /^#([0-9a-f]{3})$/i.exec(normalized);

  if (fullHexMatch) {
    return `#${fullHexMatch[1].toLowerCase()}`;
  }

  if (!shortHexMatch) {
    return defaultThemeState.customColor;
  }

  const [r, g, b] = shortHexMatch[1].split("");
  return `#${r}${r}${g}${g}${b}${b}`;
}

function hexToRgb(hexColor: string): RGBColor {
  const hex = normalizeHexColor(hexColor).slice(1);

  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function rgbToHex(color: RGBColor): string {
  return `#${[color.r, color.g, color.b]
    .map((value) => clampChannel(value).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixWithWhite(color: RGBColor, ratio: number): RGBColor {
  return {
    r: clampChannel(color.r + (255 - color.r) * ratio),
    g: clampChannel(color.g + (255 - color.g) * ratio),
    b: clampChannel(color.b + (255 - color.b) * ratio),
  };
}

function mixWithBlack(color: RGBColor, ratio: number): RGBColor {
  const factor = 1 - ratio;
  return {
    r: clampChannel(color.r * factor),
    g: clampChannel(color.g * factor),
    b: clampChannel(color.b * factor),
  };
}

function getLuminance(color: RGBColor): number {
  return (0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b) / 255;
}

function buildCustomThemeTokens(customColor: string) {
  const base = hexToRgb(customColor);
  const primaryForeground = getLuminance(base) > 0.62 ? "#0f172a" : "#f8fafc";

  return {
    "--primary": rgbToHex(base),
    "--primary-foreground": primaryForeground,
    "--primary-strong": rgbToHex(mixWithBlack(base, 0.16)),
    "--primary-soft": rgbToHex(mixWithWhite(base, 0.84)),
    "--secondary": rgbToHex(mixWithWhite(base, 0.91)),
    "--secondary-foreground": rgbToHex(mixWithBlack(base, 0.58)),
    "--ring": rgbToHex(mixWithWhite(base, 0.5)),
    "--page-glow": `rgba(${base.r}, ${base.g}, ${base.b}, 0.14)`,
    "--bg-gradient-start": rgbToHex(mixWithWhite(base, 0.97)),
    "--bg-gradient-end": rgbToHex(mixWithWhite(base, 0.92)),
  };
}

function clearCustomThemeTokens() {
  for (const key of customVariableKeys) {
    document.documentElement.style.removeProperty(key);
  }
}

function applyThemeToDocument(brand: BrandTheme, customColor: string) {
  document.documentElement.setAttribute("data-brand", brand);

  if (brand !== "custom") {
    clearCustomThemeTokens();
    return;
  }

  const tokens = buildCustomThemeTokens(customColor);
  Object.entries(tokens).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}

function normalizeBrand(value: string | null): BrandTheme {
  if (!value) {
    return defaultThemeState.brand;
  }

  if (value === "custom") {
    return "custom";
  }

  return availableThemes.includes(value as BrandThemePreset)
    ? (value as BrandThemePreset)
    : defaultThemeState.brand;
}

function readInitialThemeState() {
  if (typeof window === "undefined") {
    return defaultThemeState;
  }

  const raw = window.localStorage.getItem(storageKey);

  if (!raw) {
    return defaultThemeState;
  }

  try {
    const parsed = JSON.parse(raw) as { brand?: string; customColor?: string };

    if (parsed && typeof parsed === "object" && parsed.brand) {
      return {
        brand: normalizeBrand(parsed.brand),
        customColor: normalizeHexColor(parsed.customColor),
      };
    }
  } catch {
    return {
      brand: normalizeBrand(raw),
      customColor: defaultThemeState.customColor,
    };
  }

  return defaultThemeState;
}

export function BrandThemeProvider({ children }: { children: ReactNode }) {
  const [brand, setBrandState] = useState<BrandTheme>(defaultThemeState.brand);
  const [customColor, setCustomColorState] = useState<string>(defaultThemeState.customColor);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    const initialThemeState = readInitialThemeState();
    queueMicrotask(() => {
      hasHydratedRef.current = true;
      setBrandState(initialThemeState.brand);
      setCustomColorState(initialThemeState.customColor);
    });
  }, []);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      return;
    }

    const normalizedCustom = normalizeHexColor(customColor);
    applyThemeToDocument(brand, normalizedCustom);

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        brand,
        customColor: normalizedCustom,
      }),
    );
  }, [brand, customColor]);

  const setBrand = useCallback((next: BrandTheme) => {
    setBrandState(next);
  }, []);

  const setCustomColor = useCallback((nextColor: string) => {
    setCustomColorState(normalizeHexColor(nextColor));
    setBrandState("custom");
  }, []);

  const value = useMemo(
    () => ({
      brand,
      customColor,
      setBrand,
      setCustomColor,
      themes: availableThemes,
    }),
    [brand, customColor, setBrand, setCustomColor],
  );

  return <BrandThemeContext.Provider value={value}>{children}</BrandThemeContext.Provider>;
}

export function useBrandTheme() {
  const context = useContext(BrandThemeContext);

  if (!context) {
    throw new Error("useBrandTheme must be used within BrandThemeProvider.");
  }

  return context;
}
