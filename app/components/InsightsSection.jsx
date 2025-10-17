export function InsightsSection({ insights }) {
  return (
    <section className="space-y-6 rounded-3xl border border-slate-700/40 bg-slate-900/70 p-5 shadow-glass backdrop-blur sm:p-6 md:p-7">
      <div className="flex items-center gap-3 text-slate-200">
        <span className="text-xl">💡</span>
        <h2 className="text-xl font-semibold">溫度洞察</h2>
      </div>
      <div className="space-y-4">
        {insights.length > 0 ? (
          insights.map((insight) => (
            <div
              key={insight.title}
              className="flex items-start gap-4 rounded-2xl border border-slate-700/40 bg-slate-900/75 p-4"
            >
              <span className="text-2xl">{insight.icon}</span>
              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-100">{insight.title}</p>
                <p className="text-sm text-slate-300">{insight.description}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-700/40 bg-slate-900/60 p-4 text-sm text-slate-400">
            先輸入溫度，即可獲得冰點、沸點與風險評估等即時分析。
          </p>
        )}
      </div>
    </section>
  );
}
