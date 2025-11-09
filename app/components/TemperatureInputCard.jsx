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
    <section className="w-full min-w-0 space-y-8 rounded-3xl border border-slate-700/40 bg-slate-900/70 p-5 shadow-glass backdrop-blur sm:p-6 md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:[&>*]:min-w-0">
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
            className="theme-outline-button"
          >
            🔄 重設
          </button>
          <button
            type="button"
            onClick={onAddHistory}
            disabled={!canAddHistory}
            className="theme-primary-button px-6"
          >
            📝 加入紀錄
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {scales.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => onScaleChange(item.code)}
            className={classNames("theme-segment", scale === item.code ? "theme-segment--active" : "")}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        <label className="flex flex-col gap-2 text-left">
          <span className="text-sm font-semibold text-slate-200">輸入數值</span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 text-lg font-semibold text-slate-100 focus-within:border-[#FF5E5B] focus-within:ring-2 focus-within:ring-[#FF5E5B]/40">
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
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-[#FF5E5B]"
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
                "relative min-w-0 overflow-hidden rounded-3xl border border-slate-700/40 bg-slate-900/80 p-5",
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
                    "theme-outline-button theme-outline-button--small",
                    copiedScale === item.code ? "theme-outline-button--success" : "",
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
            className="h-full bg-gradient-to-r from-[#00CECB] via-[#FFED66] to-[#FF5E5B]"
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
