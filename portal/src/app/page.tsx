import Link from 'next/link'

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2.25rem] border border-white/60 bg-slate-950 px-6 py-10 text-white shadow-[0_40px_100px_-45px_rgba(2,6,23,0.85)] sm:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">Production-ready housing intelligence</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Estimate property value, track prediction history, and explore live market signals in one place.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Use the prediction workspace for side-by-side scenario comparison, then move into market analytics for
              pricing patterns, inventory mix, and what-if forecasting.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/property-estimator"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:-translate-y-0.5 hover:bg-sky-100"
              >
                Open Estimator
              </Link>
              <Link
                href="/market-analysis"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-white/10"
              >
                Explore Market Analysis
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-sm text-slate-300">Prediction workspace</p>
              <p className="mt-2 text-3xl font-semibold">Charts</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-sm text-slate-300">History persistence</p>
              <p className="mt-2 text-3xl font-semibold">Local</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-sm text-slate-300">Comparison mode</p>
              <p className="mt-2 text-3xl font-semibold">Multi-select</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {[
          {
            href: '/property-estimator',
            title: 'Property Value Estimator',
            description: 'Build a prediction history, compare saved scenarios, and visualize price movement with line and bar charts.',
            accent: 'from-sky-500/20 to-cyan-400/10',
          },
          {
            href: '/market-analysis',
            title: 'Market Analysis',
            description: 'Inspect real dataset-backed market metrics, inventory distribution, and run what-if analysis against current trends.',
            accent: 'from-teal-500/20 to-emerald-400/10',
          },
        ].map(card => (
          <Link
            key={card.href}
            href={card.href}
            className={`group rounded-[2rem] border border-white/60 bg-gradient-to-br ${card.accent} p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:shadow-[0_28px_90px_-40px_rgba(15,23,42,0.55)]`}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Workspace</p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">{card.title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-700">{card.description}</p>
            <span className="mt-6 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white group-hover:bg-slate-800">
              Open
            </span>
          </Link>
        ))}
      </section>
    </div>
  )
}
