import { z } from "zod";
import { LocationMapBlock } from "@/components/blocks/location-map-block";
import type { BuilderBlockDefinition } from "@/lib/builder/types";

export const locationMapProviderSchema = z.enum(["amap", "baidu"]);
export const locationMapLayoutSchema = z.enum(["split", "map-only"]);

export const locationMapPropsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  provider: locationMapProviderSchema.default("amap"),
  layout: locationMapLayoutSchema.default("split"),
  companyName: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().default("400-800-1234"),
  email: z.string().default("hello@example.com"),
  mapEmbedSrc: z.string().default(""),
  heightDesktop: z.number().int().min(320).max(880).default(460),
  heightMobile: z.number().int().min(220).max(680).default(320),
});

export const locationMapSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("location-map"),
  props: locationMapPropsSchema,
});

export type LocationMapProps = z.infer<typeof locationMapPropsSchema>;
export type LocationMapSection = z.infer<typeof locationMapSectionSchema>;
export type LocationMapProvider = z.infer<typeof locationMapProviderSchema>;
export type LocationMapLayout = z.infer<typeof locationMapLayoutSchema>;

export const locationMapDefaultProps: LocationMapProps = {
  title: "地图导航",
  description: "支持高德与百度地图，方便客户快速定位地址并发起咨询。",
  provider: "amap",
  layout: "split",
  companyName: "PageForge 科技有限公司",
  address: "上海市浦东新区星海路 16 号",
  phone: "400-800-1234",
  email: "hello@example.com",
  mapEmbedSrc: "",
  heightDesktop: 460,
  heightMobile: 320,
};

export const locationMapBlockDefinition: BuilderBlockDefinition<
  "location-map",
  typeof locationMapPropsSchema
> = {
  type: "location-map",
  label: "地图组件",
  description: "支持高德/百度切换，可选地图+公司信息双栏或纯地图模式。",
  component: LocationMapBlock,
  defaultProps: locationMapDefaultProps,
  schema: locationMapPropsSchema,
};
