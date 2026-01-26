import type { FormEvent } from "react";

import type { WeatherData } from "../types/weather";
import { WeatherChart } from "./WeatherChart";

/**
 * 小工具：動態組合 Tailwind class。
 */
const classNames = (
  ...values: Array<string | false | null | undefined>
): string => values.filter(Boolean).join(" ");

type WeatherSectionProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  presets: string[];
  onPresetSelect: (preset: string) => void;
  loading: boolean;
  error: string | null;
  data: WeatherData | null;
  formatOptionalMetric: (value: number, suffix?: string) => string;
  formatWeatherTime: (value: string | null) => string;
  getWeatherDescription: (code: number) => string;
  formatLocalClock: (
    value: string | null,
    timezone: string | null | undefined,
    options?: { withSeconds?: boolean }
  ) => string;
  formatUtcOffset: (value: string | null) => string;
  formatCoordinate: (value: number | null) => string;
  formatWeekday: (index: number | null) => string;
  onGeolocate?: () => void;
  geolocating?: boolean;
  forecastDays?: 7 | 14;
  onForecastDaysChange?: (days: 7 | 14) => void;
};

/**
 * 天氣與環境儀表板，呈現查詢地點的即時與日常數據。
 */
export function WeatherSection({
  query,
  onQueryChange,
  onSubmit,
  presets,
  onPresetSelect,
  loading,
  error,
  data,
  formatOptionalMetric,
  formatWeatherTime,
  getWeatherDescription,
  formatLocalClock,
  formatUtcOffset,
  formatCoordinate,
  formatWeekday,
  onGeolocate,
  geolocating = false,
  forecastDays = 7,
  onForecastDaysChange,
}: WeatherSectionProps) {
  const toCardinalCoordinate = (
    value: number | null,
    positive: string,
    negative: string
  ): string => {
    if (!Number.isFinite(value)) return "--";
    const direction = (value ?? 0) >= 0 ? positive : negative;
    return `${formatCoordinate(Math.abs(value ?? 0))}°${direction}`;
  };

  const climateHighlights = data
    ? (
      [
        {
          label: "體感溫度",
          value: data.apparentTemperature,
          unit: data.apparentTemperatureUnit ?? "°C",
        },
        {
          label: "日最高",
          value: data.dailyHigh,
          unit: data.dailyTemperatureUnit ?? "°C",
        },
        {
          label: "日最低",
          value: data.dailyLow,
          unit: data.dailyTemperatureUnit ?? "°C",
        },
      ] satisfies Array<{ label: string; value: number; unit: string }>
    ).filter((item) => Number.isFinite(item.value))
    : [];

  const environmentMetrics = data
    ? (
      [
        {
          label: "相對濕度",
          value: data.humidity,
          unit: data.humidityUnit ?? "%",
        },
        {
          label: "風速",
          value: data.windSpeed,
          unit: data.windSpeedUnit ? ` ${data.windSpeedUnit}` : " m/s",
        },
        {
          label: "氣壓",
          value: data.pressure,
          unit: data.pressureUnit ? ` ${data.pressureUnit}` : " hPa",
        },
        {
          label: "降水量",
          value: data.precipitation,
          unit: data.precipitationUnit ? ` ${data.precipitationUnit}` : " mm",
        },
        {
          label: "紫外線指數",
          value: data.uvIndex,
          unit: data.uvIndexUnit ?? "",
        },
      ] satisfies Array<{ label: string; value: number; unit: string }>
    ).filter((item) => Number.isFinite(item.value))
    : [];

  const coordinatesText = data?.coordinates
    ? `${toCardinalCoordinate(
      data.coordinates.latitude,
      "N",
      "S"
    )} · ${toCardinalCoordinate(data.coordinates.longitude, "E", "W")}`
    : null;

  const airQualityTime = data?.airQuality?.time
    ? formatLocalClock(data.airQuality.time, data.timezone, {
      withSeconds: false,
    })
    : "--";

  return (
    <section className="w-full min-w-0 space-y-8 rounded-3xl border border-slate-700/40 bg-slate-900/70 p-6 shadow-glass backdrop-blur sm:p-8">
      {/* Header Area with Integrated Search */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-3 lg:max-w-md">
          <div className="flex items-center gap-3 text-slate-200">
            <span className="text-xl">☁️</span>
            <h2 className="text-xl font-semibold">全球環境儀表板</h2>
          </div>
          <p className="text-sm text-slate-300">
            串接 Open-Meteo 天氣與 World Time API，讓溫度轉換具備完整的情境背景。
          </p>
        </div>

        <form onSubmit={onSubmit} className="w-full space-y-4 lg:w-auto lg:min-w-[400px]">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-700/60 bg-slate-900/70 px-4 py-3">
            <span className="text-lg">📍</span>
            <input
              type="text"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="輸入城市名稱"
              className="flex-1 bg-transparent text-sm font-semibold text-slate-100 outline-none"
            />
            {onGeolocate && (
              <button
                type="button"
                onClick={onGeolocate}
                disabled={geolocating || loading}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                title="使用目前位置"
                aria-label="定位"
              >
                {geolocating ? (
                  <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-300/50 border-t-transparent" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="ml-2 rounded-lg bg-[#00CECB]/10 px-3 py-1.5 text-xs font-semibold text-[#00CECB] hover:bg-[#00CECB]/20 disabled:opacity-50"
            >
              查詢
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onPresetSelect(preset)}
                className={classNames(
                  "rounded-full border border-slate-700/40 bg-slate-900/40 px-3 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors",
                  query === preset ? "bg-[#00CECB]/10 text-[#00CECB] border-[#00CECB]/30" : ""
                )}
              >
                {preset}
              </button>
            ))}
          </div>
        </form>
      </div>

      <div>
        {error ? (
          <p className="rounded-2xl border border-[#FF5E5B]/60 bg-[#FF5E5B]/10 p-4 text-sm text-[#FF5E5B]">
            {error}
          </p>
        ) : loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-3xl border border-slate-700/40 bg-slate-950/60 p-6 text-sm text-slate-300">
            <span className="inline-flex h-10 w-10 animate-spin rounded-full border-2 border-[#00CECB]/70 border-t-transparent" />
            正在取得環境資訊...
          </div>
        ) : data ? (
          <div className="min-w-0 space-y-8">
            {/* Main Data Grid - 4 Columns */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

              {/* Col 1: Location & Current Status */}
              <div className="rounded-3xl border border-slate-700/40 bg-slate-950/60 p-6 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-bold text-slate-100">{data.location}</p>
                      <p className="text-xs text-slate-400">{data.administrative.join(", ")}</p>
                    </div>
                    <span className="text-3xl">{getWeatherDescription(data.weatherCode).includes("晴") ? "☀️" : "☁️"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                    <span className="theme-badge">
                      {formatLocalClock(data.localTime, data.timezone, { withSeconds: false })}
                    </span>
                    {coordinatesText && <span className="theme-badge">{coordinatesText}</span>}
                  </div>
                </div>
                <div>
                  <p className="text-5xl font-bold text-slate-50 tracking-tight">
                    {formatOptionalMetric(data.temperature, data.temperatureUnit ?? "°C")}
                  </p>
                  <p className="mt-2 text-sm text-slate-400 font-medium">
                    {getWeatherDescription(data.weatherCode)}
                  </p>
                </div>
              </div>

              {/* Col 2: Highlights */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">氣溫極值</h3>
                {climateHighlights.length ? (
                  <div className="grid h-full gap-3">
                    {climateHighlights.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-2xl border border-slate-700/40 bg-slate-900/60 px-5 py-4"
                      >
                        <span className="text-sm text-slate-400">{item.label}</span>
                        <p className="text-lg font-semibold text-slate-100">
                          {formatOptionalMetric(item.value, item.unit)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-700/40 bg-slate-900/40 p-4 text-xs text-slate-500">
                    無資料
                  </div>
                )}
              </div>

              {/* Col 3: Metrics */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">環境指標</h3>
                {environmentMetrics.length ? (
                  <div className="rounded-3xl border border-slate-700/40 bg-slate-900/60 p-5 h-full">
                    <div className="grid gap-4">
                      {environmentMetrics.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between text-sm text-slate-200"
                        >
                          <span className="text-slate-400">{item.label}</span>
                          <span className="font-semibold font-mono">
                            {formatOptionalMetric(item.value, item.unit)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-700/40 bg-slate-900/40 p-4 text-xs text-slate-500">
                    無資料
                  </div>
                )}
              </div>

              {/* Col 4: Air Quality */}
              <div className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">空氣品質</h3>
                  <span className="text-[10px] text-slate-500">{airQualityTime}</span>
                </div>
                <div className="rounded-3xl border border-slate-700/40 bg-slate-900/60 p-5 h-full flex flex-col justify-between">
                  {data.airQuality ? (
                    <>
                      <div className="text-center py-2">
                        <p className="text-4xl font-bold text-slate-50">
                          {formatOptionalMetric(data.airQuality.aqi, "")}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">AQI 指數</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm border-b border-slate-700/50 pb-2">
                          <span className="text-slate-400">PM2.5</span>
                          <span className="font-mono text-slate-200">{formatOptionalMetric(data.airQuality.pm25, "")}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">PM10</span>
                          <span className="font-mono text-slate-200">{formatOptionalMetric(data.airQuality.pm10, "")}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-500">
                      暫無資料
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* 7-Day Trend Chart */}
            {data.dailyForecast.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  {onForecastDaysChange && (
                    <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-700/40">
                      <button
                        onClick={() => onForecastDaysChange(7)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${forecastDays === 7 ? 'bg-[#00CECB]/20 text-[#00CECB] shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        7 天
                      </button>
                      <button
                        onClick={() => onForecastDaysChange(14)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${forecastDays === 14 ? 'bg-[#00CECB]/20 text-[#00CECB] shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        14 天
                      </button>
                    </div>
                  )}
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">溫度趨勢</h3>
                </div>
                <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60 p-5">
                  <WeatherChart
                    data={data.dailyForecast}
                    unit={data.dailyTemperatureUnit}
                  />
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500">
              若需更精細的自動化流程，可將這些 API 串接至監控儀表板或報表系統中。
            </p>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-700/40 bg-slate-900/60 p-4 text-sm text-slate-400">
            查詢任何城市，了解環境背景後再進行溫度轉換與安全判讀。
          </p>
        )}
      </div>
    </section>
  );
}
