# Temperature Studio - 溫度工作室

基於 Next.js 16 App Router 打造的現代化溫度轉換與環境監測平台。結合六種溫標即時運算、全球天氣資料視覺化與 PWA 離線支援，提供專業且直覺的操作體驗。

線上 Demo：[點這裡](https://next-js-temperature-convert.vercel.app/)

---

## ✨ 核心功能

### 🌡️ 智慧溫度轉換

- **多尺度支援**：即時轉換攝氏 (°C)、華氏 (°F)、絕對溫標 (K)、蘭氏 (°R)、列氏 (°Re) 與牛頓氏 (°N)。
- **雙向互動**：支援滑桿拖曳與精準數值輸入，即時連動所有單位。
- **情境洞察**：自動計算冰點/沸點距離，並提供「人體感受」與「安全警示」等情境化建議。

### 🌍 全球環境儀表板

- **即時天氣**：整合 Open-Meteo API，顯示所在地或指定城市的溫度、濕度、風速與降雨機率。
- **空氣品質**：即時 AQI、PM2.5 與 PM10 監測數據。
- **趨勢圖表**：內建 7 日溫度變化折線圖 (Recharts)，視覺化掌握天氣脈動。
- **多城市切換**：內建全球主要城市預設值，並支援地理定位 (Geolocation) 自動偵測。

### 🛠️ 實用工具

- **轉換紀錄**：自動保存最近 8 筆轉換結果，支援一鍵回填。
- **分享與匯出**：支援 Web Share API 分享，或將紀錄匯出為 CSV / JSON 報表。
- **快捷鍵支援**：提供鍵盤快捷鍵 (如 Alt+R 重設、Alt+H 清除紀錄) 提升操作效率。

### 🎨 極致體驗

- **全站主題**：支援深色 (Dark) / 淺色 (Light) 模式切換，並自動記憶使用者偏好 (LocalStorage)。
- **PWA 支援**：符合 Progressive Web App 標準，可安裝至桌面或手機，並支援離線瀏覽。
- **正體中文**：全站介面與程式碼註解皆採用正體中文，友善在地開發者。

---

## 🏗️ 技術棧

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript 6
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first configuration)
- **Visualization**: Recharts
- **PWA**: 原生支援 (Web App Manifest + Metadata)
- **Data Source**: Open-Meteo API, World Time API

---

## 📂 專案結構

```
app/
├── components/          # UI 元件 (原子化設計)
│   ├── ExportButton.tsx    # 匯出功能 (CSV/JSON)
│   ├── HeroSection.tsx
│   ├── HistorySection.tsx
│   ├── InsightsSection.tsx
│   ├── KeyboardShortcutsHelp.tsx
│   ├── ShareButton.tsx     # Web Share API
│   ├── TemperatureInputCard.tsx
│   ├── ThemeProvider.tsx   # 全域主題 Context
│   ├── ThemeToggleButton.tsx
│   └── WeatherChart.tsx    # 天氣趨勢圖表
├── hooks/               # 自定義 Hooks (邏輯與 UI 分離)
│   ├── useHistoryStore.ts
│   ├── useKeyboardShortcuts.ts
│   ├── useTemperatureConversion.ts
│   └── useWeatherDashboard.ts
├── lib/                 # 工具函式與常數
│   ├── format.ts        # 格式化工具
│   ├── history.ts       # 歷史紀錄與儲存鍵值
│   ├── temperature.ts   # 溫度換算邏輯
│   ├── utils.ts         # 通用工具函式 (cn)
│   └── weather.ts       # 天氣代碼對照
├── weather/             # 全球環境儀表板路由
│   └── page.tsx
├── types/               # TypeScript 型別定義
├── globals.css          # Tailwind v4 全域樣式 (@theme)
├── layout.tsx           # 應用程式佈局 (含 ThemeProvider)
├── page.tsx             # 首頁
├── robots.ts            # SEO 爬蟲規則
└── sitemap.ts           # SEO 網站地圖
```

---

## 🚀 快速開始

### 環境需求

- Node.js 18.18+
- npm 9+

### 安裝與執行

1.  **複製專案**

    ```bash
    git clone https://github.com/happyloa/Next.js-Temperature-Converter.git
    cd Next.js-Temperature-Converter
    ```

2.  **安裝依賴**

    ```bash
    npm install
    ```

3.  **啟動開發伺服器**
    ```bash
    npm run dev
    ```
    開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)。

### 建構正式版

```bash
npm run build
npm start
```

---

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request。本專案以 Clean Code 為目標，請確保提交的程式碼包含完整的正體中文註解。
