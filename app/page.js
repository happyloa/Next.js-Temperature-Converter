"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BoltIcon from "@mui/icons-material/Bolt";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import ExploreIcon from "@mui/icons-material/Explore";
import HistoryIcon from "@mui/icons-material/History";
import InsightsIcon from "@mui/icons-material/Insights";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ScienceIcon from "@mui/icons-material/Science";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Fade,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";

import styles from "./page.module.css";

const TEMPERATURE_SCALES = [
  {
    code: "celsius",
    label: "攝氏 (°C)",
    symbol: "°C",
    accent: "#38bdf8",
    toKelvin: (value) => value + 273.15,
    fromKelvin: (value) => value - 273.15,
  },
  {
    code: "fahrenheit",
    label: "華氏 (°F)",
    symbol: "°F",
    accent: "#f97316",
    toKelvin: (value) => ((value + 459.67) * 5) / 9,
    fromKelvin: (value) => (value * 9) / 5 - 459.67,
  },
  {
    code: "kelvin",
    label: "絕對溫標 (K)",
    symbol: "K",
    accent: "#22d3ee",
    toKelvin: (value) => value,
    fromKelvin: (value) => value,
  },
  {
    code: "rankine",
    label: "蘭氏 (°R)",
    symbol: "°R",
    accent: "#a855f7",
    toKelvin: (value) => (value * 5) / 9,
    fromKelvin: (value) => (value * 9) / 5,
  },
  {
    code: "reaumur",
    label: "列氏 (°Ré)",
    symbol: "°Ré",
    accent: "#34d399",
    toKelvin: (value) => value * 1.25 + 273.15,
    fromKelvin: (value) => (value - 273.15) * 0.8,
  },
  {
    code: "newton",
    label: "牛頓氏 (°N)",
    symbol: "°N",
    accent: "#fb7185",
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

const toInputString = (value) => {
  if (!Number.isFinite(value)) return "";
  const trimmed = Number(value.toFixed(4));
  return `${trimmed}`;
};

const formatTemperature = (value) => numberFormatter.format(value);

const getAdaptiveFontSize = (value) => {
  if (!Number.isFinite(value)) {
    return { xs: "2.1rem", md: "2.6rem" };
  }

  const formatted = formatTemperature(Math.abs(value));
  const digits = formatted.replace(/[^0-9]/g, "").length;

  if (digits >= 9) {
    return { xs: "1.6rem", md: "2.1rem" };
  }

  if (digits >= 7) {
    return { xs: "1.85rem", md: "2.3rem" };
  }

  return { xs: "2.1rem", md: "2.6rem" };
};

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

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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

  const handleScaleChange = (_event, nextScale) => {
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

  const handleSliderChange = (_event, sliderValue) => {
    const numeric = Array.isArray(sliderValue) ? sliderValue[0] : sliderValue;
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
    if (
      !Number.isFinite(value) ||
      !Number.isFinite(celsiusValue) ||
      conversions.length === 0
    ) {
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

  const handleWeatherSubmit = useCallback(() => {
    fetchWeather(weatherQuery);
  }, [fetchWeather, weatherQuery]);

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

  const relativeSolarProgress = Number.isFinite(kelvinValue)
    ? clamp((kelvinValue / SOLAR_SURFACE_K) * 100, 0, 130)
    : 0;

  return (
    <main className={`${styles.main}`}>
      <Container className={styles.content} maxWidth="lg">
        <Box className={styles.centeredArea}>
          <Stack spacing={{ xs: 6, md: 8 }} sx={{ width: "100%" }}>
            <Stack
              spacing={{ xs: 3.8, md: 4.8 }}
              alignItems="center"
              textAlign="center"
            >
              <Chip
                icon={<BoltIcon />}
                label="Multi-Scale Temperature Studio"
                variant="outlined"
                sx={{
                  borderColor: "rgba(148, 163, 184, 0.4)",
                  color: "#bae6fd",
                  backgroundColor: "rgba(30, 64, 175, 0.25)",
                }}
              />
              <Typography
                variant="h2"
                className={styles.heroTitle}
                fontSize={{ xs: 36, md: 48 }}
              >
                溫度實驗室 · 智慧轉換平台
              </Typography>
              <Typography
                variant="body1"
                maxWidth={640}
                color="text.secondary"
                sx={{ lineHeight: 1.7 }}
              >
                即時轉換六種常見與歷史溫標、加入情境分析與轉換紀錄。無論是烹飪、科研、工業或創作，
                這裡都能給你漂亮又專業的一站式體驗。
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                className={styles.chipRow}
                justifyContent="center"
                sx={{ width: "100%" }}
              >
                {PRESETS.map((preset) => (
                  <Chip
                    key={preset.label}
                    label={`${preset.emoji} ${preset.label}`}
                    onClick={() => handlePresetSelect(preset)}
                    variant="outlined"
                    sx={{
                      cursor: "pointer",
                      borderColor: "rgba(148, 163, 184, 0.35)",
                      color: "#f8fafc",
                      backgroundColor: "rgba(15, 23, 42, 0.65)",
                      "&:hover": {
                        backgroundColor: "rgba(56, 189, 248, 0.15)",
                      },
                    }}
                  />
                ))}
              </Stack>
            </Stack>

            <Grid container spacing={{ xs: 3.5, lg: 4.8 }}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <Card className={styles.glassCard}>
                  <CardContent className={styles.cardSection}>
                    <Stack spacing={{ xs: 3.5, md: 4.5 }}>
                      <Box>
                        <Stack
                          direction="row"
                          spacing={{ xs: 2.4, md: 3 }}
                          alignItems="center"
                          justifyContent="space-between"
                          flexWrap="wrap"
                          sx={{ rowGap: { xs: 1.6, md: 2.2 } }}
                        >
                          <Box>
                            <Typography variant="h5" fontWeight={700}>
                              輸入溫度
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              選擇欲輸入的溫標並輸入數值，即可同步取得所有單位結果。
                            </Typography>
                          </Box>
                          <Stack
                            direction="row"
                            spacing={{ xs: 1.5, sm: 1.9 }}
                            sx={{
                              flexWrap: "wrap",
                              justifyContent: { xs: "center", sm: "flex-end" },
                              rowGap: { xs: 1.2, md: 0.6 },
                            }}
                          >
                            <Button
                              startIcon={<RestartAltIcon />}
                              color="secondary"
                              variant="outlined"
                              onClick={handleReset}
                            >
                              重設
                            </Button>
                            <Button
                              startIcon={<HistoryIcon />}
                              variant="contained"
                              color="primary"
                              onClick={handleAddHistory}
                              disabled={conversions.length === 0}
                            >
                              加入紀錄
                            </Button>
                          </Stack>
                        </Stack>
                      </Box>

                      <ToggleButtonGroup
                        color="primary"
                        exclusive
                        value={scale}
                        onChange={handleScaleChange}
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          justifyContent: { xs: "center", sm: "flex-start" },
                          gap: { xs: 1.1, sm: 1.4 },
                        }}
                      >
                        {TEMPERATURE_SCALES.map((item) => (
                          <ToggleButton
                            key={item.code}
                            value={item.code}
                            sx={{
                              borderRadius: 2,
                              borderColor:
                                "rgba(148, 163, 184, 0.35) !important",
                              color:
                                item.code === scale ? item.accent : "inherit",
                              fontWeight: 600,
                              flexGrow: 1,
                              minWidth: { xs: "calc(50% - 0.75rem)", sm: 140 },
                              flexBasis: { xs: "calc(50% - 0.75rem)", sm: "auto" },
                            }}
                          >
                            {item.label}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>

                      <Stack spacing={{ xs: 3, sm: 3.4 }}>
                        <TextField
                          value={rawInput}
                          onChange={handleInputChange}
                          placeholder="輸入溫度值"
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <DeviceThermostatIcon
                                color="primary"
                                sx={{ mr: 1 }}
                              />
                            ),
                            endAdornment: (
                              <Typography
                                color="text.secondary"
                                fontWeight={600}
                              >
                                {activeScale?.symbol ?? ""}
                              </Typography>
                            ),
                          }}
                          sx={{
                            "& .MuiInputBase-root": {
                              fontSize: "1.25rem",
                              paddingY: { xs: 1.1, md: 1.3 },
                              paddingX: { xs: 1.25, md: 1.5 },
                            },
                          }}
                        />
                        <Slider
                          value={sliderValue}
                          min={sliderRange.min}
                          max={sliderRange.max}
                          step={(sliderRange.max - sliderRange.min) / 400}
                          onChange={handleSliderChange}
                          valueLabelDisplay="auto"
                          sx={{
                            color: activeScale?.accent ?? "#38bdf8",
                            "& .MuiSlider-rail": { opacity: 0.28 },
                            mt: { xs: 0.5, md: 0.75 },
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: { xs: 0.5, md: 0.75 } }}
                        >
                          範圍：{formatTemperature(sliderRange.min)}{" "}
                          {activeScale?.symbol} ~{" "}
                          {formatTemperature(sliderRange.max)}{" "}
                          {activeScale?.symbol}
                        </Typography>
                      </Stack>

                      <Grid container spacing={{ xs: 3.2, sm: 3.6 }}>
                        {conversions.map((item) => (
                          <Grid key={item.code} size={{ xs: 12, sm: 6 }}>
                            <Card
                              className={styles.resultCard}
                              sx={{
                                background: `linear-gradient(135deg, ${item.accent}33, rgba(15,23,42,0.92))`,
                                border: `1px solid ${item.accent}44`,
                              }}
                            >
                              <CardContent className={styles.innerCardSection}>
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="flex-start"
                                  spacing={{ xs: 1.4, md: 1.8 }}
                                >
                                  <Box>
                                    <Typography
                                      variant="overline"
                                      sx={{
                                        color: "rgba(226, 232, 240, 0.75)",
                                      }}
                                    >
                                      {item.label}
                                    </Typography>
                                    <Typography
                                      variant="h4"
                                      fontWeight={700}
                                      sx={{
                                        fontSize: getAdaptiveFontSize(item.result),
                                      }}
                                    >
                                      {formatTemperature(item.result)}{" "}
                                      {item.symbol}
                                    </Typography>
                                  </Box>
                                  <Tooltip
                                    title={
                                      copiedScale === item.code
                                        ? "已複製"
                                        : "複製結果"
                                    }
                                    placement="left"
                                    arrow
                                  >
                                    <span>
                                      <IconButton
                                        onClick={() =>
                                          handleCopy(
                                            `${formatTemperature(item.result)}`,
                                            item.code,
                                          )
                                        }
                                        color={
                                          copiedScale === item.code
                                            ? "secondary"
                                            : "default"
                                        }
                                      >
                                        <ContentCopyIcon fontSize="small" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </Stack>
                                {item.code === "celsius" && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mt={{ xs: 1.1, md: 1.4 }}
                                  >
                                    {getThermalMood(item.result).title}
                                  </Typography>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>

                      <Box>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={{ xs: 2.6, md: 3.2 }}
                          sx={{ flexWrap: "wrap", rowGap: { xs: 1.6, md: 0.4 } }}
                        >
                          <InsightsIcon color="secondary" />
                          <Typography variant="subtitle1" fontWeight={700}>
                            相對於太陽表面的能量比例
                          </Typography>
                        </Stack>
                        <Box mt={{ xs: 2.5, md: 3 }}>
                          <LinearProgress
                            variant="determinate"
                            value={relativeSolarProgress}
                            sx={{
                              height: 10,
                              borderRadius: 999,
                              backgroundColor: "rgba(148, 163, 184, 0.25)",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 999,
                                background:
                                  "linear-gradient(90deg, #38bdf8, #f472b6)",
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {Number.isFinite(kelvinValue)
                              ? `目前為太陽表面溫度的 ${formatTemperature(relativeSolarProgress)}%`
                              : "輸入溫度以分析熱能比例"}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, lg: 5 }}>
                <Stack spacing={{ xs: 3.6, md: 4.4 }}>
                  <Card className={styles.glassCard}>
                    <CardContent className={styles.cardSection}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={{ xs: 2.4, md: 3 }}
                        sx={{
                          flexWrap: "wrap",
                          rowGap: { xs: 1.4, md: 0 },
                          columnGap: { xs: 1.6, md: 0 },
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={{ xs: 2.1, md: 2.6 }}
                          alignItems="center"
                        >
                          <HistoryIcon color="primary" />
                          <Typography variant="h6" fontWeight={700}>
                            轉換紀錄
                          </Typography>
                        </Stack>
                        <Tooltip title="清除全部紀錄" arrow>
                          <span>
                            <IconButton
                              onClick={handleClearHistory}
                              disabled={history.length === 0}
                            >
                              <DeleteSweepIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>

                      <Divider
                        sx={{
                          my: { xs: 2.6, md: 3.1 },
                          borderColor: "rgba(148, 163, 184, 0.2)",
                        }}
                      />

                      {history.length === 0 ? (
                        <Fade in timeout={400}>
                          <Stack
                            spacing={2}
                            alignItems="center"
                            textAlign="center"
                            py={{ xs: 3.5, md: 4 }}
                            color="text.secondary"
                          >
                            <AutoAwesomeIcon
                              fontSize="large"
                              color="secondary"
                            />
                            <Typography variant="body1">還沒有紀錄</Typography>
                            <Typography variant="body2">
                              轉換完畢後按下「加入紀錄」，即可累積屬於你的溫度資料庫。
                            </Typography>
                          </Stack>
                        </Fade>
                      ) : (
                        <List
                          dense
                          sx={{
                            maxHeight: 360,
                            overflowY: "auto",
                            pr: 1,
                          }}
                        >
                          {history.map((item) => {
                            const summary = item.conversions.find(
                              (scaleItem) => scaleItem.code === "celsius",
                            );
                            const displayValue = summary
                              ? formatTemperature(summary.result)
                              : formatTemperature(item.value);
                            return (
                              <ListItem
                                key={item.id}
                                alignItems="flex-start"
                                sx={{
                                  borderRadius: 2,
                                  mb: { xs: 1.4, md: 1.9 },
                                  px: 1.7,
                                  backgroundColor: "rgba(15, 23, 42, 0.6)",
                                }}
                              >
                                <ListItemAvatar>
                                  <Avatar
                                    sx={{
                                      backgroundColor:
                                        "rgba(56, 189, 248, 0.2)",
                                      color: "#38bdf8",
                                    }}
                                  >
                                    <ScienceIcon fontSize="small" />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={`${formatTemperature(item.value)} ${getScale(item.scale)?.symbol ?? ""} → ${displayValue} °C`}
                                  secondary={
                                    <Stack spacing={0.75} mt={0.5}>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {timeFormatter.format(
                                          new Date(item.timestamp),
                                        )}
                                      </Typography>
                                      <Stack
                                        direction="row"
                                        spacing={{ xs: 1.1, md: 1.5 }}
                                        flexWrap="wrap"
                                        rowGap={0.75}
                                      >
                                        {item.conversions.map((result) => (
                                          <Chip
                                            key={result.code}
                                            size="small"
                                            label={`${formatTemperature(result.result)} ${result.symbol}`}
                                            sx={{
                                              backgroundColor:
                                                "rgba(30, 41, 59, 0.8)",
                                              borderRadius: 999,
                                              color: "#e2e8f0",
                                            }}
                                          />
                                        ))}
                                      </Stack>
                                    </Stack>
                                  }
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                      )}
                  </CardContent>
                </Card>

                <Card className={styles.glassCard}>
                  <CardContent className={styles.cardSection}>
                    <Stack
                      direction="row"
                      spacing={{ xs: 2.1, md: 2.6 }}
                      alignItems="center"
                      mb={{ xs: 2.4, md: 3 }}
                    >
                      <ExploreIcon color="secondary" />
                      <Typography variant="h6" fontWeight={700}>
                        全球氣象快查
                      </Typography>
                    </Stack>
                    <Stack spacing={{ xs: 2, md: 2.4 }}>
                      <TextField
                        value={weatherQuery}
                        onChange={(event) => setWeatherQuery(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleWeatherSubmit();
                          }
                        }}
                        placeholder="輸入城市或地區，例如：台北"
                        autoComplete="off"
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Stack
                        direction="row"
                        spacing={{ xs: 1.2, sm: 1.6 }}
                        sx={{ flexWrap: "wrap", rowGap: { xs: 1, sm: 1.2 } }}
                      >
                        {WEATHER_PRESETS.map((preset) => (
                          <Chip
                            key={preset}
                            label={preset}
                            variant={preset === weatherQuery ? "filled" : "outlined"}
                            color={preset === weatherQuery ? "primary" : "default"}
                            onClick={() => handleWeatherPreset(preset)}
                            sx={{
                              cursor: "pointer",
                              borderRadius: 999,
                              backgroundColor:
                                preset === weatherQuery
                                  ? "rgba(56, 189, 248, 0.15)"
                                  : "rgba(15, 23, 42, 0.65)",
                              color: preset === weatherQuery ? "#0ea5e9" : "#e2e8f0",
                            }}
                          />
                        ))}
                      </Stack>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleWeatherSubmit}
                        disabled={weatherLoading}
                        fullWidth
                        sx={{ py: { xs: 1.1, md: 1.2 } }}
                      >
                        {weatherLoading ? (
                          <Stack direction="row" spacing={1.2} alignItems="center">
                            <CircularProgress size={18} color="inherit" />
                            <span>查詢中</span>
                          </Stack>
                        ) : (
                          "取得即時天氣"
                        )}
                      </Button>
                    </Stack>

                    <Box mt={{ xs: 2.6, md: 3.2 }}>
                      {weatherError ? (
                        <Alert severity="warning" variant="outlined">
                          {weatherError}
                        </Alert>
                      ) : weatherData ? (
                        <Fade in timeout={400}>
                          <Stack
                            spacing={{ xs: 2, md: 2.4 }}
                            sx={{
                              backgroundColor: "rgba(15, 23, 42, 0.65)",
                              borderRadius: 3,
                              border: "1px solid rgba(148, 163, 184, 0.25)",
                              p: { xs: 2, md: 2.6 },
                            }}
                          >
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={{ xs: 1, sm: 1.8 }}
                              alignItems={{ xs: "flex-start", sm: "center" }}
                            >
                              <Stack direction="row" spacing={1.4} alignItems="center">
                                <CloudOutlinedIcon color="info" />
                                <Box>
                                  <Typography variant="subtitle1" fontWeight={700}>
                                    {weatherData.location}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {getWeatherDescription(weatherData.weatherCode)} · 觀測時間
                                    {" "}
                                    {formatWeatherTime(weatherData.observationTime)}
                                    {weatherData.timezone
                                      ? `（${weatherData.timezone}）`
                                      : ""}
                                  </Typography>
                                </Box>
                              </Stack>
                              <Chip
                                label={`體感 ${formatOptionalMetric(weatherData.apparentTemperature, "°C")}`}
                                color="primary"
                                sx={{
                                  backgroundColor: "rgba(56, 189, 248, 0.15)",
                                  color: "#38bdf8",
                                }}
                              />
                            </Stack>

                            <Stack spacing={{ xs: 1.4, md: 1.8 }}>
                              <Typography variant="h3" fontWeight={700}>
                                {formatOptionalMetric(weatherData.temperature, "°C")}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                將即時天氣帶入轉換流程，快速比較實驗室設定與當地環境條件。
                              </Typography>
                            </Stack>

                            <Grid container spacing={{ xs: 1.8, md: 2.4 }}>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Stack spacing={0.6}>
                                  <Typography
                                    variant="overline"
                                    sx={{ color: "rgba(226, 232, 240, 0.65)" }}
                                  >
                                    相對濕度
                                  </Typography>
                                  <Typography variant="h6" fontWeight={600}>
                                    {formatOptionalMetric(weatherData.humidity, "%")}
                                  </Typography>
                                </Stack>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Stack spacing={0.6}>
                                  <Typography
                                    variant="overline"
                                    sx={{ color: "rgba(226, 232, 240, 0.65)" }}
                                  >
                                    風速
                                  </Typography>
                                  <Typography variant="h6" fontWeight={600}>
                                    {formatOptionalMetric(weatherData.windSpeed, " m/s")}
                                  </Typography>
                                </Stack>
                              </Grid>
                            </Grid>
                          </Stack>
                        </Fade>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          查詢任何城市，了解環境背景後再進行溫度轉換與安全判讀。
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                <Card className={styles.glassCard}>
                  <CardContent className={styles.cardSection}>
                      <Stack
                        direction="row"
                        spacing={{ xs: 2.1, md: 2.6 }}
                        alignItems="center"
                        mb={{ xs: 2.6, md: 3.1 }}
                      >
                        <InsightsIcon color="primary" />
                        <Typography variant="h6" fontWeight={700}>
                          溫度洞察
                        </Typography>
                      </Stack>
                      <Grid container spacing={{ xs: 3.1, md: 3.6 }}>
                        {insights.map((insight) => (
                          <Grid key={insight.title} size={12}>
                            <Card
                              sx={{
                                backgroundColor: "rgba(30, 41, 59, 0.7)",
                                borderRadius: 3,
                              }}
                            >
                              <CardContent
                                className={styles.compactCardSection}
                              >
                                <Stack
                                  direction="row"
                                  spacing={{ xs: 2.1, md: 2.6 }}
                                  alignItems="center"
                                >
                                  <Typography fontSize={26}>
                                    {insight.icon}
                                  </Typography>
                                  <Box>
                                    <Typography
                                      variant="subtitle1"
                                      fontWeight={700}
                                    >
                                      {insight.title}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {insight.description}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </Grid>

            <Card className={styles.glassCard}>
              <CardContent className={styles.cardSection}>
                <Stack
                  direction="row"
                  spacing={{ xs: 2.1, md: 2.6 }}
                  alignItems="center"
                  mb={{ xs: 3, md: 3.5 }}
                >
                  <AutoAwesomeIcon color="secondary" />
                  <Typography variant="h6" fontWeight={700}>
                    作品亮點
                  </Typography>
                </Stack>
                <Grid container spacing={{ xs: 3.4, md: 4.2 }}>
                  {FACTS.map((fact) => (
                    <Grid key={fact.title} size={{ xs: 12, md: 4 }}>
                      <Card
                        sx={{
                          height: "100%",
                          background: "rgba(15, 23, 42, 0.78)",
                          border: "1px solid rgba(148, 163, 184, 0.2)",
                        }}
                      >
                        <CardContent className={styles.innerCardSection}>
                          <Stack spacing={{ xs: 2.1, md: 2.6 }}>
                            <Typography fontSize={32}>{fact.icon}</Typography>
                            <Typography variant="subtitle1" fontWeight={700}>
                              {fact.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {fact.description}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Container>
    </main>
  );
}
