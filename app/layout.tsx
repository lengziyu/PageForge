import type { Metadata } from "next";
import { BrandThemeProvider } from "@/components/theme/brand-theme-provider";
import {
  PAGEFORGE_DEFAULT_LOGO_SRC,
  PAGEFORGE_DEFAULT_SITE_NAME,
} from "@/lib/brand/identity";
import "./globals.css";
import "@wangeditor/editor/dist/css/style.css";

export const metadata: Metadata = {
  title: PAGEFORGE_DEFAULT_SITE_NAME,
  description: "企业官网模板与模块化拖拽编辑器",
  icons: {
    icon: PAGEFORGE_DEFAULT_LOGO_SRC,
    shortcut: PAGEFORGE_DEFAULT_LOGO_SRC,
    apple: PAGEFORGE_DEFAULT_LOGO_SRC,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-brand="blue" lang="zh-CN" suppressHydrationWarning>
      <body>
        <BrandThemeProvider>{children}</BrandThemeProvider>
      </body>
    </html>
  );
}
