export function FactsSection({ facts }) {
  return (
    <section className="w-full min-w-0 rounded-3xl border border-slate-700/40 bg-slate-900/70 p-5 shadow-glass backdrop-blur sm:p-6 md:p-8">
      <div className="flex items-center gap-3 text-slate-200">
        <span className="text-xl">✨</span>
        <h2 className="text-xl font-semibold">作品亮點</h2>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {facts.map((fact) => (
          <div
            key={fact.title}
            className="h-full min-w-0 space-y-3 rounded-2xl border border-slate-700/40 bg-slate-900/75 p-5"
          >
            <div className="text-3xl">{fact.icon}</div>
            <p className="text-lg font-semibold text-slate-100">{fact.title}</p>
            <p className="text-sm leading-relaxed text-slate-300">{fact.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
