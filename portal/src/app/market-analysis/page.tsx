'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import ClientErrorState from '@/components/ClientErrorState'
import MarketCharts from '@/components/MarketCharts'
import PageSection from '@/components/PageSection'
import { Skeleton, StatSkeleton } from '@/components/Skeleton'
import { apiService } from '@/lib/apiService'
import type { MarketStats, PropertyData } from '@/lib/types'

const initialFormData: PropertyData = {
  square_footage: 2000,
  bedrooms: 4,
  bathrooms: 3,
  year_built: 2010,
  lot_size: 8000,
  distance_to_city_center: 5,
  school_rating: 8,
}

export default function MarketAnalysis() {
  const [stats, setStats] = useState<MarketStats | null>(null)
  const [whatIfResult, setWhatIfResult] = useState<number | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [whatIfError, setWhatIfError] = useState<string | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<PropertyData>(initialFormData)

  useEffect(() => {
    void fetchStats()
  }, [])

  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      setStatsError(null)
      const data = await apiService.getMarketStats()
      setStats(data)
    } catch (fetchError) {
      setStatsError(fetchError instanceof Error ? fetchError.message : 'Failed to load market statistics')
    } finally {
      setStatsLoading(false)
    }
  }

  const handleWhatIf = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setWhatIfError(null)
    try {
      const data = await apiService.runWhatIfAnalysis(formData)
      setWhatIfResult(data.predicted_price)
    } catch (submitError) {
      setWhatIfError(submitError instanceof Error ? submitError.message : 'Failed to run what-if analysis')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }))
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <PageSection
          eyebrow="Market Intelligence"
          title="Real market snapshot"
          description="Live stats are backed by the dataset in the Java service, with richer distribution metrics and direct export support."
        >
          {statsLoading ? (
            <StatSkeleton />
          ) : statsError ? (
            <ClientErrorState title="Statistics Unavailable" message={statsError} onRetry={() => void fetchStats()} />
          ) : stats ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
                <p className="text-sm text-slate-300">Average Price</p>
                <p className="mt-2 text-3xl font-semibold">${stats.averagePrice.toLocaleString()}</p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">Median Price</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">${stats.medianPrice.toLocaleString()}</p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">Average SqFt</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{stats.averageSqFt.toLocaleString()}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{stats.totalProperties} properties tracked</p>
              </div>
            </div>
          ) : null}
        </PageSection>

        <PageSection
          eyebrow="Scenario Engine"
          title="What-if analysis"
          description="Send a custom property profile to the ML pipeline and compare the predicted value with the market baseline."
        >
          <form onSubmit={handleWhatIf} className="grid gap-4 md:grid-cols-2">
            {[
              ['square_footage', 'Square Footage', undefined],
              ['bedrooms', 'Bedrooms', undefined],
              ['bathrooms', 'Bathrooms', '0.5'],
              ['year_built', 'Year Built', undefined],
              ['lot_size', 'Lot Size', undefined],
              ['distance_to_city_center', 'Distance to City Center', '0.1'],
              ['school_rating', 'School Rating', '0.1'],
            ].map(([name, label, step]) => (
              <label key={name} className={`flex flex-col gap-2 ${name === 'school_rating' ? 'md:col-span-2' : ''}`}>
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <input
                  type="number"
                  step={step}
                  name={name}
                  value={formData[name as keyof PropertyData]}
                  onChange={handleChange}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-emerald-400 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
                  required
                />
              </label>
            ))}
            <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Analyzing...' : 'Run What-If'}
              </button>
              <button
                type="button"
                onClick={() => setFormData(initialFormData)}
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Reset Scenario
              </button>
            </div>
          </form>
          {whatIfError && <div className="mt-5"><ClientErrorState title="What-If Error" message={whatIfError} /></div>}
          {whatIfResult !== null && (
            <div className="mt-5 rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-teal-500 p-5 text-white">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">Predicted outcome</p>
              <p className="mt-2 text-4xl font-semibold">${whatIfResult.toLocaleString()}</p>
              {stats && (
                <p className="mt-3 text-sm text-emerald-50">
                  {whatIfResult >= stats.averagePrice ? 'Above' : 'Below'} the current dataset average of ${stats.averagePrice.toLocaleString()}.
                </p>
              )}
            </div>
          )}
        </PageSection>
      </section>

      <PageSection
        eyebrow="Visualization"
        title="Market charts"
        description="Distribution views help explain where pricing clusters and how inventory is split across bedroom segments."
      >
        {statsLoading ? (
          <Skeleton className="h-[24rem]" />
        ) : statsError ? (
          <ClientErrorState title="Charts Unavailable" message={statsError} onRetry={() => void fetchStats()} />
        ) : stats ? (
          <MarketCharts stats={stats} />
        ) : null}
      </PageSection>
    </div>
  )
}
