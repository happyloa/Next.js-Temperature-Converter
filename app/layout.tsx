import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://temperature-studio.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "溫度工作室 | 多尺度智慧轉換",
    template: "%s | 溫度工作室",
  },
  description:
    "現代化的溫度轉換工作室，支援攝氏、華氏、絕對溫標與進階單位並提供情境洞察與歷史紀錄。即時天氣資訊與 7 日預報，讓溫度轉換更具情境背景。",
  manifest: "/manifest.json",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: siteUrl,
    siteName: "溫度工作室",
    title: "溫度工作室 | 多尺度智慧轉換",
    description:
      "支援六種溫標即時轉換、全球天氣資訊、7 日趨勢圖表與環境儀表板。PWA 離線可用，語音輸入，快捷鍵操作。",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "溫度工作室 - Temperature Studio",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "溫度工作室 | 多尺度智慧轉換",
    description:
      "六種溫標即時轉換、全球天氣資訊與環境儀表板。PWA 離線可用、語音輸入。",
    images: [`${siteUrl}/og-image.png`],
    creator: "@TemperatureStudio",
  },

  // Apple Web App
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "溫度工作室",
  },

  // Basic SEO
  applicationName: "溫度工作室",
  authors: [{ name: "Temperature Studio" }],
  creator: "Temperature Studio",
  publisher: "Temperature Studio",

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification (for search console)
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },

  // Other
  formatDetection: {
    telephone: false,
  },
  category: "utilities",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="canonical" href={siteUrl} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
