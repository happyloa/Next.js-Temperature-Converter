"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

const classNames = (...values) => values.filter(Boolean).join(" ");

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

  const relativeSolarProgress = Number.isFinite(kelvinValue)
    ? clamp((kelvinValue / SOLAR_SURFACE_K) * 100, 0, 130)
    : 0;

  const mood = getThermalMood(celsiusValue);

  return (
    <main className="py-12 pb-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 sm:px-8 lg:px-10">
        <section className="flex flex-col items-center gap-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-600/40 bg-blue-950/40 px-4 py-1 text-sm font-medium text-sky-200">
            ⚡ Multi-Scale Temperature Studio
          </span>
          <h1 className="text-4xl font-bold leading-tight text-slate-50 md:text-5xl">
            溫度實驗室 · 智慧轉換平台
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
            即時轉換六種常見與歷史溫標、加入情境分析與轉換紀錄。無論是烹飪、科研、工業或創作，這裡都能給你漂亮又專業的一站式體驗。
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-600/40 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-sky-400/60 hover:bg-sky-400/10"
              >
                <span>{preset.emoji}</span>
                {preset.label}
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
          <section className="space-y-8 rounded-3xl border border-slate-700/40 bg-slate-900/70 p-6 shadow-glass backdrop-blur md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-slate-50">輸入溫度</h2>
                <p className="max-w-xl text-sm leading-relaxed text-slate-300">
                  選擇想要輸入的溫標後填入數值，系統會即時計算其他尺度並提供安全洞察與轉換紀錄。
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-600/40 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-400"
                >
                  🔄 重設
                </button>
                <button
                  type="button"
                  onClick={handleAddHistory}
                  disabled={conversions.length === 0}
                  className="inline-flex items-center gap-2 rounded-full bg-sky-500/90 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700/60 disabled:text-slate-400"
                >
                  📝 加入紀錄
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {TEMPERATURE_SCALES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleScaleChange(item.code)}
                  className={classNames(
                    "flex-1 min-w-[150px] rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                    scale === item.code
                      ? "border-sky-400/70 bg-sky-400/10 text-sky-200"
                      : "border-slate-700/50 bg-slate-900/80 text-slate-200 hover:border-slate-500/70 hover:bg-slate-800/80",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <label className="flex flex-col gap-2 text-left">
                <span className="text-sm font-semibold text-slate-200">輸入數值</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 text-lg font-semibold text-slate-100 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/40">
                  <span className="text-xl">🌡️</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={rawInput}
                    onChange={handleInputChange}
                    placeholder="輸入溫度值"
                    className="flex-1 bg-transparent text-lg font-semibold outline-none"
                  />
                  <span className="text-sm font-semibold text-slate-400">
                    {activeScale?.symbol ?? ""}
                  </span>
                </div>
              </label>

              <div className="space-y-2">
                <input
                  type="range"
                  min={sliderRange.min}
                  max={sliderRange.max}
                  step={sliderStep}
                  value={sliderValue}
                  onChange={handleSliderChange}
                  className="h-2 w-full rounded-full accent-sky-400"
                />
                <p className="text-xs text-slate-400">
                  範圍：{formatTemperature(sliderRange.min)} {activeScale?.symbol} ~ {formatTemperature(sliderRange.max)} {activeScale?.symbol}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {conversions.map((item) => (
                <div
                  key={item.code}
                  className={classNames(
                    "relative overflow-hidden rounded-3xl border border-slate-700/40 bg-slate-900/80 p-5",
                    "bg-gradient-to-br",
                    item.accent,
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <span className="text-xs uppercase tracking-wide text-slate-200/80">
                        {item.label}
                      </span>
                      <p className="text-3xl font-bold text-slate-50">
                        {formatTemperature(item.result)} {item.symbol}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(`${formatTemperature(item.result)}`, item.code)}
                      className={classNames(
                        "rounded-full border px-3 py-1 text-xs font-semibold transition",
                        copiedScale === item.code
                          ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-200"
                          : "border-slate-600/50 bg-slate-900/70 text-slate-300 hover:border-slate-400/70",
                      )}
                    >
                      {copiedScale === item.code ? "已複製" : "複製"}
                    </button>
                  </div>
                  {item.code === "celsius" && (
                    <p className="mt-3 text-sm text-slate-200/80">{mood.title}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-200">
                <span className="text-xl">📈</span>
                <h3 className="text-lg font-semibold">相對於太陽表面的能量比例</h3>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full border border-slate-700/60 bg-slate-800/80">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 via-fuchsia-400 to-rose-400"
                  style={{ width: `${relativeSolarProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">
                {Number.isFinite(kelvinValue)
                  ? `目前為太陽表面溫度的 ${formatTemperature(relativeSolarProgress)}%`
                  : "輸入溫度以分析熱能比例"}
              </p>
            </div>
          </section>

          <div className="space-y-8">
            <section className="space-y-6 rounded-3xl border border-slate-700/40 bg-slate-900/70 p-6 shadow-glass backdrop-blur md:p-7">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-slate-200">
                  <span className="text-xl">🗂️</span>
                  <h2 className="text-xl font-semibold">轉換紀錄</h2>
                </div>
                <p className="text-sm text-slate-300">
                  將感興趣的轉換加入歷史紀錄，可快速對照實驗或製程所需的常用溫度設定。
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  {history.length > 0
                    ? `共 ${history.length} 筆，依時間由新到舊排序`
                    : "尚未加入紀錄"}
                </span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  disabled={history.length === 0}
                  className="rounded-full border border-slate-600/50 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-rose-400/60 hover:text-rose-200 disabled:cursor-not-allowed disabled:border-slate-700/50 disabled:text-slate-500"
                >
                  清除紀錄
                </button>
              </div>
              <div className="space-y-4">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-slate-700/40 bg-slate-900/80 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-300">
                      <span>
                        {timeFormatter.format(new Date(entry.timestamp))} · {formatTemperature(entry.value)} {getScale(entry.scale)?.symbol}
                      </span>
                      <span className="text-xs text-slate-500">{getScale(entry.scale)?.label}</span>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {entry.conversions.map((item) => (
                        <div
                          key={`${entry.id}-${item.code}`}
                          className="flex items-center justify-between rounded-xl border border-slate-700/40 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
                        >
                          <span className="font-medium">{item.label}</span>
                          <span className="font-semibold">
                            {formatTemperature(item.result)} {item.symbol}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-slate-700/40 bg-slate-900/60 p-4 text-sm text-slate-400">
                    加入紀錄後，系統會保留最近八筆轉換，方便在不同實驗之間快速比對。
                  </p>
                )}
              </div>
            </section>

            <section className="space-y-6 rounded-3xl border border-slate-700/40 bg-slate-900/70 p-6 shadow-glass backdrop-blur md:p-7">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-slate-200">
                  <span className="text-xl">☁️</span>
                  <h2 className="text-xl font-semibold">全球氣象快查</h2>
                </div>
                <p className="text-sm text-slate-300">
                  輸入城市名稱或直接使用熱門快捷，取得 Open-Meteo 的免費即時資料並納入轉換情境。
                </p>
              </div>

              <form onSubmit={handleWeatherSubmit} className="space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/70 px-4 py-3">
                  <span className="text-lg">📍</span>
                  <input
                    type="text"
                    value={weatherQuery}
                    onChange={(event) => setWeatherQuery(event.target.value)}
                    placeholder="輸入城市名稱"
                    className="flex-1 bg-transparent text-sm font-semibold text-slate-100 outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {WEATHER_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleWeatherPreset(preset)}
                      className={classNames(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                        weatherQuery === preset
                          ? "border-sky-400/70 bg-sky-400/15 text-sky-200"
                          : "border-slate-700/50 bg-slate-950/70 text-slate-300 hover:border-slate-500/70",
                      )}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={weatherLoading}
                  className="w-full rounded-full bg-fuchsia-500/90 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:bg-slate-700/60 disabled:text-slate-400"
                >
                  {weatherLoading ? "查詢中..." : "取得即時天氣"}
                </button>
              </form>

              <div>
                {weatherError ? (
                  <p className="rounded-2xl border border-amber-400/60 bg-amber-400/10 p-4 text-sm text-amber-100">
                    {weatherError}
                  </p>
                ) : weatherData ? (
                  <div className="space-y-4 rounded-3xl border border-slate-700/40 bg-slate-950/60 p-5">
                    <div className="flex flex-col gap-2 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-slate-100">{weatherData.location}</p>
                        <p className="text-xs text-slate-400">
                          {getWeatherDescription(weatherData.weatherCode)} · 觀測時間 {formatWeatherTime(weatherData.observationTime)}
                          {weatherData.timezone ? `（${weatherData.timezone}）` : ""}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full border border-sky-400/60 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200">
                        體感 {formatOptionalMetric(weatherData.apparentTemperature, "°C")}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-slate-50">
                        {formatOptionalMetric(weatherData.temperature, "°C")}
                      </p>
                      <p className="text-sm text-slate-300">
                        將即時天氣帶入轉換流程，快速比較實驗室設定與當地環境條件。
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1 rounded-2xl border border-slate-700/40 bg-slate-900/60 p-3">
                        <span className="text-xs uppercase tracking-wide text-slate-400">相對濕度</span>
                        <p className="text-lg font-semibold text-slate-100">
                          {formatOptionalMetric(weatherData.humidity, "%")}
                        </p>
                      </div>
                      <div className="space-y-1 rounded-2xl border border-slate-700/40 bg-slate-900/60 p-3">
                        <span className="text-xs uppercase tracking-wide text-slate-400">風速</span>
                        <p className="text-lg font-semibold text-slate-100">
                          {formatOptionalMetric(weatherData.windSpeed, " m/s")}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-700/40 bg-slate-900/60 p-4 text-sm text-slate-400">
                    查詢任何城市，了解環境背景後再進行溫度轉換與安全判讀。
                  </p>
                )}
              </div>
            </section>

            <section className="space-y-6 rounded-3xl border border-slate-700/40 bg-slate-900/70 p-6 shadow-glass backdrop-blur md:p-7">
              <div className="flex items-center gap-3 text-slate-200">
                <span className="text-xl">💡</span>
                <h2 className="text-xl font-semibold">溫度洞察</h2>
              </div>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div
                    key={insight.title}
                    className="flex items-start gap-4 rounded-2xl border border-slate-700/40 bg-slate-900/75 p-4"
                  >
                    <span className="text-2xl">{insight.icon}</span>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-slate-100">{insight.title}</p>
                      <p className="text-sm text-slate-300">{insight.description}</p>
                    </div>
                  </div>
                ))}
                {insights.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-slate-700/40 bg-slate-900/60 p-4 text-sm text-slate-400">
                    先輸入溫度，即可獲得冰點、沸點與風險評估等即時分析。
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-700/40 bg-slate-900/70 p-6 shadow-glass backdrop-blur md:p-8">
          <div className="flex items-center gap-3 text-slate-200">
            <span className="text-xl">✨</span>
            <h2 className="text-xl font-semibold">作品亮點</h2>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {FACTS.map((fact) => (
              <div
                key={fact.title}
                className="h-full space-y-3 rounded-2xl border border-slate-700/40 bg-slate-900/75 p-5"
              >
                <div className="text-3xl">{fact.icon}</div>
                <p className="text-lg font-semibold text-slate-100">{fact.title}</p>
                <p className="text-sm leading-relaxed text-slate-300">{fact.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
