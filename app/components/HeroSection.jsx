export function HeroSection({ presets, onPresetSelect }) {
  return (
    <section className="flex flex-col items-center gap-6 text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-slate-600/40 bg-blue-950/40 px-4 py-1 text-sm font-medium text-sky-200">
        ⚡ Multi-Scale Temperature Studio
      </span>
      <h1 className="text-3xl font-bold leading-tight text-slate-50 sm:text-4xl md:text-5xl">
        溫度實驗室 · 智慧轉換平台
      </h1>
      <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
        即時轉換六種常見與歷史溫標、加入情境分析與轉換紀錄。無論是烹飪、科研、工業或創作，這裡都能給你漂亮又專業的一站式體驗。
      </p>
      <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:w-auto lg:grid-cols-7">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onPresetSelect(preset)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-600/40 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-100 transition hover:border-sky-400/60 hover:bg-sky-400/10 sm:text-sm"
          >
            <span>{preset.emoji}</span>
            {preset.label}
          </button>
        ))}
      </div>
    </section>
  );
}
