import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const chinese = Noto_Sans_TC({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "溫度實驗室 | 多尺度智慧轉換",
  description:
    "現代化的溫度轉換實驗室，支援攝氏、華氏、絕對溫標與進階單位並提供情境洞察與歷史紀錄。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body className={chinese.className}>{children}</body>
    </html>
  );
}
