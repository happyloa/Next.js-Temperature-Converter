"use client";

import { useCallback, useMemo, useState } from "react";

import {
  ABSOLUTE_ZERO_K,
  SOLAR_SURFACE_K,
  createConversions,
  decimalPattern,
  getScale,
  getThermalMood,
} from "../lib/temperature";
import { clamp, formatTemperature, toInputString } from "../lib/format";
import type { HistoryEntry } from "../types/history";
import type { ThermalInsight } from "../types/insight";
import type {
  TemperatureConversion,
  TemperaturePreset,
  TemperatureScale,
  TemperatureScaleCode,
} from "../types/temperature";

/**
 * 負責處理輸入溫標、數值與轉換結果的自訂 hook。
 * 讓頁面元件專注在排版與資料串接，邏輯則被清楚封裝。
 */
export function useTemperatureConversion(
  initialScale: TemperatureScaleCode = "celsius",
) {
  const [scale, setScale] = useState<TemperatureScaleCode>(initialScale);
  const [value, setValue] = useState<number>(25);
  const [rawInput, setRawInput] = useState<string>("25");

  const activeScale = useMemo<TemperatureScale | undefined>(
    () => getScale(scale),
    [scale],
  );

  const sliderRange = useMemo(() => {
    if (!activeScale) {
      return { min: -273.15, max: 6000 } as const;
    }
    const min = activeScale.fromKelvin(ABSOLUTE_ZERO_K);
    const max = activeScale.fromKelvin(SOLAR_SURFACE_K);
    return {
      min: Number.isFinite(min) ? min : -273.15,
      max: Number.isFinite(max) ? max : 6000,
    } as const;
  }, [activeScale]);

  const conversions = useMemo<TemperatureConversion[]>(() => {
    if (!activeScale) return [];
    return createConversions(activeScale, value);
  }, [activeScale, value]);

  const celsiusValue = useMemo(() => {
    const celsiusScale = conversions.find((item) => item.code === "celsius");
    return celsiusScale ? celsiusScale.result : Number.NaN;
  }, [conversions]);

  const kelvinValue = useMemo(() => {
    const kelvinScale = conversions.find((item) => item.code === "kelvin");
    return kelvinScale ? kelvinScale.result : Number.NaN;
  }, [conversions]);

  const mood = useMemo(() => getThermalMood(celsiusValue), [celsiusValue]);

  const insights = useMemo<ThermalInsight[]>(() => {
    if (!Number.isFinite(celsiusValue)) return [];

    const freezeDelta = celsiusValue - 0;
    const boilDelta = celsiusValue - 100;

    return [
      {
        icon: mood.emoji,
        title: mood.title,
        description: mood.description,
      },
      {
        icon: freezeDelta >= 0 ? "💧" : "🧊",
        title:
          freezeDelta >= 0
            ? `比冰點高 ${formatTemperature(Math.abs(freezeDelta))}°C`
            : `比冰點低 ${formatTemperature(Math.abs(freezeDelta))}°C`,
        description:
          freezeDelta >= 0
            ? "水已無結冰之虞，可放心使用一般液體或水冷系統。"
            : "已低於水的冰點，需留意結霜、結凍與管線破裂風險。",
      },
      {
        icon: boilDelta >= 0 ? "♨️" : "🌡️",
        title:
          boilDelta >= 0
            ? `超過沸點 ${formatTemperature(Math.abs(boilDelta))}°C`
            : `距離沸點還差 ${formatTemperature(Math.abs(boilDelta))}°C`,
        description:
          boilDelta >= 0
            ? "此溫度可能產生大量蒸汽，請使用耐壓容器或安全閥。"
            : "尚未沸騰，可持續加熱或維持溫度以達期望的實驗狀態。",
      },
    ];
  }, [celsiusValue, mood]);

  const handleScaleChange = useCallback(
    (nextScale: TemperatureScaleCode) => {
      if (!nextScale || nextScale === scale) return;
      const nextScaleConfig = getScale(nextScale);
      if (!nextScaleConfig || !activeScale) {
        setScale(nextScale);
        return;
      }

      if (!Number.isFinite(value)) {
        setScale(nextScale);
        setRawInput("");
        setValue(Number.NaN);
        return;
      }

      const kelvin = activeScale.toKelvin(value);
      const converted = nextScaleConfig.fromKelvin(kelvin);
      setScale(nextScale);
      setValue(converted);
      setRawInput(toInputString(converted));
    },
    [activeScale, scale, value],
  );

  const handleRawInputChange = useCallback(
    (nextValue: string) => {
      if (!decimalPattern.test(nextValue)) return;
      setRawInput(nextValue);

      if (
        nextValue === "" ||
        nextValue === "-" ||
        nextValue === "-." ||
        nextValue === "."
      ) {
        setValue(Number.NaN);
        return;
      }

      const numeric = Number(nextValue);
      if (Number.isNaN(numeric)) {
        setValue(Number.NaN);
        return;
      }

      const clamped = clamp(numeric, sliderRange.min, sliderRange.max);
      setValue(clamped);
    },
    [sliderRange.max, sliderRange.min],
  );

  const handleSliderChange = useCallback((numeric: number) => {
    if (!Number.isFinite(numeric)) return;
    setValue(numeric);
    setRawInput(toInputString(numeric));
  }, []);

  const handleReset = useCallback(() => {
    setScale("celsius");
    setValue(25);
    setRawInput("25");
  }, []);

  const handlePresetSelect = useCallback((preset: TemperaturePreset) => {
    setScale(preset.scale);
    setValue(preset.value);
    setRawInput(toInputString(preset.value));
  }, []);

  /**
   * 將當前轉換狀態封裝成歷史紀錄，供外部儲存。
   */
  const createHistoryEntry = useCallback((): HistoryEntry | null => {
    if (
      !Number.isFinite(value) ||
      !Number.isFinite(celsiusValue) ||
      conversions.length === 0 ||
      !activeScale
    ) {
      return null;
    }

    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      scale,
      scaleLabel: activeScale.label,
      scaleSymbol: activeScale.symbol,
      value,
      conversions: conversions.map((item) => ({
        code: item.code,
        label: item.label,
        symbol: item.symbol,
        result: item.result,
      })),
    } satisfies HistoryEntry;
  }, [activeScale, celsiusValue, conversions, scale, value]);

  const sliderValue = Number.isFinite(value)
    ? clamp(value, sliderRange.min, sliderRange.max)
    : clamp(25, sliderRange.min, sliderRange.max);

  const sliderStep = (sliderRange.max - sliderRange.min) / 400 || 1;

  const relativeSolarProgress = Number.isFinite(kelvinValue)
    ? clamp((kelvinValue / SOLAR_SURFACE_K) * 100, 0, 130)
    : 0;

  const showSolarProgress = Number.isFinite(kelvinValue);

  const canAddHistory =
    Number.isFinite(value) &&
    Number.isFinite(celsiusValue) &&
    conversions.length > 0;

  return {
    scale,
    rawInput,
    value,
    activeScale,
    conversions,
    celsiusValue,
    kelvinValue,
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
    handleSliderChange,
    handleReset,
    handlePresetSelect,
    createHistoryEntry,
  };
}
