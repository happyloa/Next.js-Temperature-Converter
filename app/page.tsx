"use client";

import type { ChangeEvent } from "react";
import { useCallback, useEffect, useState } from "react";

import { FactsSection } from "./components/FactsSection";
import { HeroSection } from "./components/HeroSection";
import { HistorySection } from "./components/HistorySection";
import { InsightsSection } from "./components/InsightsSection";
import { KeyboardShortcutsHelp } from "./components/KeyboardShortcutsHelp";
import { TemperatureInputCard } from "./components/TemperatureInputCard";
import { ThemeToggleButton } from "./components/ThemeToggleButton";
import { WeatherSection } from "./components/WeatherSection";
import { useHistoryStore } from "./hooks/useHistoryStore";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useTemperatureConversion } from "./hooks/useTemperatureConversion";
import { useWeatherDashboard } from "./hooks/useWeatherDashboard";
import {
  PRODUCT_FACTS,
  TEMPERATURE_PRESETS,
  TEMPERATURE_SCALES,
} from "./lib/temperature";
import {
  formatCoordinate,
  formatLocalClock,
  formatOptionalMetric,
  formatTemperature,
  formatUtcOffset,
  formatWeatherTime,
  formatWeekday,
  timeFormatter,
} from "./lib/format";
import { getWeatherDescription, WEATHER_PRESETS } from "./lib/weather";
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

  const {
    weatherQuery,
    setWeatherQuery,
    weatherData,
    weatherLoading,
    weatherError,
    handleWeatherSubmit,
    handleWeatherPreset,
  } = useWeatherDashboard("高雄");

  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  const [copiedScale, setCopiedScale] = useState<TemperatureScaleCode | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    // Lazy initialization - runs only on client
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "dark";
  });

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

  const handlePresetClick = useCallback(
    (preset: TemperaturePreset) => {
      selectTemperaturePreset(preset);
    },
    [selectTemperaturePreset]
  );

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

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: "r",
        ctrl: true,
        action: handleReset,
        description: "重設溫度輸入",
      },
      {
        key: "h",
        ctrl: true,
        action: clearHistory,
        description: "清除歷史紀錄",
      },
      {
        key: "t",
        ctrl: true,
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
      <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-10">
        <HeroSection presets={TEMPERATURE_PRESETS} onPresetSelect={handlePresetClick} />

        <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)]">
          <div className="min-w-0 space-y-8">
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
              onVoiceInput={handleRawInputChange}
            />
            <InsightsSection insights={insights} />
          </div>

          <aside className="min-w-0 space-y-8">
            <HistorySection
              history={history}
              onClearHistory={handleClearHistory}
              formatTemperature={formatTemperature}
              formatTime={(date) => timeFormatter.format(date)}
            />
            <WeatherSection
              query={weatherQuery}
              onQueryChange={setWeatherQuery}
              onSubmit={handleWeatherSubmit}
              presets={WEATHER_PRESETS}
              onPresetSelect={handleWeatherPreset}
              loading={weatherLoading}
              error={weatherError}
              data={weatherData}
              formatOptionalMetric={formatOptionalMetric}
              formatWeatherTime={formatWeatherTime}
              getWeatherDescription={getWeatherDescription}
              formatLocalClock={formatLocalClock}
              formatUtcOffset={formatUtcOffset}
              formatCoordinate={formatCoordinate}
              formatWeekday={formatWeekday}
            />
          </aside>
        </div>

        <FactsSection facts={PRODUCT_FACTS} />
      </div>

      <ThemeToggleButton theme={theme} onToggle={toggleTheme} />

      {showShortcutsHelp && (
        <KeyboardShortcutsHelp
          shortcuts={[
            { keys: "Ctrl+R", description: "重設溫度輸入" },
            { keys: "Ctrl+H", description: "清除歷史紀錄" },
            { keys: "Ctrl+T", description: "切換深淺色主題" },
            { keys: "?", description: "顯示/隱藏快捷鍵說明" },
            { keys: "Esc", description: "關閉彈窗" },
          ]}
        />
      )}
    </main>
  );
}
