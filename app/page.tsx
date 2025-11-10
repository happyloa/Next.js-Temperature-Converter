"use client";

import type { ChangeEvent } from "react";
import { useCallback, useEffect, useState } from "react";

import { FactsSection } from "./components/FactsSection";
import { HeroSection } from "./components/HeroSection";
import { HistorySection } from "./components/HistorySection";
import { InsightsSection } from "./components/InsightsSection";
import { TemperatureInputCard } from "./components/TemperatureInputCard";
import { ThemeToggleButton } from "./components/ThemeToggleButton";
import { WeatherSection } from "./components/WeatherSection";
import { useHistoryStore } from "./hooks/useHistoryStore";
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

  const [copiedScale, setCopiedScale] = useState<TemperatureScaleCode | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

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

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <main className="w-full max-w-full py-12 pb-24">
      <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-10">
        <HeroSection presets={TEMPERATURE_PRESETS} onPresetSelect={handlePresetClick} />

        <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
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
    </main>
  );
}
