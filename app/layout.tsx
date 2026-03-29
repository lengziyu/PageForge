import type { Metadata } from "next";
import "./globals.css";
import "@wangeditor/editor/dist/css/style.css";

export const metadata: Metadata = {
  title: "PageForge MVP",
  description: "企业官网模板 + 模块化拖拽编辑器 MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
