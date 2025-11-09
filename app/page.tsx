"use client";

import type { ChangeEvent, FormEvent } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { FactsSection } from "./components/FactsSection";
import type { Fact } from "./components/FactsSection";
import { HeroSection } from "./components/HeroSection";
import type { TemperaturePreset } from "./components/HeroSection";
import { HistorySection } from "./components/HistorySection";
import type {
  HistoryEntry,
  TemperatureConversionSummary,
} from "./components/HistorySection";
import { InsightsSection } from "./components/InsightsSection";
import type { ThermalInsight } from "./components/InsightsSection";
import { TemperatureInputCard } from "./components/TemperatureInputCard";
import type {
  TemperatureConversion,
  TemperatureScale,
  TemperatureScaleCode,
  ThermalMood,
} from "./components/TemperatureInputCard";
import { WeatherSection } from "./components/WeatherSection";
import type { WeatherData } from "./components/WeatherSection";

const TEMPERATURE_SCALE_CODES: TemperatureScaleCode[] = [
  "celsius",
  "fahrenheit",
  "kelvin",
  "rankine",
  "reaumur",
  "newton",
];

type GeoApiLocation = {
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  country?: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
};

type GeoApiResponse = {
  results?: GeoApiLocation[];
};

type ForecastApiResponse = {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    surface_pressure?: number;
    pressure_msl?: number;
    precipitation: number;
    uv_index: number;
    is_day: number;
  };
  current_units?: {
    temperature_2m?: string;
    apparent_temperature?: string;
    relative_humidity_2m?: string;
    wind_speed_10m?: string;
    surface_pressure?: string;
    pressure_msl?: string;
    precipitation?: string;
    uv_index?: string;
  };
  daily?: {
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
  daily_units?: {
    temperature_2m_max?: string;
    temperature_2m_min?: string;
  };
  timezone?: string;
  timezone_abbreviation?: string;
};

type AirQualityApiResponse = {
  current?: {
    european_aqi: number;
    pm2_5: number;
    pm10: number;
    time: string;
  };
  current_units?: {
    european_aqi?: string;
    pm2_5?: string;
    pm10?: string;
  };
};

type TimeApiResponse = {
  timezone?: string;
  abbreviation?: string;
  datetime?: string;
  utc_offset?: string;
  day_of_week?: number | null;
};

const TEMPERATURE_SCALES: TemperatureScale[] = [
  {
    code: "celsius",
    label: "攝氏 (°C)",
    symbol: "°C",
    accent: "from-[#FF5E5B]/35 via-[#FFED66]/20 to-[#FFFFEA]/10",
    toKelvin: (value) => value + 273.15,
    fromKelvin: (value) => value - 273.15,
  },
  {
    code: "fahrenheit",
    label: "華氏 (°F)",
    symbol: "°F",
    accent: "from-[#FFED66]/30 via-[#FF5E5B]/18 to-[#D8D8D8]/10",
    toKelvin: (value) => ((value + 459.67) * 5) / 9,
    fromKelvin: (value) => (value * 9) / 5 - 459.67,
  },
  {
    code: "kelvin",
    label: "絕對溫標 (K)",
    symbol: "K",
    accent: "from-[#00CECB]/28 via-[#FFED66]/18 to-[#FFFFEA]/10",
    toKelvin: (value) => value,
    fromKelvin: (value) => value,
  },
  {
    code: "rankine",
    label: "蘭氏 (°R)",
    symbol: "°R",
    accent: "from-[#FF5E5B]/28 via-[#00CECB]/18 to-[#D8D8D8]/10",
    toKelvin: (value) => (value * 5) / 9,
    fromKelvin: (value) => (value * 9) / 5,
  },
  {
    code: "reaumur",
    label: "列氏 (°Ré)",
    symbol: "°Ré",
    accent: "from-[#00CECB]/30 via-[#D8D8D8]/18 to-[#FFFFEA]/10",
    toKelvin: (value) => value * 1.25 + 273.15,
    fromKelvin: (value) => (value - 273.15) * 0.8,
  },
  {
    code: "newton",
    label: "牛頓氏 (°N)",
    symbol: "°N",
    accent: "from-[#FFED66]/28 via-[#FF5E5B]/18 to-[#00CECB]/12",
    toKelvin: (value) => value * (100 / 33) + 273.15,
    fromKelvin: (value) => (value - 273.15) * (33 / 100),
  },
];

const PRESETS: TemperaturePreset[] = [
  { label: "絕對零度", value: 0, scale: "kelvin", emoji: "🧊" },
  { label: "冰點", value: 0, scale: "celsius", emoji: "❄️" },
  { label: "體溫", value: 98.6, scale: "fahrenheit", emoji: "🫀" },
  { label: "咖啡沖泡", value: 92, scale: "celsius", emoji: "☕️" },
  { label: "烤箱模式", value: 392, scale: "fahrenheit", emoji: "🍞" },
  { label: "熔岩", value: 1300, scale: "celsius", emoji: "🌋" },
  { label: "太陽表面", value: 5778, scale: "kelvin", emoji: "☀️" },
];

const FACTS: Fact[] = [
  {
    icon: "🌍",
    title: "全球環境整合",
    description:
      "結合 Open-Meteo 天氣與 World Time API 時區資訊，瞬間掌握外部環境。",
  },
  {
    icon: "🧪",
    title: "六種溫標一次掌握",
    description:
      "攝氏、華氏、絕對溫標、蘭氏、列氏與牛頓氏一次整合，跨領域作業不再需要手動換算。",
  },
  {
    icon: "🗂️",
    title: "儀表板級的操作體驗",
    description:
      "輸入、滑桿、歷史紀錄與環境數據集中呈現，成為可直接對外展示的溫度管理產品。",
  },
];

const WEATHER_CODE_MAP: Record<number, string> = {
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

const WEATHER_PRESETS: string[] = ["高雄", "東京", "紐約", "倫敦"];

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
const HISTORY_STORAGE_KEY = "temperature-studio-history";

const decimalPattern = /^-?\d*(\.\d*)?$/;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const toInputString = (value: number): string => {
  if (!Number.isFinite(value)) return "";
  const trimmed = Number(value.toFixed(4));
  return `${trimmed}`;
};

const formatTemperature = (value: number): string =>
  numberFormatter.format(value);

const getWeatherDescription = (code: number): string =>
  WEATHER_CODE_MAP[code] ?? "天氣狀況不明，請再試一次。";

const formatOptionalMetric = (value: number, suffix = ""): string => {
  if (!Number.isFinite(value)) {
    return suffix ? `--${suffix}` : "--";
  }
  return `${formatTemperature(value)}${suffix}`;
};

const formatWeatherTime = (value: string | null): string => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return dateTimeFormatter.format(date);
};

const WEEKDAY_LABELS = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"] as const;

const formatLocalClock = (
  value: string | null,
  timezone: string | null | undefined,
  { withSeconds = false }: { withSeconds?: boolean } = {}
): string => {
  if (!value) return "--";

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const formatter = new Intl.DateTimeFormat("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
      ...(withSeconds ? { second: "2-digit" } : {}),
      timeZone: timezone ?? "UTC",
    });

    return formatter.format(date);
  } catch (error) {
    console.error("formatLocalClock", error);
    return value;
  }
};

const formatUtcOffset = (value: string | null): string => {
  if (!value) return "UTC±00:00";
  const normalized = `${value}`.trim();
  if (/^[+-]\d{2}:\d{2}$/.test(normalized)) {
    return `UTC${normalized}`;
  }
  return `UTC${normalized}`;
};

const formatWeekday = (index: number | null): string => {
  if (!Number.isFinite(index)) return "--";
  return WEEKDAY_LABELS[index as number] ?? `週${index}`;
};

const formatCoordinate = (value: number | null): string => {
  if (!Number.isFinite(value)) return "--";
  return numberFormatter.format(value as number);
};

const getScale = (code: TemperatureScaleCode): TemperatureScale | undefined =>
  TEMPERATURE_SCALES.find((item) => item.code === code);

const getThermalMood = (celsiusValue: number): ThermalMood => {
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

const isTemperatureConversionSummary = (
  value: unknown
): value is TemperatureConversionSummary => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<TemperatureConversionSummary>;
  return (
    typeof candidate.label === "string" &&
    typeof candidate.symbol === "string" &&
    typeof candidate.result === "number" &&
    typeof candidate.code === "string" &&
    TEMPERATURE_SCALE_CODES.includes(candidate.code as TemperatureScaleCode)
  );
};

const isHistoryEntry = (value: unknown): value is HistoryEntry => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<HistoryEntry>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.timestamp === "string" &&
    typeof candidate.scale === "string" &&
    TEMPERATURE_SCALE_CODES.includes(candidate.scale as TemperatureScaleCode) &&
    typeof candidate.scaleLabel === "string" &&
    typeof candidate.scaleSymbol === "string" &&
    typeof candidate.value === "number" &&
    Array.isArray(candidate.conversions) &&
    candidate.conversions.every(isTemperatureConversionSummary)
  );
};

const parseHistoryPayload = (value: unknown): HistoryEntry[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isHistoryEntry);
};

export default function TemperatureStudio() {
  const [scale, setScale] = useState<TemperatureScaleCode>("celsius");
  const [value, setValue] = useState<number>(25);
  const [rawInput, setRawInput] = useState<string>("25");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyHydrated, setHistoryHydrated] = useState(false);
  const [copiedScale, setCopiedScale] = useState<TemperatureScaleCode | null>(
    null
  );
  const [weatherQuery, setWeatherQuery] = useState<string>("高雄");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const historyStorageRef = useRef<"local" | "session">("local");

  const activeScale = useMemo(
    () => getScale(scale),
    [scale]
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
    };
  }, [activeScale]);

  const conversions = useMemo<TemperatureConversion[]>(() => {
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

  const insights = useMemo<ThermalInsight[]>(() => {
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

  const handleScaleChange = (nextScale: TemperatureScaleCode) => {
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

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
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

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
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

  const handlePresetSelect = (preset: TemperaturePreset) => {
    setScale(preset.scale);
    setValue(preset.value);
    setRawInput(toInputString(preset.value));
  };

  const handleAddHistory = () => {
    if (
      !Number.isFinite(value) ||
      !Number.isFinite(celsiusValue) ||
      conversions.length === 0 ||
      !activeScale
    ) {
      return;
    }

    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      scale,
      scaleLabel: activeScale.label,
      scaleSymbol: activeScale.symbol,
      value,
      conversions: conversions.map<TemperatureConversionSummary>((item) => ({
        code: item.code,
        label: item.label,
        symbol: item.symbol,
        result: item.result,
      })),
    };

    setHistory((prev) => [entry, ...prev].slice(0, 8));
  };

  const handleClearHistory = () => setHistory([]);

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storages: Array<{ name: "local" | "session"; storage: Storage }> = [
      { name: "local", storage: window.localStorage },
      { name: "session", storage: window.sessionStorage },
    ];

    for (const { name, storage } of storages) {
      try {
        const raw = storage.getItem(HISTORY_STORAGE_KEY);
        if (!raw) {
          continue;
        }

        const parsed = parseHistoryPayload(JSON.parse(raw) as unknown);
        if (parsed.length) {
          setHistory(parsed);
          historyStorageRef.current = name;
          break;
        }
      } catch (error) {
        console.error("Failed to restore history", error);
      }
    }

    setHistoryHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !historyHydrated) {
      return;
    }

    const payload = history.length > 0 ? JSON.stringify(history) : null;

    const storages: Array<{ name: "local" | "session"; storage: Storage }> =
      historyStorageRef.current === "session"
        ? [
            { name: "session", storage: window.sessionStorage },
            { name: "local", storage: window.localStorage },
          ]
        : [
            { name: "local", storage: window.localStorage },
            { name: "session", storage: window.sessionStorage },
          ];

    const isQuotaExceeded = (error: unknown): boolean => {
      if (!error) return false;
      if (error instanceof DOMException) {
        return (
          error.name === "QuotaExceededError" ||
          error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
          error.code === 22 ||
          error.code === 1014
        );
      }
      return false;
    };

    for (const { name, storage } of storages) {
      try {
        if (!payload) {
          storage.removeItem(HISTORY_STORAGE_KEY);
        } else {
          storage.setItem(HISTORY_STORAGE_KEY, payload);
        }
        historyStorageRef.current = name;
        return;
      } catch (error) {
        if (isQuotaExceeded(error)) {
          continue;
        }
        console.error("Failed to persist history", error);
        return;
      }
    }
  }, [history, historyHydrated]);

  const fetchWeather = useCallback(async (query: string) => {
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
          trimmed
        )}&count=1&language=zh&format=json`
      );

      if (!geoResponse.ok) {
        throw new Error("地理定位服務暫時無法使用");
      }

      const geoData = (await geoResponse.json()) as GeoApiResponse;

      if (!geoData?.results?.length) {
        setWeatherData(null);
        setWeatherError("找不到相符的地點，請再試一次。");
        return;
      }

      const location = geoData.results[0]!;
      const timezone = location.timezone ?? "auto";

      const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
      forecastUrl.searchParams.set("latitude", String(location.latitude));
      forecastUrl.searchParams.set("longitude", String(location.longitude));
      forecastUrl.searchParams.set(
        "current",
        [
          "temperature_2m",
          "apparent_temperature",
          "relative_humidity_2m",
          "wind_speed_10m",
          "weather_code",
          "pressure_msl",
          "surface_pressure",
          "precipitation",
          "uv_index",
          "is_day",
        ].join(",")
      );
      forecastUrl.searchParams.set(
        "daily",
        ["temperature_2m_max", "temperature_2m_min"].join(",")
      );
      forecastUrl.searchParams.set("forecast_days", "1");
      forecastUrl.searchParams.set("timezone", timezone);

      const airQualityUrl = new URL(
        "https://air-quality-api.open-meteo.com/v1/air-quality"
      );
      airQualityUrl.searchParams.set("latitude", String(location.latitude));
      airQualityUrl.searchParams.set("longitude", String(location.longitude));
      airQualityUrl.searchParams.set(
        "current",
        ["european_aqi", "pm2_5", "pm10"].join(",")
      );
      airQualityUrl.searchParams.set("timezone", timezone);

      const [forecastResult, airQualityResult, timeResult] =
        await Promise.allSettled([
          fetch(forecastUrl.toString()),
          fetch(airQualityUrl.toString()),
          location.timezone
            ? fetch(
                `https://worldtimeapi.org/api/timezone/${encodeURIComponent(
                  location.timezone
                )}`
              )
            : Promise.resolve<Response | null>(null),
        ]);

      if (forecastResult.status !== "fulfilled" || !forecastResult.value?.ok) {
        throw new Error("天氣資料取得失敗");
      }

      const forecast = (await forecastResult.value.json()) as ForecastApiResponse;

      if (!forecast?.current) {
        throw new Error("目前無法取得天氣資訊");
      }

      let airQualityPayload: AirQualityApiResponse | null = null;
      if (
        airQualityResult.status === "fulfilled" &&
        airQualityResult.value?.ok
      ) {
        try {
          airQualityPayload = (await airQualityResult.value.json()) as AirQualityApiResponse;
        } catch (error) {
          console.error("airQualityPayload", error);
        }
      }

      let timePayload: TimeApiResponse | null = null;
      if (timeResult.status === "fulfilled" && timeResult.value?.ok) {
        try {
          timePayload = (await timeResult.value.json()) as TimeApiResponse;
        } catch (error) {
          console.error("timePayload", error);
        }
      }

      const resolvedTimezone =
        location.timezone ??
        timePayload?.timezone ??
        forecast.timezone ??
        "UTC";

      setWeatherData({
        location: `${location.name}${
          location.country ? ` · ${location.country}` : ""
        }`,
        administrative: [
          location.admin1,
          location.admin2,
          location.admin3,
        ].filter((item): item is string => Boolean(item)),
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        timezone: resolvedTimezone,
        timezoneAbbreviation:
          timePayload?.abbreviation ??
          forecast.timezone_abbreviation ??
          resolvedTimezone,
        observationTime: forecast.current.time,
        temperature: forecast.current.temperature_2m,
        temperatureUnit: forecast.current_units?.temperature_2m ?? "°C",
        apparentTemperature: forecast.current.apparent_temperature,
        apparentTemperatureUnit:
          forecast.current_units?.apparent_temperature ?? "°C",
        humidity: forecast.current.relative_humidity_2m,
        humidityUnit: forecast.current_units?.relative_humidity_2m ?? "%",
        windSpeed: forecast.current.wind_speed_10m,
        windSpeedUnit: forecast.current_units?.wind_speed_10m ?? "m/s",
        pressure:
          forecast.current.surface_pressure ??
          forecast.current.pressure_msl ??
          Number.NaN,
        pressureUnit:
          forecast.current_units?.surface_pressure ??
          forecast.current_units?.pressure_msl ??
          "hPa",
        precipitation: forecast.current.precipitation,
        precipitationUnit: forecast.current_units?.precipitation ?? "mm",
        uvIndex: forecast.current.uv_index,
        uvIndexUnit: forecast.current_units?.uv_index ?? "",
        weatherCode: forecast.current.weather_code,
        isDay: forecast.current.is_day === 1,
        dailyHigh: forecast.daily?.temperature_2m_max?.[0] ?? Number.NaN,
        dailyLow: forecast.daily?.temperature_2m_min?.[0] ?? Number.NaN,
        dailyTemperatureUnit:
          forecast.daily_units?.temperature_2m_max ?? "°C",
        airQuality: airQualityPayload?.current
          ? {
              aqi: airQualityPayload.current.european_aqi,
              aqiUnit:
                airQualityPayload.current_units?.european_aqi ?? "",
              pm25: airQualityPayload.current.pm2_5,
              pm25Unit:
                airQualityPayload.current_units?.pm2_5 ?? "µg/m³",
              pm10: airQualityPayload.current.pm10,
              pm10Unit:
                airQualityPayload.current_units?.pm10 ?? "µg/m³",
              time: airQualityPayload.current.time,
            }
          : null,
        localTime: timePayload?.datetime ?? null,
        utcOffset: timePayload?.utc_offset ?? null,
        dayOfWeek: Number.isFinite(timePayload?.day_of_week)
          ? (timePayload?.day_of_week as number)
          : null,
      });
    } catch (error) {
      console.error("fetchWeather", error);
      setWeatherData(null);
      const message =
        error instanceof Error
          ? error.message
          : "無法取得天氣資訊，請稍後再試。";
      setWeatherError(message);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather("高雄");
  }, [fetchWeather]);

  const handleWeatherSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      fetchWeather(weatherQuery);
    },
    [fetchWeather, weatherQuery]
  );

  const handleWeatherPreset = useCallback(
    (preset: string) => {
      setWeatherQuery(preset);
      fetchWeather(preset);
    },
    [fetchWeather]
  );

  const sliderValue = Number.isFinite(value)
    ? clamp(value, sliderRange.min, sliderRange.max)
    : clamp(25, sliderRange.min, sliderRange.max);

  const sliderStep = (sliderRange.max - sliderRange.min) / 400 || 1;

  const hasKelvinValue = Number.isFinite(kelvinValue);

  const relativeSolarProgress = hasKelvinValue
    ? clamp((kelvinValue / SOLAR_SURFACE_K) * 100, 0, 130)
    : 0;

  const mood = Number.isFinite(celsiusValue)
    ? getThermalMood(celsiusValue)
    : null;

  const canAddHistory =
    Number.isFinite(value) &&
    Number.isFinite(celsiusValue) &&
    conversions.length > 0;

  return (
    <main className="w-full max-w-full py-12 pb-24">
      <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-10">
        <HeroSection presets={PRESETS} onPresetSelect={handlePresetSelect} />

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
              showSolarProgress={hasKelvinValue}
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

        <FactsSection facts={FACTS} />
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "切換為淺色主題" : "切換為深色主題"}
        aria-pressed={theme === "light"}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
          theme === "dark"
            ? "bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:outline-[#00CECB]"
            : "bg-[#FF5E5B] text-slate-900 hover:bg-[#ff766f] focus-visible:outline-[#00CECB]"
        }`}
        title={theme === "dark" ? "切換為淺色主題" : "切換為深色主題"}
      >
        <span className="text-2xl" role="img" aria-hidden="true">
          {theme === "dark" ? "🌙" : "☀️"}
        </span>
      </button>
    </main>
  );
}
