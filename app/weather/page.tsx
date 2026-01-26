"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { WeatherChart } from "../components/WeatherChart";
import { useWeatherDashboard } from "../hooks/useWeatherDashboard";
import { getWeatherDescription, WEATHER_PRESETS } from "../lib/weather";
import {
    formatCoordinate,
    formatLocalClock,
    formatOptionalMetric,
    formatUtcOffset,
    formatWeatherTime,
    formatWeekday,
} from "../lib/format";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function WeatherPage() {
    const {
        weatherQuery,
        setWeatherQuery,
        weatherData,
        weatherLoading,
        weatherError,
        handleWeatherSubmit,
        handleWeatherPreset,
        handleGeolocate,
        geolocating,
        forecastDays,
        setForecastDays,
        forecastLoading,
    } = useWeatherDashboard("高雄");

    const [activeTab, setActiveTab] = useState<"overview" | "details">("overview");

    const climateHighlights = useMemo(() => {
        if (!weatherData) return [];
        return [
            {
                label: "體感溫度",
                value: weatherData.apparentTemperature,
                unit: weatherData.apparentTemperatureUnit ?? "°C",
                icon: "🌡️",
                desc: "實際感受"
            },
            {
                label: "紫外線",
                value: weatherData.uvIndex,
                unit: weatherData.uvIndexUnit ?? "",
                icon: "☀️",
                desc: weatherData.uvIndex > 11 ? "危險級" : weatherData.uvIndex > 8 ? "過量級" : "一般"
            },
            {
                label: "降雨量",
                value: weatherData.precipitation,
                unit: weatherData.precipitationUnit ?? "mm",
                icon: "🌧️",
                desc: "過去一小時"
            },
        ].filter((item) => Number.isFinite(item.value));
    }, [weatherData]);

    const environmentMetrics = useMemo(() => {
        if (!weatherData) return [];
        return [
            {
                label: "相對濕度",
                value: weatherData.humidity,
                unit: weatherData.humidityUnit ?? "%",
                icon: "💧",
            },
            {
                label: "風速",
                value: weatherData.windSpeed,
                unit: weatherData.windSpeedUnit ? ` ${weatherData.windSpeedUnit}` : " m/s",
                icon: "🌬️",
            },
            {
                label: "氣壓",
                value: weatherData.pressure,
                unit: weatherData.pressureUnit ? ` ${weatherData.pressureUnit}` : " hPa",
                icon: "📉",
            },
        ].filter((item) => Number.isFinite(item.value));
    }, [weatherData]);

    const coordinatesText = weatherData?.coordinates
        ? `${Math.abs(weatherData.coordinates.latitude)}°${weatherData.coordinates.latitude >= 0 ? "N" : "S"} · ${Math.abs(weatherData.coordinates.longitude)}°${weatherData.coordinates.longitude >= 0 ? "E" : "W"}`
        : null;

    return (
        <main className="min-h-screen w-full bg-slate-50 dark:bg-[#0B0C15] text-slate-900 dark:text-slate-100 selection:bg-[#00CECB]/30 transition-colors duration-300">

            {/* 1. Navbar / Header Section */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0B0C15]/80 backdrop-blur-xl transition-colors duration-300">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            className="group flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-white/5 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 transition-transform group-hover:-translate-x-1">
                                <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clipRule="evenodd" />
                            </svg>
                            <span>返回轉換器</span>
                        </Link>
                        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
                        <h1 className="text-xl font-bold tracking-tight hidden sm:block text-slate-900 dark:text-slate-100">
                            全球環境監測中心
                        </h1>
                    </div>

                    <form onSubmit={handleWeatherSubmit} className="relative w-full max-w-md ml-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <span className="text-slate-500 group-focus-within:text-[#00CECB] transition-colors">📍</span>
                            </div>
                            <input
                                type="text"
                                value={weatherQuery}
                                onChange={(e) => setWeatherQuery(e.target.value)}
                                placeholder="搜尋全球城市..."
                                className="block w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 py-2.5 pl-10 pr-12 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:border-[#00CECB]/50 focus:bg-white dark:focus:bg-white/10 focus:ring-1 focus:ring-[#00CECB]/50 transition-all outline-none"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
                                {handleGeolocate && (
                                    <button
                                        type="button"
                                        onClick={handleGeolocate}
                                        disabled={geolocating || weatherLoading}
                                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
                                        title="定位目前位置"
                                    >
                                        {geolocating ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </header>

            {/* 2. Main Content Area */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Presets Bar */}
                <div className="mb-8 flex flex-wrap gap-2">
                    {WEATHER_PRESETS.map((preset) => (
                        <button
                            key={preset}
                            onClick={() => handleWeatherPreset(preset)}
                            className={cn(
                                "rounded-full px-4 py-1.5 text-xs font-medium transition-all border",
                                weatherQuery === preset
                                    ? "bg-[#00CECB]/10 text-[#00CECB] border-[#00CECB]/30"
                                    : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-slate-200 shadow-sm dark:shadow-none"
                            )}
                        >
                            {preset}
                        </button>
                    ))}
                </div>

                {weatherError ? (
                    <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center text-red-400">
                        <p className="text-lg font-medium">{weatherError}</p>
                        <p className="mt-2 text-sm opacity-70">請檢查城市名稱或網路連線</p>
                    </div>
                ) : weatherLoading ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-800/50 py-20">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00CECB]/30 border-t-[#00CECB]"></div>
                        <p className="mt-4 animate-pulse text-sm text-slate-500 dark:text-slate-400">衛星連線中...</p>
                    </div>
                ) : weatherData ? (
                    <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">

                        {/* 2.1 Hero Section: Big Data Display */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Left: Main Status (Span 2) */}
                            <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/50 dark:border-white/10 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-[#1A1C2E] p-8 lg:col-span-2 shadow-2xl dark:shadow-none">
                                <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight sm:text-4xl">{weatherData.location}</h2>
                                            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                <span>{weatherData.administrative.join(", ")}</span>
                                                {coordinatesText && <span className="rounded-full bg-slate-200 dark:bg-white/5 px-2 py-0.5 text-xs font-mono">{coordinatesText}</span>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-4xl">{getWeatherDescription(weatherData.weatherCode).includes("晴") ? "☀️" : "☁️"}</span>
                                            <span className="mt-1 block text-sm font-medium text-[#00CECB]">{getWeatherDescription(weatherData.weatherCode)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-end gap-6">
                                        <div className="flex-1">
                                            <div className="text-[6rem] font-bold leading-none tracking-tighter text-slate-900 dark:text-slate-50 sm:text-[8rem]">
                                                {Math.round(weatherData.temperature)}
                                                <span className="text-3xl text-slate-500 align-super font-light ml-2">{weatherData.temperatureUnit}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1 pb-4 text-right">
                                            <div className="text-lg text-slate-600 dark:text-slate-300">
                                                {formatLocalClock(weatherData.localTime, weatherData.timezone, { withSeconds: false })}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {formatUtcOffset(weatherData.utcOffset)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Background Decoration */}
                                <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#00CECB]/5 blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 h-full w-full bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>

                            {/* Right: Summary Cards (Span 1) */}
                            <div className="grid gap-4 grid-rows-3 h-full">
                                {climateHighlights.map((item, i) => (
                                    <div key={item.label} className="flex items-center justify-between rounded-3xl border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-white/5 px-6 py-4 hover:bg-white dark:hover:bg-white/10 transition-colors shadow-sm dark:shadow-none">
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl">{item.icon}</span>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                                                <span className="text-xs text-slate-400 dark:text-slate-500">{item.desc}</span>
                                            </div>
                                        </div>
                                        <span className="text-xl font-bold text-slate-900 dark:text-slate-200">
                                            {formatOptionalMetric(item.value, item.unit)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2.2 Metrics Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {/* Air Quality */}
                            <div className="col-span-1 md:col-span-2 rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#121420] p-6 shadow-sm dark:shadow-none">
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                                        <span className="text-lg">🍃</span> 空氣品質
                                    </h3>
                                    {weatherData.airQuality && (
                                        <span className={`px-2 py-1 text-xs font-bold rounded bg-emerald-500/20 text-emerald-400`}>
                                            良好
                                        </span>
                                    )}
                                </div>

                                {weatherData.airQuality ? (
                                    <div className="flex items-center justify-between gap-8">
                                        <div className="text-center">
                                            <div className="text-5xl font-bold text-slate-900 dark:text-slate-100">{weatherData.airQuality.aqi}</div>
                                            <div className="mt-2 text-xs text-slate-500">AQI 指數</div>
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                                                <span className="text-sm text-slate-500 dark:text-slate-400">PM2.5</span>
                                                <span className="font-mono text-slate-900 dark:text-slate-200">{formatOptionalMetric(weatherData.airQuality.pm25, weatherData.airQuality.pm25Unit)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-slate-500 dark:text-slate-400">PM10</span>
                                                <span className="font-mono text-slate-900 dark:text-slate-200">{formatOptionalMetric(weatherData.airQuality.pm10, weatherData.airQuality.pm10Unit)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex h-32 items-center justify-center text-sm text-slate-500">暫無資料</div>
                                )}
                            </div>

                            {/* Environment Metrics */}
                            {environmentMetrics.map((item) => (
                                <div key={item.label} className="rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#121420] p-6 hover:border-slate-300 dark:hover:border-white/20 transition-colors shadow-sm dark:shadow-none">
                                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</h3>
                                    <div className="flex items-end justify-between">
                                        <span className="text-3xl font-bold text-slate-900 dark:text-slate-200">{formatOptionalMetric(item.value, item.unit)}</span>
                                        <span className="text-2xl opacity-50 grayscale dark:grayscale-0">{item.icon}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 2.3 Forecast Chart */}
                        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#121420] p-8 shadow-sm dark:shadow-none transition-all">
                            {forecastLoading && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-[1px] transition-all duration-300">
                                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00CECB] border-t-transparent shadow-lg" />
                                </div>
                            )}
                            <div className={cn("transition-opacity duration-300", forecastLoading ? "opacity-30 blur-[1px]" : "opacity-100")}>
                                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">溫度趨勢預報</h3>
                                        <p className="text-sm text-slate-500">未來 {forecastDays} 天的高低溫變化趨勢</p>
                                    </div>

                                    <div className="flex items-center rounded-xl bg-slate-100 dark:bg-white/5 p-1">
                                        <button
                                            onClick={() => setForecastDays(7)}
                                            className={cn(
                                                "px-4 py-1.5 text-xs font-medium rounded-lg transition-all",
                                                forecastDays === 7 ? "bg-[#00CECB]/20 text-[#00CECB] shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                            )}
                                        >
                                            7 天
                                        </button>
                                        <button
                                            onClick={() => setForecastDays(14)}
                                            className={cn(
                                                "px-4 py-1.5 text-xs font-medium rounded-lg transition-all",
                                                forecastDays === 14 ? "bg-[#00CECB]/20 text-[#00CECB] shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                            )}
                                        >
                                            14 天
                                        </button>
                                    </div>
                                </div>

                                {weatherData.dailyForecast.length > 0 && (
                                    <div className="h-[400px] w-full">
                                        <WeatherChart
                                            data={weatherData.dailyForecast}
                                            unit={weatherData.dailyTemperatureUnit}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-white/10 p-12 text-center text-slate-500">
                        <span className="text-4xl mb-4">🌍</span>
                        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">開始探索全球氣候</p>
                        <p className="mt-2 text-sm">輸入任何城市名稱，取得即時環境數據與預報</p>
                    </div>
                )}
            </div>
        </main>
    );
}
