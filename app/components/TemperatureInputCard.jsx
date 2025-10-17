const classNames = (...values) => values.filter(Boolean).join(" ");

export function TemperatureInputCard({
  scale,
  scales,
  onScaleChange,
  rawInput,
  onInputChange,
  activeSymbol,
  onReset,
  onAddHistory,
  canAddHistory,
  sliderRange,
  sliderValue,
  sliderStep,
  onSliderChange,
  conversions,
  copiedScale,
  onCopy,
  mood,
  relativeSolarProgress,
  showSolarProgress,
  formatTemperature,
}) {
  return (
    <section className="space-y-8 rounded-3xl border border-slate-700/40 bg-slate-900/70 p-5 shadow-glass backdrop-blur sm:p-6 md:p-8">
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
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-full border border-slate-600/40 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-400"
          >
            🔄 重設
          </button>
          <button
            type="button"
            onClick={onAddHistory}
            disabled={!canAddHistory}
            className="inline-flex items-center gap-2 rounded-full bg-sky-500/90 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700/60 disabled:text-slate-400"
          >
            📝 加入紀錄
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {scales.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => onScaleChange(item.code)}
            className={classNames(
              "rounded-2xl border px-3 py-3 text-xs font-semibold transition sm:text-sm",
              scale === item.code
                ? "border-sky-400/70 bg-sky-400/10 text-sky-200"
                : "border-slate-700/50 bg-slate-900/80 text-slate-200 hover:border-slate-500/70 hover:bg-slate-800/80",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        <label className="flex flex-col gap-2 text-left">
          <span className="text-sm font-semibold text-slate-200">輸入數值</span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 text-lg font-semibold text-slate-100 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/40">
            <span className="text-xl">🌡️</span>
            <input
              type="text"
              inputMode="decimal"
              value={rawInput}
              onChange={onInputChange}
              placeholder="輸入溫度值"
              className="flex-1 bg-transparent text-base font-semibold outline-none sm:text-lg"
            />
            <span className="text-sm font-semibold text-slate-400">{activeSymbol ?? ""}</span>
          </div>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-200">
            範圍滑桿（{formatTemperature(sliderRange.min)} ~ {formatTemperature(sliderRange.max)}）
          </span>
          <input
            type="range"
            min={sliderRange.min}
            max={sliderRange.max}
            step={sliderStep}
            value={sliderValue}
            onChange={onSliderChange}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-sky-400"
          />
        </label>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-100">即時轉換結果</h3>
        <div className="grid gap-4 sm:grid-cols-2">
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
                  <span className="text-xs uppercase tracking-wide text-slate-200/80">{item.label}</span>
                  <p className="text-2xl font-bold text-slate-50 sm:text-3xl">
                    {formatTemperature(item.result)} {item.symbol}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onCopy(`${formatTemperature(item.result)}`, item.code)}
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
              {item.code === "celsius" && mood ? (
                <p className="mt-3 text-sm text-slate-200/80">{mood.title}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-slate-200">
          <span className="text-xl">📈</span>
          <h3 className="text-base font-semibold sm:text-lg">相對於太陽表面的能量比例</h3>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full border border-slate-700/60 bg-slate-800/80">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-fuchsia-400 to-rose-400"
            style={{ width: `${relativeSolarProgress}%` }}
          />
        </div>
        <p className="text-xs text-slate-400">
          {showSolarProgress
            ? `目前為太陽表面溫度的 ${formatTemperature(relativeSolarProgress)}%`
            : "輸入溫度以分析熱能比例"}
        </p>
      </div>
    </section>
  );
}
