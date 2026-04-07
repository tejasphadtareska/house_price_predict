'use client'

import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { apiService } from '@/lib/apiService'
import type { MarketStats, PropertyData, PredictionResponse } from '@/lib/types'

export default function MarketAnalysis() {
  const [stats, setStats] = useState<MarketStats | null>(null)
  const [whatIfResult, setWhatIfResult] = useState<number | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [whatIfError, setWhatIfError] = useState<string | null>(null)
  const [formData, setFormData] = useState<PropertyData>({
    square_footage: 0,
    bedrooms: 0,
    bathrooms: 0,
    year_built: 0,
    lot_size: 0,
    distance_to_city_center: 0,
    school_rating: 0
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setStatsError(null)
      const data = await apiService.getMarketStats()
      setStats(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load market statistics'
      setStatsError(message)
      console.error('Error fetching stats:', error)
    }
  }

  const handleWhatIf = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setWhatIfError(null)
    try {
      const data = await apiService.runWhatIfAnalysis(formData)
      setWhatIfResult(data.predicted_price)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to run what-if analysis'
      setWhatIfError(message)
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Market Analysis</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Market Statistics</h2>
          {statsError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-semibold">Error Loading Statistics</p>
              <p className="text-sm">{statsError}</p>
            </div>
          )}
          {stats ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="mb-2"><strong>Average Price:</strong> ${stats.averagePrice.toLocaleString()}</p>
              <p className="mb-2"><strong>Total Properties:</strong> {stats.totalProperties}</p>
              <p className="mb-2"><strong>Average SqFt:</strong> {stats.averageSqFt}</p>
            </div>
          ) : !statsError ? (
            <p className="text-gray-500">Loading stats...</p>
          ) : null}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">What-If Analysis</h2>
          <form onSubmit={handleWhatIf} className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Square Footage</label>
                <input
                  type="number"
                  name="square_footage"
                  value={formData.square_footage}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bathrooms</label>
                <input
                  type="number"
                  step="0.5"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year Built</label>
                <input
                  type="number"
                  name="year_built"
                  value={formData.year_built}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lot Size</label>
                <input
                  type="number"
                  name="lot_size"
                  value={formData.lot_size}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Distance to City Center</label>
                <input
                  type="number"
                  step="0.1"
                  name="distance_to_city_center"
                  value={formData.distance_to_city_center}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">School Rating</label>
                <input
                  type="number"
                  step="0.1"
                  name="school_rating"
                  value={formData.school_rating}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            {whatIfError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                <p className="font-semibold">Error Running Analysis</p>
                <p className="text-sm">{whatIfError}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Run What-If'}
            </button>
          </form>

          {whatIfResult !== null && (
            <div className="mt-6 bg-green-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">What-If Result</h3>
              <p className="text-2xl font-bold text-green-800">${whatIfResult.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}