'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SalesChartProps {
  data: { date: string; revenue: number; orders: number }[]
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E5E0" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9D9486' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: '#9D9486' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              name === 'revenue' ? `$${value.toFixed(2)}` : value,
              name === 'revenue' ? 'Revenue' : 'Orders',
            ]}
            contentStyle={{ fontSize: 12, borderRadius: 4, borderColor: '#E8E5E0' }}
          />
          <Line type="monotone" dataKey="revenue" stroke="#FF5A1F" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
