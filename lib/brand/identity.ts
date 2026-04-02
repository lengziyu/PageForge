export const PAGEFORGE_NAME_CANDIDATES = [
  "页铸建站",
  "铸页官网",
  "企页工坊",
  "站点铸造台",
  "官网引擎",
] as const;

export const PAGEFORGE_DEFAULT_CN_NAME = PAGEFORGE_NAME_CANDIDATES[0];
export const PAGEFORGE_DEFAULT_SITE_NAME = `${PAGEFORGE_DEFAULT_CN_NAME} · PageForge`;
export const PAGEFORGE_DEFAULT_LOGO_SRC = "/brand/pageforge-logo.svg";
export const PAGEFORGE_OWNER_COMPANY_NAME = "冷子雨科技有限公司";

function normalizeText(value?: string | null) {
  return value?.trim() ?? "";
}

export function resolveSiteName(value?: string | null) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return PAGEFORGE_DEFAULT_SITE_NAME;
  }

  if (normalized === "山合咨询") {
    return PAGEFORGE_OWNER_COMPANY_NAME;
  }

  return normalized;
}

export function resolveSiteLogoSrc(value?: string | null) {
  return normalizeText(value) || PAGEFORGE_DEFAULT_LOGO_SRC;
}

export function resolveSiteFaviconSrc(input: {
  faviconSrc?: string | null;
  logoSrc?: string | null;
}) {
  return (
    normalizeText(input.faviconSrc) ||
    normalizeText(input.logoSrc) ||
    PAGEFORGE_DEFAULT_LOGO_SRC
  );
}
