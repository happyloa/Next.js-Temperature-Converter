"use client";

import type { ChangeEvent } from "react";
import { useCallback, useEffect, useState } from "react";

import { HeroSection } from "./components/HeroSection";
import { HistorySection } from "./components/HistorySection";
import { InsightsSection } from "./components/InsightsSection";
import { KeyboardShortcutsHelp } from "./components/KeyboardShortcutsHelp";
import { TemperatureInputCard } from "./components/TemperatureInputCard";
import Link from "next/link";
import { useHistoryStore } from "./hooks/useHistoryStore";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useTemperatureConversion } from "./hooks/useTemperatureConversion";
import { useTheme } from "./components/ThemeProvider";
import {
  TEMPERATURE_PRESETS,
  TEMPERATURE_SCALES,
} from "./lib/temperature";
import {
  formatTemperature,
  timeFormatter,
} from "./lib/format";
import type { TemperaturePreset, TemperatureScaleCode } from "./types/temperature";

/**
 * Next.js App Router 頁面：整合溫度轉換、歷史紀錄與環境儀表板。
 */
export default function TemperatureStudio() {
  const {
    scale,
    rawInput,
    activeScale,
    conversions,
    sliderRange,
    sliderValue,
    sliderStep,
    mood,
    insights,
    relativeSolarProgress,
    showSolarProgress,
    canAddHistory,
    handleScaleChange,
    handleRawInputChange,
    handleSliderChange: updateSliderValue,
    handleReset,
    handlePresetSelect: selectTemperaturePreset,
    createHistoryEntry,
  } = useTemperatureConversion();

  const { history, addHistoryEntry, clearHistory } = useHistoryStore();
  const { toggleTheme } = useTheme();

  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  const [copiedScale, setCopiedScale] = useState<TemperatureScaleCode | null>(null);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleRawInputChange(event.target.value);
    },
    [handleRawInputChange]
  );

  const handleSliderChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      updateSliderValue(Number(event.target.value));
    },
    [updateSliderValue]
  );

  const handlePresetClick = selectTemperaturePreset;

  const handleAddHistory = useCallback(() => {
    const entry = createHistoryEntry();
    if (!entry) return;
    addHistoryEntry(entry);
  }, [addHistoryEntry, createHistoryEntry]);

  const handleClearHistory = useCallback(() => {
    clearHistory();
  }, [clearHistory]);

  const handleCopy = useCallback(
    async (text: string, code: TemperatureScaleCode) => {
      try {
        await navigator.clipboard?.writeText(text);
        setCopiedScale(code);
        setTimeout(() => setCopiedScale(null), 1800);
      } catch (error) {
        console.error("Failed to copy", error);
      }
    },
    []
  );



  // 鍵盤快捷鍵設定
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: "r",
        alt: true,
        action: handleReset,
        description: "重設溫度輸入",
      },
      {
        key: "h",
        alt: true,
        action: clearHistory,
        description: "清除歷史紀錄",
      },
      {
        key: "t",
        alt: true,
        action: toggleTheme,
        description: "切換主題",
      },
      {
        key: "?",
        action: () => setShowShortcutsHelp((prev) => !prev),
        description: "顯示快捷鍵說明",
      },
      {
        key: "Escape",
        action: () => setShowShortcutsHelp(false),
        description: "關閉彈窗",
      },
    ],
  });



  return (
    <main className="w-full max-w-full py-12 pb-24">
      <div className="mx-auto flex w-full min-w-0 max-w-[1600px] flex-col gap-10 px-4 sm:px-6 lg:px-10">
        <HeroSection presets={TEMPERATURE_PRESETS} onPresetSelect={handlePresetClick} />

        <div className="grid min-w-0 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Main Content Area (7/12) */}
          <div className="flex min-w-0 flex-col gap-8 lg:col-span-7">
            <TemperatureInputCard
              scale={scale}
              scales={TEMPERATURE_SCALES}
              onScaleChange={handleScaleChange}
              rawInput={rawInput}
              onInputChange={handleInputChange}
              activeSymbol={activeScale?.symbol}
              onReset={handleReset}
              onAddHistory={handleAddHistory}
              canAddHistory={canAddHistory}
              sliderRange={sliderRange}
              sliderValue={sliderValue}
              sliderStep={sliderStep}
              onSliderChange={handleSliderChange}
              conversions={conversions}
              copiedScale={copiedScale}
              onCopy={handleCopy}
              mood={mood}
              relativeSolarProgress={relativeSolarProgress}
              showSolarProgress={showSolarProgress}
              formatTemperature={formatTemperature}
            />


          </div>

          {/* Sidebar Area (5/12) */}
          <aside className="flex min-w-0 flex-col gap-8 lg:col-span-5">
            <HistorySection
              history={history}
              onClearHistory={handleClearHistory}
              formatTemperature={formatTemperature}
              formatTime={(date) => timeFormatter.format(date)}
            />

            <InsightsSection insights={insights} />

            <Link href="/weather" className="group relative overflow-hidden rounded-3xl border border-slate-700/40 bg-slate-900/60 p-6 transition-all hover:bg-slate-900/80 hover:shadow-lg hover:border-[#00CECB]/30">
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-slate-200">
                  <span className="text-2xl">🌍</span>
                  <h2 className="text-lg font-semibold group-hover:text-[#00CECB] transition-colors">全球環境儀表板</h2>
                </div>
                <p className="text-sm text-slate-400">
                  查詢全球城市天氣、環境指標與空氣品質，獲得更完整的溫度情境。
                </p>
                <div className="mt-2 flex items-center text-xs font-medium text-[#00CECB]">
                  立即前往 <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
              <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-[#00CECB]/10 blur-xl transition-all group-hover:bg-[#00CECB]/20"></div>
            </Link>


          </aside>
        </div>

      </div>



      {showShortcutsHelp && (
        <KeyboardShortcutsHelp
          shortcuts={[
            { keys: "Alt+R", description: "重設溫度輸入" },
            { keys: "Alt+H", description: "清除歷史紀錄" },
            { keys: "Alt+T", description: "切換深淺色主題" },
            { keys: "?", description: "顯示/隱藏快捷鍵說明" },
            { keys: "Esc", description: "關閉彈窗" },
          ]}
        />
      )}
    </main>
  );
}
