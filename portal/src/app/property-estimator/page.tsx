'use client'

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import ClientErrorState from '@/components/ClientErrorState'
import PageSection from '@/components/PageSection'
import PredictionCharts from '@/components/PredictionCharts'
import { Skeleton } from '@/components/Skeleton'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { apiService } from '@/lib/apiService'
import type { EstimateRecord, PropertyData } from '@/lib/types'

const initialFormData: PropertyData = {
  square_footage: 1550,
  bedrooms: 3,
  bathrooms: 2,
  year_built: 1997,
  lot_size: 6800,
  distance_to_city_center: 4.1,
  school_rating: 7.6,
}

export default function PropertyEstimator() {
  const [formData, setFormData] = useState<PropertyData>(initialFormData)
  const [prediction, setPrediction] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { value: history, setValue: setHistory, hydrated } = useLocalStorage<EstimateRecord[]>('housing-estimate-history', [])
  const { value: selectedIds, setValue: setSelectedIds } = useLocalStorage<string[]>('housing-estimate-selection', [])

  useEffect(() => {
    if (!hydrated || history.length === 0 || selectedIds.length > 0) {
      return
    }
    setSelectedIds(history.slice(0, 2).map(entry => entry.id))
  }, [history, hydrated, selectedIds.length, setSelectedIds])

  const selectedRecords = useMemo(() => history.filter(entry => selectedIds.includes(entry.id)), [history, selectedIds])

  const averageSavedValue = useMemo(() => {
    if (history.length === 0) {
      return 0
    }
    return Math.round(history.reduce((sum, entry) => sum + entry.price, 0) / history.length)
  }, [history])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await apiService.getPropertyEstimate(formData)
      const estimate: EstimateRecord = {
        id: `${Date.now()}`,
        data: { ...formData },
        price: data.predicted_price,
        timestamp: new Date().toLocaleString(),
      }
      setPrediction(estimate.price)
      setHistory(prev => [estimate, ...prev].slice(0, 12))
      setSelectedIds(prev => [estimate.id, ...prev.filter(id => id !== estimate.id)].slice(0, 4))
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'An error occurred')
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

  const toggleComparison = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(entryId => entryId !== id) : [...prev, id].slice(-4)))
  }

  const clearHistory = () => {
    setHistory([])
    setSelectedIds([])
    setPrediction(null)
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <PageSection
          eyebrow="Prediction Studio"
          title="Property value estimator"
          description="Submit a scenario, keep the result in persistent local history, and compare multiple saved predictions side by side."
        >
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
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
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-sky-400 focus:shadow-[0_0_0_4px_rgba(56,189,248,0.12)]"
                  required
                />
              </label>
            ))}
            <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Estimating...' : 'Run Prediction'}
              </button>
              <button
                type="button"
                onClick={() => setFormData(initialFormData)}
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              >
                Reset Inputs
              </button>
            </div>
          </form>
          {error && <div className="mt-5"><ClientErrorState title="Prediction Error" message={error} /></div>}
        </PageSection>

        <PageSection
          eyebrow="Live Summary"
          title="Current insight"
          description="Instant feedback on the latest prediction and the average across your saved scenarios."
        >
          <div className="grid gap-4">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-sky-500 to-cyan-500 p-6 text-white">
              <p className="text-sm uppercase tracking-[0.2em] text-sky-100">Latest prediction</p>
              <p className="mt-3 text-4xl font-semibold">
                {prediction !== null ? `$${prediction.toLocaleString()}` : 'Run a scenario'}
              </p>
              <p className="mt-3 text-sm text-sky-100">Results stay available after refresh using localStorage-backed history.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Saved predictions</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{history.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Average saved value</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {history.length > 0 ? `$${averageSavedValue.toLocaleString()}` : '--'}
                </p>
              </div>
            </div>
          </div>
        </PageSection>
      </section>

      <PageSection
        eyebrow="Visualization"
        title="Prediction charts"
        description="Track how results shift over time and compare selected scenarios in a chart-ready view."
        aside={history.length > 0 ? (
          <button
            type="button"
            onClick={clearHistory}
            className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
          >
            Clear History
          </button>
        ) : null}
      >
        {!hydrated ? (
          <Skeleton className="h-[24rem]" />
        ) : history.length === 0 ? (
          <ClientErrorState title="No Predictions Yet" message="Run your first property estimate to unlock trend and comparison charts." />
        ) : (
          <PredictionCharts history={history} selectedIds={selectedIds} />
        )}
      </PageSection>

      <PageSection
        eyebrow="Comparison"
        title="Saved scenarios"
        description="Select up to four predictions to compare in the chart above and review their inputs side by side."
      >
        {!hydrated ? (
          <Skeleton className="h-64" />
        ) : history.length === 0 ? (
          <ClientErrorState title="History Empty" message="Prediction history is stored locally after each successful estimate." />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-3">
              {history.map(entry => (
                <label
                  key={entry.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-[1.25rem] border p-4 ${
                    selectedIds.includes(entry.id)
                      ? 'border-sky-300 bg-sky-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(entry.id)}
                    onChange={() => toggleComparison(entry.id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-lg font-semibold text-slate-950">${entry.price.toLocaleString()}</p>
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{entry.timestamp}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {entry.data.square_footage} sqft, {entry.data.bedrooms} bd, {entry.data.bathrooms} ba, rating {entry.data.school_rating}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Scenario</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Price</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">SqFt</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Beds</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Baths</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">School</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedRecords.length > 0 ? selectedRecords.map((entry, index) => (
                      <tr key={entry.id}>
                        <td className="px-4 py-3 text-slate-700">Scenario {index + 1}</td>
                        <td className="px-4 py-3 font-semibold text-slate-950">${entry.price.toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-700">{entry.data.square_footage}</td>
                        <td className="px-4 py-3 text-slate-700">{entry.data.bedrooms}</td>
                        <td className="px-4 py-3 text-slate-700">{entry.data.bathrooms}</td>
                        <td className="px-4 py-3 text-slate-700">{entry.data.school_rating}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                          Select one or more saved predictions to populate the comparison table.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </PageSection>
    </div>
  )
}
