'use client'

import { useState } from 'react'

interface PropertyData {
  square_footage: number
  bedrooms: number
  bathrooms: number
  year_built: number
  lot_size: number
  distance_to_city_center: number
  school_rating: number
}

interface Estimate {
  data: PropertyData
  price: number
  timestamp: string
}

export default function PropertyEstimator() {
  const [formData, setFormData] = useState<PropertyData>({
    square_footage: 0,
    bedrooms: 0,
    bathrooms: 0,
    year_built: 0,
    lot_size: 0,
    distance_to_city_center: 0,
    school_rating: 0
  })
  const [prediction, setPrediction] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<Estimate[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3001/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ features: formData })
      })
      const data = await response.json()
      const price = data.predicted_price
      setPrediction(price)
      const estimate: Estimate = {
        data: { ...formData },
        price,
        timestamp: new Date().toLocaleString()
      }
      setHistory(prev => [estimate, ...prev])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Property Value Estimator</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
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
            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Estimating...' : 'Estimate Value'}
            </button>
          </form>

          {prediction !== null && (
            <div className="mt-6 bg-green-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">Estimated Value</h3>
              <p className="text-2xl font-bold text-green-800">${prediction.toLocaleString()}</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Estimation History</h2>
          <div className="space-y-4">
            {history.map((estimate, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                <p className="font-semibold">${estimate.price.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{estimate.timestamp}</p>
                <p className="text-sm">SqFt: {estimate.data.square_footage}, Beds: {estimate.data.bedrooms}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}