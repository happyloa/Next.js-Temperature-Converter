"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { FactsSection } from "./components/FactsSection";
import { HeroSection } from "./components/HeroSection";
import { HistorySection } from "./components/HistorySection";
import { InsightsSection } from "./components/InsightsSection";
import { TemperatureInputCard } from "./components/TemperatureInputCard";
import { WeatherSection } from "./components/WeatherSection";

const TEMPERATURE_SCALES = [
  {
    code: "celsius",
    label: "攝氏 (°C)",
    symbol: "°C",
    accent: "from-sky-400/30 via-sky-400/15 to-sky-400/5",
    toKelvin: (value) => value + 273.15,
    fromKelvin: (value) => value - 273.15,
  },
  {
    code: "fahrenheit",
    label: "華氏 (°F)",
    symbol: "°F",
    accent: "from-orange-400/30 via-orange-400/15 to-orange-400/5",
    toKelvin: (value) => ((value + 459.67) * 5) / 9,
    fromKelvin: (value) => (value * 9) / 5 - 459.67,
  },
  {
    code: "kelvin",
    label: "絕對溫標 (K)",
    symbol: "K",
    accent: "from-cyan-400/30 via-cyan-400/15 to-cyan-400/5",
    toKelvin: (value) => value,
    fromKelvin: (value) => value,
  },
  {
    code: "rankine",
    label: "蘭氏 (°R)",
    symbol: "°R",
    accent: "from-violet-400/30 via-violet-400/15 to-violet-400/5",
    toKelvin: (value) => (value * 5) / 9,
    fromKelvin: (value) => (value * 9) / 5,
  },
  {
    code: "reaumur",
    label: "列氏 (°Ré)",
    symbol: "°Ré",
    accent: "from-emerald-400/30 via-emerald-400/15 to-emerald-400/5",
    toKelvin: (value) => value * 1.25 + 273.15,
    fromKelvin: (value) => (value - 273.15) * 0.8,
  },
  {
    code: "newton",
    label: "牛頓氏 (°N)",
    symbol: "°N",
    accent: "from-rose-400/30 via-rose-400/15 to-rose-400/5",
    toKelvin: (value) => value * (100 / 33) + 273.15,
    fromKelvin: (value) => (value - 273.15) * (33 / 100),
  },
];

const PRESETS = [
  { label: "絕對零度", value: 0, scale: "kelvin", emoji: "🧊" },
  { label: "冰點", value: 0, scale: "celsius", emoji: "❄️" },
  { label: "體溫", value: 98.6, scale: "fahrenheit", emoji: "🫀" },
  { label: "咖啡沖泡", value: 92, scale: "celsius", emoji: "☕️" },
  { label: "烤箱模式", value: 392, scale: "fahrenheit", emoji: "🍞" },
  { label: "熔岩", value: 1300, scale: "celsius", emoji: "🌋" },
  { label: "太陽表面", value: 5778, scale: "kelvin", emoji: "☀️" },
];

const FACTS = [
  {
    icon: "🧪",
    title: "六種溫標一次掌握",
    description:
      "內建攝氏、華氏、絕對溫標、蘭氏、列氏與牛頓氏，方便面對各種歷史與現代科學情境。",
  },
  {
    icon: "🗂️",
    title: "智慧紀錄",
    description:
      "將重要的轉換加入歷史紀錄，可快速回顧對照常用的測試情境或設備校正數據。",
  },
  {
    icon: "📊",
    title: "情境洞察",
    description:
      "透過演算法分析溫度與冰點、沸點及生活級距的距離，協助快速判斷安全與風險。",
  },
];

const WEATHER_CODE_MAP = {
  0: "晴朗無雲",
  1: "大致晴朗",
  2: "局部多雲",
  3: "陰天",
  45: "有霧",
  48: "霧凇",
  51: "毛毛雨",
  53: "間歇性小雨",
  55: "毛毛雨偏強",
  56: "凍毛毛雨",
  57: "凍毛毛雨偏強",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  66: "凍雨",
  67: "凍雨偏強",
  71: "小雪",
  73: "中雪",
  75: "大雪",
  77: "霰或冰珠",
  80: "短暫小陣雨",
  81: "短暫中陣雨",
  82: "短暫強陣雨",
  85: "短暫小陣雪",
  86: "短暫強陣雪",
  95: "可能打雷",
  96: "雷陣雨伴隨冰雹",
  99: "強雷陣雨伴隨冰雹",
};

const WEATHER_PRESETS = ["台北", "東京", "紐約", "倫敦"];

const numberFormatter = new Intl.NumberFormat("zh-TW", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const timeFormatter = new Intl.DateTimeFormat("zh-TW", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("zh-TW", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const ABSOLUTE_ZERO_K = 0;
const SOLAR_SURFACE_K = 5778;

const decimalPattern = /^-?\d*(\.\d*)?$/;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const toInputString = (value) => {
  if (!Number.isFinite(value)) return "";
  const trimmed = Number(value.toFixed(4));
  return `${trimmed}`;
};

const formatTemperature = (value) => numberFormatter.format(value);

const getWeatherDescription = (code) =>
  WEATHER_CODE_MAP[code] ?? "天氣狀況不明，請再試一次。";

const formatOptionalMetric = (value, suffix = "") => {
  if (!Number.isFinite(value)) {
    return suffix ? `--${suffix}` : "--";
  }
  return `${formatTemperature(value)}${suffix}`;
};

const formatWeatherTime = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return dateTimeFormatter.format(date);
};

const getScale = (code) =>
  TEMPERATURE_SCALES.find((item) => item.code === code);

const getThermalMood = (celsiusValue) => {
  if (!Number.isFinite(celsiusValue)) {
    return {
      title: "等待輸入",
      description: "輸入溫度後即可取得對應的情境說明與建議。",
      emoji: "🌡️",
    };
  }

  if (celsiusValue <= -50) {
    return {
      title: "極地酷寒",
      description: "此溫度代表極端寒冷環境，需使用多層防寒裝備並注意結霜。",
      emoji: "🥶",
    };
  }

  if (celsiusValue <= -10) {
    return {
      title: "冰封邊緣",
      description: "容易結冰與金屬脆化，戶外作業請備妥保暖設備與防凍液。",
      emoji: "❄️",
    };
  }

  if (celsiusValue < 30) {
    return {
      title: "舒適區間",
      description: "介於常見生活與實驗室環境，適合一般測試或培養操作。",
      emoji: "🙂",
    };
  }

  if (celsiusValue < 60) {
    return {
      title: "溫熱注意",
      description: "人體長時間暴露會感到不適，建議做好散熱與水分補充。",
      emoji: "🌤️",
    };
  }

  if (celsiusValue < 100) {
    return {
      title: "沸點逼近",
      description: "接近水沸點，請注意蒸汽與壓力變化，避免密閉容器。",
      emoji: "♨️",
    };
  }

  if (celsiusValue < 500) {
    return {
      title: "高熱作業",
      description: "屬於工業或烹飪高溫範圍，需使用隔熱手套與耐熱材質。",
      emoji: "🔥",
    };
  }

  return {
    title: "極端高能",
    description: "溫度已達熔爐、熔岩或天文觀測等等級，請使用專業防護。",
    emoji: "🌋",
  };
};

export default function TemperatureStudio() {
  const [scale, setScale] = useState("celsius");
  const [value, setValue] = useState(25);
  const [rawInput, setRawInput] = useState("25");
  const [history, setHistory] = useState([]);
  const [copiedScale, setCopiedScale] = useState(null);
  const [weatherQuery, setWeatherQuery] = useState("台北");
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  const activeScale = useMemo(() => getScale(scale), [scale]);

  const sliderRange = useMemo(() => {
    if (!activeScale) {
      return { min: -273.15, max: 6000 };
    }
    const min = activeScale.fromKelvin(ABSOLUTE_ZERO_K);
    const max = activeScale.fromKelvin(SOLAR_SURFACE_K);
    return {
      min: Number.isFinite(min) ? min : -273.15,
      max: Number.isFinite(max) ? max : 6000,
    };
  }, [activeScale]);

  const conversions = useMemo(() => {
    if (!activeScale) return [];
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return [];

    const kelvin = activeScale.toKelvin(numeric);
    return TEMPERATURE_SCALES.map((targetScale) => ({
      ...targetScale,
      result: targetScale.fromKelvin(kelvin),
    }));
  }, [activeScale, value]);

  const celsiusValue = useMemo(() => {
    const celsiusScale = conversions.find((item) => item.code === "celsius");
    return celsiusScale ? celsiusScale.result : Number.NaN;
  }, [conversions]);

  const kelvinValue = useMemo(() => {
    const kelvinScale = conversions.find((item) => item.code === "kelvin");
    return kelvinScale ? kelvinScale.result : Number.NaN;
  }, [conversions]);

  const insights = useMemo(() => {
    if (!Number.isFinite(celsiusValue)) return [];

    const mood = getThermalMood(celsiusValue);
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
  }, [celsiusValue]);

  const handleScaleChange = (nextScale) => {
    if (!nextScale || nextScale === scale) return;
    const nextScaleConfig = getScale(nextScale);
    if (!nextScaleConfig || !activeScale) {
      setScale(nextScale);
      return;
    }

    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      setScale(nextScale);
      setRawInput("");
      setValue(Number.NaN);
      return;
    }

    const kelvin = activeScale.toKelvin(numeric);
    const converted = nextScaleConfig.fromKelvin(kelvin);
    setScale(nextScale);
    setValue(converted);
    setRawInput(toInputString(converted));
  };

  const handleInputChange = (event) => {
    const { value: nextValue } = event.target;
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
  };

  const handleSliderChange = (event) => {
    const numeric = Number(event.target.value);
    if (!Number.isFinite(numeric)) return;
    setValue(numeric);
    setRawInput(toInputString(numeric));
  };

  const handleReset = () => {
    setScale("celsius");
    setValue(25);
    setRawInput("25");
  };

  const handlePresetSelect = (preset) => {
    setScale(preset.scale);
    setValue(preset.value);
    setRawInput(toInputString(preset.value));
  };

  const handleAddHistory = () => {
    if (!Number.isFinite(value) || !Number.isFinite(celsiusValue) || conversions.length === 0) {
      return;
    }

    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      scale,
      scaleLabel: activeScale?.label ?? "",
      scaleSymbol: activeScale?.symbol ?? "",
      value,
      conversions: conversions.map((item) => ({
        code: item.code,
        label: item.label,
        symbol: item.symbol,
        result: item.result,
      })),
    };

    setHistory((prev) => [entry, ...prev].slice(0, 8));
  };

  const handleClearHistory = () => setHistory([]);

  const handleCopy = useCallback(async (text, code) => {
    try {
      await navigator.clipboard?.writeText(text);
      setCopiedScale(code);
      setTimeout(() => setCopiedScale(null), 1800);
    } catch (error) {
      console.error("Failed to copy", error);
    }
  }, []);

  const fetchWeather = useCallback(async (query) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setWeatherError("請輸入地點名稱");
      setWeatherData(null);
      setWeatherLoading(false);
      return;
    }

    setWeatherLoading(true);
    setWeatherError(null);

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          trimmed,
        )}&count=1&language=zh&format=json`,
      );

      if (!geoResponse.ok) {
        throw new Error("地理定位服務暫時無法使用");
      }

      const geoData = await geoResponse.json();

      if (!geoData?.results?.length) {
        setWeatherData(null);
        setWeatherError("找不到相符的地點，請再試一次。");
        return;
      }

      const location = geoData.results[0];

      const forecastResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code`,
      );

      if (!forecastResponse.ok) {
        throw new Error("天氣資料取得失敗");
      }

      const forecast = await forecastResponse.json();

      if (!forecast?.current) {
        throw new Error("目前無法取得天氣資訊");
      }

      setWeatherData({
        location: `${location.name}${location.country ? ` · ${location.country}` : ""}`,
        timezone: forecast.timezone_abbreviation,
        observationTime: forecast.current.time,
        temperature: forecast.current.temperature_2m,
        apparentTemperature: forecast.current.apparent_temperature,
        humidity: forecast.current.relative_humidity_2m,
        windSpeed: forecast.current.wind_speed_10m,
        weatherCode: forecast.current.weather_code,
      });
    } catch (error) {
      console.error("fetchWeather", error);
      setWeatherData(null);
      setWeatherError(error.message ?? "無法取得天氣資訊，請稍後再試。");
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather("台北");
  }, [fetchWeather]);

  const handleWeatherSubmit = useCallback(
    (event) => {
      event?.preventDefault();
      fetchWeather(weatherQuery);
    },
    [fetchWeather, weatherQuery],
  );

  const handleWeatherPreset = useCallback(
    (preset) => {
      setWeatherQuery(preset);
      fetchWeather(preset);
    },
    [fetchWeather],
  );

  const sliderValue = Number.isFinite(value)
    ? clamp(value, sliderRange.min, sliderRange.max)
    : clamp(25, sliderRange.min, sliderRange.max);

  const sliderStep = (sliderRange.max - sliderRange.min) / 400 || 1;

  const hasKelvinValue = Number.isFinite(kelvinValue);

  const relativeSolarProgress = hasKelvinValue
    ? clamp((kelvinValue / SOLAR_SURFACE_K) * 100, 0, 130)
    : 0;

  const mood = Number.isFinite(celsiusValue) ? getThermalMood(celsiusValue) : null;

  const canAddHistory =
    Number.isFinite(value) && Number.isFinite(celsiusValue) && conversions.length > 0;

  return (
    <main className="py-12 pb-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-10">
        <HeroSection presets={PRESETS} onPresetSelect={handlePresetSelect} />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
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
            showSolarProgress={hasKelvinValue}
            formatTemperature={formatTemperature}
          />

          <div className="space-y-8">
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
            />
            <InsightsSection insights={insights} />
          </div>
        </div>

        <FactsSection facts={FACTS} />
      </div>
    </main>
  );
}
