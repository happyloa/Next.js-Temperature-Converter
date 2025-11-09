# Next.js 16 溫度工作室（TypeScript 版）

以 Next.js App Router 打造的互動式「溫度工作室」，提供六種溫標的即時轉換、快速情境洞察與轉換紀錄，並整合全球天氣、空氣品質與時區資訊。程式碼全面升級為 TypeScript，搭配 Tailwind CSS 打造玻璃擬態的儀表板體驗，無論桌面或行動裝置都能維持舒適的閱讀與操作流程。

線上 Demo：[點這裡](https://next-js-temperature-convert.vercel.app/)

---

## 功能亮點
- **六種溫標一次掌握**：支援攝氏、華氏、絕對溫標、蘭氏、列氏與牛頓氏，輸入任一溫度即可同步換算所有單位。
- **雙模式輸入體驗**：自由切換滑桿與文字輸入，並提供自動格式化與字級縮放，避免極端數值破壞版面。
- **情境化洞察**：依據攝氏值動態提供安全提醒、冰點/沸點距離與情境描述，快速判斷環境風險。
- **常用情境預設**：內建多種生活與科學溫度範例，一鍵帶入計算。
- **轉換歷史與複製**：保留最近的換算結果，支援快速複製或清除，以利對照記錄。
- **全球環境儀表板**：串接 Open-Meteo 與 World Time API，顯示所在城市的溫度極值、氣象指標與空氣品質。

## 技術棧
- [Next.js 16 App Router](https://nextjs.org/docs/app)（React 19）
- TypeScript（嚴格型別設定）
- [Tailwind CSS](https://tailwindcss.com/)
- 原生 fetch API 串接外部資料源

## 專案結構重點
```
app/
├─ layout.tsx          # 全域佈局與字體設定
├─ page.tsx            # 溫度工作室主頁與互動邏輯（TypeScript）
├─ globals.css         # 全域背景、排版與實用工具類
└─ components/
   ├─ FactsSection.tsx
   ├─ HeroSection.tsx
   ├─ HistorySection.tsx
   ├─ InsightsSection.tsx
   ├─ TemperatureInputCard.tsx
   └─ WeatherSection.tsx
```

## 開發環境需求
- Node.js 18.18+ 或 20+（符合 Next.js 16 要求）
- npm 9 以上版本（或使用相容的套件管理工具）

## 快速開始
```bash
# 安裝依賴
npm install

# 啟動開發伺服器（預設 http://localhost:3000）
npm run dev
```

### 其他常用指令
```bash
npm run build   # 建構正式版產出
npm run start   # 以正式模式啟動（需先 build）
npm run lint    # 執行 Next.js 內建 ESLint 與 TypeScript 檢查
```

## 部署建議
- 本專案採用 Next.js 16 App Router，支援 Vercel、Netlify、Node.js 伺服器與 Docker 等常見部署模式。
- 若使用 Vercel，只需匯入專案並沿用預設 `npm run build` / `npm run start` 指令即可部署。
- 若部署於其他平台，請確認環境具備 Node.js 18.18+，並允許呼叫 Open-Meteo 與 World Time API。

## TypeScript 筆記
- 專案使用 `tsconfig.json` 啟用嚴格型別，並提供 `@/*` 的路徑別名。
- 共用型別定義主要放在元件檔案內，並透過 `import type` 供頁面與其他元件重用。
- 建議在開發時搭配 IDE 的 TypeScript 支援與 `npm run lint`，確保型別與語法一致性。

## 貢獻與回饋
歡迎提出 Issue 或 Pull Request，若在安裝或部署過程遇到問題，也可以開啟討論讓我們一起改善這份作品。
