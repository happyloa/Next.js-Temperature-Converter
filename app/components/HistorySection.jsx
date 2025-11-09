export function HistorySection({ history, onClearHistory, formatTemperature, formatTime }) {
  return (
    <section className="w-full min-w-0 space-y-6 rounded-3xl border border-slate-700/40 bg-slate-900/70 p-5 shadow-glass backdrop-blur sm:p-6 md:p-7">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-slate-200">
          <span className="text-xl">🗂️</span>
          <h2 className="text-xl font-semibold">轉換紀錄</h2>
        </div>
        <p className="text-sm text-slate-300">
          將感興趣的轉換加入歷史紀錄，可快速對照實驗或製程所需的常用溫度設定。
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-400">
          {history.length > 0 ? `共 ${history.length} 筆，依時間由新到舊排序` : "尚未加入紀錄"}
        </span>
        <button
          type="button"
          onClick={onClearHistory}
          disabled={history.length === 0}
          className="theme-outline-button theme-outline-button--small"
        >
          清除紀錄
        </button>
      </div>
      <div className="space-y-4">
        {history.map((entry) => (
          <div key={entry.id} className="min-w-0 rounded-2xl border border-slate-700/40 bg-slate-900/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-300">
              <span>
                {formatTime(new Date(entry.timestamp))} · {formatTemperature(entry.value)} {entry.scaleSymbol}
              </span>
              <span className="text-xs text-slate-500">{entry.scaleLabel}</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {entry.conversions.map((item) => (
                <div
                  key={`${entry.id}-${item.code}`}
                  className="flex min-w-0 items-center justify-between rounded-xl border border-slate-700/40 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="font-semibold">
                    {formatTemperature(item.result)} {item.symbol}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-700/40 bg-slate-900/60 p-4 text-sm text-slate-400">
            加入紀錄後，系統會保留最近八筆轉換，方便在不同實驗之間快速比對。
          </p>
        )}
      </div>
    </section>
  );
}
