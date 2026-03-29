import type { Metadata } from "next";
import "./globals.css";
import "@wangeditor/editor/dist/css/style.css";

export const metadata: Metadata = {
  title: "PageForge",
  description: "企业官网模板与模块化拖拽编辑器",
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
