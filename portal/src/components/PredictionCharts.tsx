'use client'

import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { EstimateRecord } from '@/lib/types'

const COLORS = ['#0f766e', '#2563eb', '#f97316', '#9333ea', '#dc2626', '#0891b2']

interface PredictionChartsProps {
  history: EstimateRecord[]
  selectedIds: string[]
}

export default function PredictionCharts({ history, selectedIds }: PredictionChartsProps) {
  const chartData = [...history]
    .reverse()
    .map((entry, index) => ({
      label: `P${index + 1}`,
      price: entry.price,
      sqFt: entry.data.square_footage,
      timestamp: entry.timestamp,
      selected: selectedIds.includes(entry.id),
    }))

  const comparisonData = history
    .filter(entry => selectedIds.includes(entry.id))
    .map(entry => ({
      label: `${entry.data.bedrooms}bd / ${entry.data.bathrooms}ba`,
      price: entry.price,
      squareFootage: entry.data.square_footage,
      schoolRating: entry.data.school_rating,
    }))

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">History Trend</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="label" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, 'Predicted Price']} />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} name="Predicted Price" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Comparison View</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="label" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, 'Predicted Price']} />
              <Legend />
              <Bar dataKey="price" radius={[10, 10, 0, 0]} name="Predicted Price">
                {comparisonData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
