export function HeroSection({ presets, onPresetSelect }) {
  return (
    <section className="flex w-full min-w-0 max-w-full flex-col items-center gap-6 text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-slate-600/40 bg-blue-950/40 px-4 py-1 text-sm font-medium text-sky-200">
        ⚡ Temperature Intelligence Platform
      </span>
      <h1 className="text-3xl font-bold leading-tight text-slate-50 sm:text-4xl md:text-5xl">
        溫度實驗室 · 智慧轉換平台
      </h1>
      <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
        即時轉換六種常見與歷史溫標，並結合全球天氣、空氣品質與時區日照資訊。無論是烹飪、科研或工業控溫，都能在此獲得可直接對外展示的專業體驗。
      </p>
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:w-auto xl:grid-cols-7">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onPresetSelect(preset)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-600/40 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-100 transition hover:border-sky-400/60 hover:bg-sky-400/10 sm:text-sm"
          >
            <span>{preset.emoji}</span>
            {preset.label}
          </button>
        ))}
      </div>
    </section>
  );
}
