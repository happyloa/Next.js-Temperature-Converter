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
    <section className="w-full min-w-0 space-y-8 rounded-3xl border border-slate-700/40 bg-slate-900/70 p-6 shadow-glass backdrop-blur sm:p-7">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-slate-200">
          <span className="text-xl">☁️</span>
          <h2 className="text-xl font-semibold">全球環境儀表板</h2>
        </div>
        <p className="text-sm text-slate-300">
          串接 Open-Meteo 天氣與 World Time API，讓溫度轉換具備完整的情境背景。
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
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
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onPresetSelect(preset)}
              className={classNames(
                "theme-chip w-full md:w-auto",
                query === preset ? "theme-chip--active" : ""
              )}
            >
              {preset}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="theme-primary-button w-full"
        >
          {loading ? (
            <>
              <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-[#00CECB]/70 border-t-transparent" />
              取得資料中...
            </>
          ) : (
            "取得即時環境資料"
          )}
        </button>
      </form>

      <div>
        {error ? (
          <p className="rounded-2xl border border-[#FF5E5B]/60 bg-[#FF5E5B]/10 p-4 text-sm text-[#FF5E5B]">
            {error}
          </p>
        ) : loading ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-3xl border border-slate-700/40 bg-slate-950/60 p-6 text-sm text-slate-300">
            <span className="inline-flex h-10 w-10 animate-spin rounded-full border-2 border-[#00CECB]/70 border-t-transparent" />
            正在取得環境資訊...
          </div>
        ) : data ? (
          <div className="min-w-0 space-y-7 rounded-3xl border border-slate-700/40 bg-slate-950/60 p-6">
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex flex-col gap-1 text-slate-200">
                <p className="text-base font-semibold text-slate-100">
                  {data.location}
                </p>
                {data.administrative.length ? (
                  <p className="text-xs text-slate-400">
                    {data.administrative.join(" · ")}
                  </p>
                ) : null}
                <p className="text-xs text-slate-400">
                  {getWeatherDescription(data.weatherCode)} · 觀測時間 {formatWeatherTime(data.observationTime)}
                  {data.timezoneAbbreviation ? `（${data.timezoneAbbreviation}）` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {data.localTime ? (
                  <span className="theme-badge">
                    🕑 當地 {formatLocalClock(data.localTime, data.timezone, {
                      withSeconds: true,
                    })}
                  </span>
                ) : null}
                {data.utcOffset ? (
                  <span className="theme-badge">
                    ⏱️ {formatUtcOffset(data.utcOffset)}
                    {Number.isFinite(data.dayOfWeek)
                      ? `· ${formatWeekday(data.dayOfWeek)}`
                      : ""}
                  </span>
                ) : null}
                {coordinatesText ? (
                  <span className="theme-badge">📡 {coordinatesText}</span>
                ) : null}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column: Temperature & Highlights */}
              <div className="min-w-0 space-y-5">
                <div className="space-y-3">
                  <p className="text-4xl font-bold text-slate-50">
                    {formatOptionalMetric(data.temperature, data.temperatureUnit ?? "°C")}
                  </p>
                  <p className="text-sm text-slate-300">
                    將即時環境條件與溫度轉換結合，減少外部誤差與判斷成本。
                  </p>
                </div>
                {climateHighlights.length ? (
                  <div className="grid gap-3">
                    {climateHighlights.map((item) => (
                      <div
                        key={item.label}
                        className="min-w-0 space-y-1 rounded-2xl border border-slate-700/40 bg-slate-900/60 p-3"
                      >
                        <span className="text-xs uppercase tracking-wide text-slate-400">
                          {item.label}
                        </span>
                        <p className="text-lg font-semibold text-slate-100">
                          {formatOptionalMetric(item.value, item.unit)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-700/40 bg-slate-900/40 p-3 text-xs text-slate-400">
                    目前無可用的溫度極值資料。
                  </p>
                )}
              </div>

              {/* Right Column: Metrics & Air Quality */}
              <div className="space-y-6">
                {environmentMetrics.length ? (
                  <div className="min-w-0 space-y-3 rounded-2xl border border-slate-700/40 bg-slate-900/60 p-5">
                    <span className="text-xs uppercase tracking-wide text-slate-400">
                      環境指標
                    </span>
                    <div className="grid gap-3">
                      {environmentMetrics.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between text-sm text-slate-200"
                        >
                          <span>{item.label}</span>
                          <span className="font-semibold">
                            {formatOptionalMetric(item.value, item.unit)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="min-w-0 space-y-2 rounded-2xl border border-dashed border-slate-700/40 bg-slate-900/40 p-5 text-sm text-slate-400">
                    <span className="text-xs uppercase tracking-wide text-slate-500">
                      環境指標
                    </span>
                    <p>目前沒有可用的環境指標資料。</p>
                  </div>
                )}

                <div className="min-w-0 space-y-3 rounded-2xl border border-slate-700/40 bg-slate-900/60 p-5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="uppercase tracking-wide text-slate-300">
                      空氣品質
                    </span>
                    <span>更新 {airQualityTime}</span>
                  </div>
                  {data.airQuality ? (
                    <div className="space-y-4">
                      <p className="text-3xl font-bold text-slate-50">
                        {formatOptionalMetric(data.airQuality.aqi, data.airQuality.aqiUnit ?? "")}
                      </p>
                      <div className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-700/40 bg-slate-950/60 px-3 py-3">
                          <span className="text-xs uppercase tracking-wide text-slate-400">
                            PM2.5
                          </span>
                          <p className="font-semibold">
                            {formatOptionalMetric(
                              data.airQuality.pm25,
                              data.airQuality.pm25Unit ? ` ${data.airQuality.pm25Unit}` : ""
                            )}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-700/40 bg-slate-950/60 px-3 py-3">
                          <span className="text-xs uppercase tracking-wide text-slate-400">
                            PM10
                          </span>
                          <p className="font-semibold">
                            {formatOptionalMetric(
                              data.airQuality.pm10,
                              data.airQuality.pm10Unit ? ` ${data.airQuality.pm10Unit}` : ""
                            )}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        數據來源：Open-Meteo Air Quality API
                      </p>
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-slate-700/40 bg-slate-950/40 px-3 py-4 text-xs text-slate-400">
                      此地點暫無空氣品質資訊。
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 7-Day Trend Chart */}
            {data.dailyForecast.length > 0 && (
              <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60 p-5">
                <WeatherChart
                  data={data.dailyForecast}
                  unit={data.dailyTemperatureUnit}
                />
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
