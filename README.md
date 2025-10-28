# Next.js 15 溫度工作室

一個以 Next.js App Router 打造的互動式「溫度工作室」，提供六種溫標的即時轉換、快速情境洞察與轉換紀錄，適合作為展示作品或科普工具。介面採用 Material UI 的玻璃擬態風格，搭配自訂主題與響應式排版，在桌面與行動裝置上都能維持舒適的閱讀與操作體驗。

線上 Demo：[點這裡](https://next-js-temperature-convert.vercel.app/)

---

## 功能亮點
- **六種溫標一次掌握**：支援攝氏、華氏、絕對溫標、蘭氏、列氏與牛頓氏，輸入任一溫度即可同步換算所有單位。
- **雙模式輸入體驗**：自由切換滑桿與文字輸入，並提供自動格式化與字級縮放，避免極端數值破壞版面。
- **情境化洞察**：依據攝氏值動態提供安全提醒、冰點/沸點距離與情境描述，快速判斷環境風險。
- **常用情境預設**：內建多種生活與科學溫度範例，一鍵帶入計算。
- **轉換歷史與複製**：保留最近的換算結果，支援快速複製或清除，以利對照記錄。
- **響應式玻璃擬態介面**：以 MUI 自訂主題、分段卡片與彈性間距調整，確保大螢幕與行動端都有一致的視覺體驗。

## 技術棧
- [Next.js 15 App Router](https://nextjs.org/docs/app)（React 19）
- [Tailwind CSS](https://tailwindcss.com/)

## 專案結構重點
```
app/
├─ layout.js            # App Router 佈局與 ThemeRegistry 封裝
├─ page.js              # 溫度工作室主頁與所有互動邏輯
├─ page.module.css      # 首頁專用的樣式與響應式間距
├─ components/
│  └─ ThemeRegistry.jsx # MUI 與 Emotion 的客製化主題注入
├─ theme.js             # 自訂 Material UI 主題設定
└─ globals.css          # 全域背景、排版與實用工具類
```

## 快速開始
### 環境需求
- Node.js 18 或以上版本
- npm 9 或以上版本（或使用相容的套件管理工具）

### 安裝與啟動
```bash
# 安裝依賴
npm install

# 啟動開發伺服器（預設 http://localhost:3000）
npm run dev
```

### 其他指令
```bash
npm run build   # 建構正式版產出
npm run start   # 以正式模式啟動（需先 build）
npm run lint    # 觸發 Next.js 的 ESLint（首次執行會詢問是否建立設定檔）
```

## 部署建議
- 本專案採用 Next.js 15 App Router，支援 Vercel、Netlify、Node.js 伺服器與 Docker 等常見部署模式。
- 若使用 Vercel，只需將此專案匯入並以預設 `npm run build` 與 `npm run start` 指令部署即可。

## 貢獻與回饋
歡迎提出 Issue 或 Pull Request，若在安裝或部署過程遇到問題，也可以開啟討論讓我們一起改善這份作品。
