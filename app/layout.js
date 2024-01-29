import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const chinese = Noto_Sans_TC({ subsets: ["latin"] });

export const metadata = {
  title: "溫度轉換小工具",
  description: "由謝宗佑製作",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body className={chinese.className}>
        <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
      </body>
    </html>
  );
}
