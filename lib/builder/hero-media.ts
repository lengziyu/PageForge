export const heroImagePresets = [
  {
    id: "homepage-overview",
    label: "首页总览",
    src: "/hero/homepage-overview.svg",
  },
  {
    id: "services-grid",
    label: "服务矩阵",
    src: "/hero/services-grid.svg",
  },
  {
    id: "technology-platform",
    label: "技术平台",
    src: "/hero/technology-platform.svg",
  },
  {
    id: "news-media-wall",
    label: "新闻媒体墙",
    src: "/hero/news-media-wall.svg",
  },
  {
    id: "about-studio",
    label: "品牌介绍",
    src: "/hero/about-studio.svg",
  },
  {
    id: "contact-network",
    label: "商务联系",
    src: "/hero/contact-network.svg",
  },
] as const;

export function getHeroImageById(id: string) {
  return heroImagePresets.find((item) => item.id === id);
}
