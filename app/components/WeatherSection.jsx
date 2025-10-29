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
}) {
  return (
    <section className="w-full min-w-0 space-y-6 rounded-3xl border border-slate-700/40 bg-slate-900/70 p-5 shadow-glass backdrop-blur sm:p-6 md:p-7">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-slate-200">
          <span className="text-xl">☁️</span>
          <h2 className="text-xl font-semibold">全球氣象快查</h2>
        </div>
        <p className="text-sm text-slate-300">
          輸入城市名稱或直接使用熱門快捷，取得 Open-Meteo 的免費即時資料並納入轉換情境。
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
          {loading ? "查詢中..." : "取得即時天氣"}
        </button>
      </form>

      <div>
        {error ? (
          <p className="rounded-2xl border border-amber-400/60 bg-amber-400/10 p-4 text-sm text-amber-100">{error}</p>
        ) : data ? (
          <div className="min-w-0 space-y-4 rounded-3xl border border-slate-700/40 bg-slate-950/60 p-5">
            <div className="flex flex-col gap-2 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-semibold text-slate-100">{data.location}</p>
                <p className="text-xs text-slate-400">
                  {getWeatherDescription(data.weatherCode)} · 觀測時間 {formatWeatherTime(data.observationTime)}
                  {data.timezone ? `（${data.timezone}）` : ""}
                </p>
              </div>
              <span className="inline-flex rounded-full border border-sky-400/60 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200">
                體感 {formatOptionalMetric(data.apparentTemperature, "°C")}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-3xl font-bold text-slate-50">
                {formatOptionalMetric(data.temperature, "°C")}
              </p>
              <p className="text-sm text-slate-300">
                將即時天氣帶入轉換流程，快速比較實驗室設定與當地環境條件。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="min-w-0 space-y-1 rounded-2xl border border-slate-700/40 bg-slate-900/60 p-3">
                <span className="text-xs uppercase tracking-wide text-slate-400">相對濕度</span>
                <p className="text-lg font-semibold text-slate-100">
                  {formatOptionalMetric(data.humidity, "%")}
                </p>
              </div>
              <div className="min-w-0 space-y-1 rounded-2xl border border-slate-700/40 bg-slate-900/60 p-3">
                <span className="text-xs uppercase tracking-wide text-slate-400">風速</span>
                <p className="text-lg font-semibold text-slate-100">
                  {formatOptionalMetric(data.windSpeed, " m/s")}
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
  );
}
