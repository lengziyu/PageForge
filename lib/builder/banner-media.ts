export const defaultHeroBannerItems = [
  { id: "banner-1", label: "默认横幅 1", src: "/banners/banner1.jpg" },
  { id: "banner-2", label: "默认横幅 2", src: "/banners/banner2.png" },
  { id: "banner-3", label: "默认横幅 3", src: "/banners/banner3.png" },
  { id: "banner-4", label: "默认横幅 4", src: "/banners/banner4.png" },
  { id: "banner-5", label: "默认横幅 5", src: "/banners/banner5.png" },
  { id: "banner-6", label: "默认横幅 6", src: "/banners/banner6.png" },
] as const;

export const defaultHeroBannerSources = defaultHeroBannerItems.map((item) => item.src);

const defaultHeroBannerSourceSet: Set<string> = new Set(defaultHeroBannerSources);

function normalizeSource(source: string) {
  return source.trim();
}

export function isDefaultHeroBannerSource(source: string) {
  return defaultHeroBannerSourceSet.has(source);
}

export function normalizeHeroBannerSources(
  sources?: readonly string[] | null,
): string[] {
  const merged: string[] = [...defaultHeroBannerSources];

  for (const source of sources ?? []) {
    const normalized = normalizeSource(source);
    if (!normalized || merged.includes(normalized)) {
      continue;
    }
    merged.push(normalized);
  }

  return merged;
}

export function buildHeroBannerSelectOptions(
  sources?: readonly string[] | null,
) {
  const normalized = normalizeHeroBannerSources(sources);
  const defaultSourceToLabel: Map<string, string> = new Map(
    defaultHeroBannerItems.map((item) => [item.src, item.label]),
  );

  return normalized.map((source, index) => ({
    value: source,
    label: defaultSourceToLabel.get(source) ?? `自定义横幅 ${index + 1}`,
  }));
}
