import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "溫度工作室 | 多尺度智慧轉換",
  description:
    "現代化的溫度轉換工作室，支援攝氏、華氏、絕對溫標與進階單位並提供情境洞察與歷史紀錄。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "溫度工作室",
  },
  applicationName: "溫度工作室",
  keywords: ["溫度轉換", "攝氏", "華氏", "絕對溫標", "天氣", "Temperature Converter"],
  authors: [{ name: "Temperature Studio" }],
  creator: "Temperature Studio",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
