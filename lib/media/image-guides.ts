export const imageSizeGuideMap = {
  siteLogo: "建议尺寸：256 × 256，PNG/SVG 优先，文件不超过 500KB。",
  siteFavicon: "建议尺寸：64 × 64 或 128 × 128，PNG/ICO，文件不超过 200KB。",
  heroBanner: "建议尺寸：1920 × 900（约 16:7），JPG/PNG/WebP，单张不超过 1.5MB。",
  newsCover: "建议尺寸：1200 × 675（16:9），JPG/PNG/WebP，文件不超过 1MB。",
  productCover: "建议尺寸：1200 × 900（4:3），JPG/PNG/WebP，文件不超过 1MB。",
  productGallery: "建议尺寸：1200 × 900（4:3），多图统一比例，单张不超过 1MB。",
} as const;

export type ImageSizeGuideKey = keyof typeof imageSizeGuideMap;

export function getImageSizeGuideText(key: ImageSizeGuideKey) {
  return imageSizeGuideMap[key];
}
