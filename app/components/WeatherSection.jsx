const classNames = (...values) => values.filter(Boolean).join(" ");

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
  formatDayLength,
  formatUtcOffset,
  formatCoordinate,
  formatWeekday,
}) {
  const toCardinalCoordinate = (value, positive, negative) => {
    if (!Number.isFinite(value)) return "--";
    const direction = value >= 0 ? positive : negative;
    return `${formatCoordinate(Math.abs(value))}°${direction}`;
  };

  const climateHighlights = data
    ? [
        {
          label: "體感溫度",
          value: formatOptionalMetric(
            data.apparentTemperature,
            data.apparentTemperatureUnit ?? "°C",
          ),
        },
        {
          label: "日最高",
          value: formatOptionalMetric(data.dailyHigh, data.dailyTemperatureUnit ?? "°C"),
        },
        {
          label: "日最低",
          value: formatOptionalMetric(data.dailyLow, data.dailyTemperatureUnit ?? "°C"),
        },
      ]
    : [];

  const environmentMetrics = data
    ? [
        {
          label: "相對濕度",
          value: formatOptionalMetric(data.humidity, data.humidityUnit ?? "%"),
        },
        {
          label: "風速",
          value: formatOptionalMetric(
            data.windSpeed,
            data.windSpeedUnit ? ` ${data.windSpeedUnit}` : " m/s",
          ),
        },
        {
          label: "氣壓",
          value: formatOptionalMetric(
            data.pressure,
            data.pressureUnit ? ` ${data.pressureUnit}` : " hPa",
          ),
        },
        {
          label: "降水量",
          value: formatOptionalMetric(
            data.precipitation,
            data.precipitationUnit ? ` ${data.precipitationUnit}` : " mm",
          ),
        },
        {
          label: "紫外線指數",
          value: formatOptionalMetric(data.uvIndex, data.uvIndexUnit ?? ""),
        },
      ]
    : [];

  const coordinatesText = data?.coordinates
    ? `${toCardinalCoordinate(data.coordinates.latitude, "N", "S")} · ${toCardinalCoordinate(
        data.coordinates.longitude,
        "E",
        "W",
      )}`
    : null;

  const airQualityTime = data?.airQuality?.time
    ? formatLocalClock(data.airQuality.time, data.timezone, { withSeconds: false })
    : "--";

  return (
    <section className="w-full min-w-0 space-y-6 rounded-3xl border border-slate-700/40 bg-slate-900/70 p-5 shadow-glass backdrop-blur sm:p-6 md:p-7">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-slate-200">
          <span className="text-xl">☁️</span>
          <h2 className="text-xl font-semibold">全球環境儀表板</h2>
        </div>
        <p className="text-sm text-slate-300">
          串接 Open-Meteo 天氣、World Time API 與 Sunrise-Sunset 日照資訊，讓溫度轉換具備完整的情境背景。
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/70 px-4 py-3">
          <span className="text-lg">📍</span>
          <input
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="輸入城市名稱"
            className="flex-1 bg-transparent text-sm font-semibold text-slate-100 outline-none"
          />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:flex-wrap">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onPresetSelect(preset)}
              className={classNames(
                "w-full rounded-full border px-3 py-1.5 text-xs font-semibold transition md:w-auto",
                query === preset
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
          disabled={loading}
          className="w-full rounded-full bg-fuchsia-500/90 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:bg-slate-700/60 disabled:text-slate-400"
        >
          {loading ? "查詢中..." : "取得即時環境資料"}
        </button>
      </form>

      <div>
        {error ? (
          <p className="rounded-2xl border border-amber-400/60 bg-amber-400/10 p-4 text-sm text-amber-100">{error}</p>
        ) : data ? (
          <div className="min-w-0 space-y-5 rounded-3xl border border-slate-700/40 bg-slate-950/60 p-5">
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex flex-col gap-1 text-slate-200">
                <p className="text-base font-semibold text-slate-100">{data.location}</p>
                {data.administrative?.length ? (
                  <p className="text-xs text-slate-400">{data.administrative.join(" · ")}</p>
                ) : null}
                <p className="text-xs text-slate-400">
                  {getWeatherDescription(data.weatherCode)} · 觀測時間 {formatWeatherTime(data.observationTime)}
                  {data.timezoneAbbreviation ? `（${data.timezoneAbbreviation}）` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {data.localTime ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/50 bg-sky-400/10 px-3 py-1 font-semibold text-sky-100">
                    🕑 當地 {formatLocalClock(data.localTime, data.timezone, { withSeconds: true })}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 font-semibold text-emerald-100">
                  ⏱️ {formatUtcOffset(data.utcOffset)} {Number.isFinite(data.dayOfWeek) ? `· ${formatWeekday(data.dayOfWeek)}` : ""}
                </span>
                {coordinatesText ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/40 bg-violet-400/10 px-3 py-1 font-semibold text-violet-100">
                    📡 {coordinatesText}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
              <div className="min-w-0 space-y-4">
                <div className="space-y-2">
                  <p className="text-4xl font-bold text-slate-50">
                    {formatOptionalMetric(data.temperature, data.temperatureUnit ?? "°C")}
                  </p>
                  <p className="text-sm text-slate-300">
                    將即時環境條件與溫度轉換結合，減少外部誤差與判斷成本。
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {climateHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="min-w-0 space-y-1 rounded-2xl border border-slate-700/40 bg-slate-900/60 p-3"
                    >
                      <span className="text-xs uppercase tracking-wide text-slate-400">{item.label}</span>
                      <p className="text-lg font-semibold text-slate-100">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="min-w-0 space-y-3 rounded-2xl border border-slate-700/40 bg-slate-900/60 p-4">
                <span className="text-xs uppercase tracking-wide text-slate-400">環境指標</span>
                <div className="grid gap-2">
                  {environmentMetrics.map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm text-slate-200">
                      <span>{item.label}</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-3 rounded-2xl border border-slate-700/40 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="uppercase tracking-wide text-slate-300">空氣品質</span>
                  <span>更新 {airQualityTime}</span>
                </div>
                {data.airQuality ? (
                  <div className="space-y-3">
                    <p className="text-3xl font-bold text-slate-50">
                      {formatOptionalMetric(data.airQuality.aqi, data.airQuality.aqiUnit ?? "")}
                    </p>
                    <div className="grid gap-2 text-sm text-slate-200 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-700/40 bg-slate-950/60 px-3 py-2">
                        <span className="text-xs uppercase tracking-wide text-slate-400">PM2.5</span>
                        <p className="font-semibold">
                          {formatOptionalMetric(
                            data.airQuality.pm25,
                            data.airQuality.pm25Unit ? ` ${data.airQuality.pm25Unit}` : "",
                          )}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-700/40 bg-slate-950/60 px-3 py-2">
                        <span className="text-xs uppercase tracking-wide text-slate-400">PM10</span>
                        <p className="font-semibold">
                          {formatOptionalMetric(
                            data.airQuality.pm10,
                            data.airQuality.pm10Unit ? ` ${data.airQuality.pm10Unit}` : "",
                          )}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">數據來源：Open-Meteo Air Quality API</p>
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-700/40 bg-slate-950/40 px-3 py-2 text-xs text-slate-400">
                    此地點暫無空氣品質資訊。
                  </p>
                )}
              </div>

              <div className="min-w-0 space-y-3 rounded-2xl border border-slate-700/40 bg-slate-900/60 p-4">
                <span className="text-xs uppercase tracking-wide text-slate-300">日照資訊</span>
                <div className="space-y-2 text-sm text-slate-200">
                  <div className="flex items-center justify-between">
                    <span>日照長度</span>
                    <span className="font-semibold">{formatDayLength(data.dayLengthSeconds)}</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-700/40 bg-slate-950/60 px-3 py-2">
                      <span className="text-xs uppercase tracking-wide text-slate-400">日出</span>
                      <p className="font-semibold">
                        {formatLocalClock(data.sunrise, data.timezone, { withSeconds: false })}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-700/40 bg-slate-950/60 px-3 py-2">
                      <span className="text-xs uppercase tracking-wide text-slate-400">日落</span>
                      <p className="font-semibold">
                        {formatLocalClock(data.sunset, data.timezone, { withSeconds: false })}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">數據來源：Sunrise-Sunset.org</p>
                </div>
              </div>
            </div>

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
