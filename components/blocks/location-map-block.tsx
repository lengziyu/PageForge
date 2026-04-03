import type {
  LocationMapProps,
  LocationMapProvider,
} from "@/lib/builder/blocks/location-map";
import type { BuilderBlockComponentProps } from "@/lib/builder/types";

function buildProviderMapUrl(provider: LocationMapProvider, query: string) {
  const encoded = encodeURIComponent(query.trim());

  if (provider === "baidu") {
    return `https://map.baidu.com/search/${encoded}`;
  }

  return `https://uri.amap.com/search?keyword=${encoded}&src=PageForge&coordinate=gaode&callnative=0`;
}

function resolveProviderLabel(provider: LocationMapProvider) {
  return provider === "baidu" ? "百度地图" : "高德地图";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function LocationMapBlock({
  props,
  isEditor = false,
}: BuilderBlockComponentProps<LocationMapProps>) {
  const mapQuery = [props.companyName, props.address].filter(Boolean).join(" ");
  const defaultMapUrl = buildProviderMapUrl(props.provider, mapQuery);
  const mapUrl = props.mapEmbedSrc.trim() || defaultMapUrl;
  const providerLabel = resolveProviderLabel(props.provider);
  const showInfoCard = props.layout === "split";
  const rootStyle = {
    "--map-mobile-height": `${clamp(props.heightMobile, 220, 680)}px`,
    "--map-desktop-height": `${clamp(props.heightDesktop, 320, 880)}px`,
  } as React.CSSProperties;

  return (
    <section className="px-6 py-10 md:px-10 md:py-14" style={rootStyle}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--primary-strong)]">
            {providerLabel}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">
            {props.title}
          </h2>
          <p className="max-w-3xl text-base leading-8 text-[var(--muted-foreground)]">
            {props.description}
          </p>
        </div>

        <div
          className={`overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[0_18px_38px_rgba(15,23,42,0.08)] ${
            showInfoCard ? "grid gap-0 lg:grid-cols-[1.45fr_1fr]" : ""
          }`}
        >
          <div className="relative min-h-[var(--map-mobile-height)] md:min-h-[var(--map-desktop-height)]">
            <iframe
              className={`h-full w-full border-0 ${isEditor ? "pointer-events-none" : ""}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapUrl}
              title={`${props.companyName} 地图`}
            />
            {isEditor ? (
              <div className="absolute left-3 top-3 rounded-md bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700">
                地图预览
              </div>
            ) : null}
          </div>

          {showInfoCard ? (
            <div
              className="flex flex-col justify-between gap-5 p-6"
              style={{
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--primary) 8%, white) 0%, white 100%)",
              }}
            >
              <div className="space-y-4 text-[var(--foreground)]">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--primary-strong)]">
                    公司信息
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                    {props.companyName}
                  </h3>
                </div>
                <dl className="space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  <div>
                    <dt className="font-medium text-[var(--foreground)]">公司地址</dt>
                    <dd>{props.address}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-[var(--foreground)]">联系电话</dt>
                    <dd>{props.phone}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-[var(--foreground)]">联系邮箱</dt>
                    <dd>{props.email}</dd>
                  </div>
                </dl>
              </div>

              <a
                className="inline-flex w-fit items-center rounded-lg border border-[color-mix(in_srgb,var(--primary)_32%,white)] bg-[color-mix(in_srgb,var(--primary)_12%,white)] px-4 py-2 text-sm font-medium text-[var(--primary-strong)] transition hover:bg-[color-mix(in_srgb,var(--primary)_18%,white)]"
                href={defaultMapUrl}
                rel="noreferrer"
                target="_blank"
              >
                打开{providerLabel}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
