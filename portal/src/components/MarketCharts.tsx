'use client'

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MarketStats } from '@/lib/types'

const PRICE_COLORS = ['#0f766e', '#2563eb', '#f97316', '#7c3aed']

interface MarketChartsProps {
  stats: MarketStats
}

export default function MarketCharts({ stats }: MarketChartsProps) {
  const priceDistribution = Object.entries(stats.priceDistribution).map(([name, value]) => ({ name, value }))
  const bedroomDistribution = Object.entries(stats.bedroomDistribution).map(([name, value]) => ({ name: `${name} bd`, value }))

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Price Distribution</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={priceDistribution} dataKey="value" nameKey="name" outerRadius={105} innerRadius={55} paddingAngle={4} fill="#2563eb">
                {priceDistribution.map((_, index) => (
                  <Cell key={index} fill={PRICE_COLORS[index % PRICE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Inventory by Bedrooms</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bedroomDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="value" fill="#0f766e" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
