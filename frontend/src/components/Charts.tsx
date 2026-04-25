import { fetchForecast } from '../api'
import type { Tx } from '../api'
import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
  CartesianGrid, Legend, Area, AreaChart
} from 'recharts'

// Matches the new dark theme palette
const CAT_COLORS = [
  '#4f8ef7', '#22c97a', '#f5a623', '#f05c5c',
  '#7c5cfc', '#ff6bb3', '#00d4d4', '#ffd166',
]

const CHART_STYLE = {
  fontSize: 11,
  fontFamily: 'DM Sans, sans-serif',
  fill: '#6b7a9e',
}

const TOOLTIP_STYLE = {
  background: '#131b35',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 10,
  color: '#e8eeff',
  fontSize: 12,
  fontFamily: 'DM Sans, sans-serif',
}

// Format a date string for axis ticks
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Custom pie label — only show if slice is big enough
function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) {
  if (percent < 0.06) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={500}>
      {(percent * 100).toFixed(0)}%
    </text>
  )
}

// Pie tooltip
function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div style={TOOLTIP_STYLE}>
      <div style={{ padding: '8px 12px' }}>
        <div style={{ fontWeight: 600 }}>{name}</div>
        <div style={{ color: '#22c97a', fontFamily: 'DM Mono, monospace' }}>${value.toFixed(2)}</div>
      </div>
    </div>
  )
}

// Line/Area tooltip
function LineTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={TOOLTIP_STYLE}>
      <div style={{ padding: '8px 12px' }}>
        <div style={{ color: '#6b7a9e', marginBottom: 4, fontSize: 11 }}>{fmtDate(label)}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} style={{ color: p.color, fontFamily: 'DM Mono, monospace' }}>
            ${Math.abs(p.value ?? 0).toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Charts({ items }: { items: Tx[] }) {
  const expenses = items.filter(i => i.Amount < 0)

  // Category totals for donut
  const byCat = Object.values(
    expenses.reduce((acc: any, t) => {
      acc[t.Category] = acc[t.Category] || { name: t.Category, value: 0 }
      acc[t.Category].value += Math.abs(t.Amount)
      return acc
    }, {})
  ) as Array<{ name: string; value: number }>

  // Daily net totals for trend
  const byDay = (Object.values(
    items.reduce((acc: any, t) => {
      const d = new Date(t.Date).toISOString().split('T')[0]
      acc[d] = acc[d] || { date: d, spent: 0, income: 0 }
      if (t.Amount < 0) acc[d].spent += Math.abs(t.Amount)
      else acc[d].income += t.Amount
      return acc
    }, {})
  ) as Array<{ date: string; spent: number; income: number }>)
    .sort((a, b) => a.date.localeCompare(b.date))

  const [forecast, setForecast] = useState<{ date: string; predicted: number }[]>([])
  const [forecastSummary, setForecastSummary] = useState('')

  useEffect(() => {
    ;(async () => {
      const f = await fetchForecast()
      setForecast(f.points)
      setForecastSummary(f.summary)
    })()
  }, [items.length])

  // Show ~6 evenly spaced ticks on x-axes regardless of data density
  const dayTickInterval = byDay.length > 0 ? Math.max(1, Math.floor(byDay.length / 6)) : 1
  const fcastTickInterval = forecast.length > 0 ? Math.max(1, Math.floor(forecast.length / 5)) : 1

  const isEmpty = items.length === 0

  if (isEmpty) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
        <p style={{ margin: 0, fontSize: 14 }}>Charts will appear after you upload a CSV.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Row 1: Donut + Line side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Spending by Category — Donut */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 14 }}>
            Spending by Category
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  dataKey="value"
                  data={byCat}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  labelLine={false}
                  label={renderPieLabel}
                >
                  {byCat.map((_, i) => (
                    <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: '#6b7a9e', fontSize: 11 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Spending Trend — Area chart */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 14 }}>
            Daily Spending Trend
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={byDay} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f05c5c" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f05c5c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c97a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22c97a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={CHART_STYLE}
                  tickLine={false}
                  axisLine={false}
                  interval={dayTickInterval}
                  tickFormatter={fmtDate}
                />
                <YAxis
                  tick={CHART_STYLE}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `$${Math.abs(v)}`}
                />
                <Tooltip content={<LineTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: '#6b7a9e', fontSize: 11, textTransform: 'capitalize' }}>{value}</span>
                  )}
                />
                <Area type="monotone" dataKey="spent" stroke="#f05c5c" strokeWidth={2} fill="url(#gradSpent)" dot={false} />
                <Area type="monotone" dataKey="income" stroke="#22c97a" strokeWidth={2} fill="url(#gradIncome)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Forecast — full width line chart */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
          30-Day Spending Forecast
        </div>
        {forecastSummary && (
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>
            {forecastSummary}
          </div>
        )}
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f8ef7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={CHART_STYLE}
                tickLine={false}
                axisLine={false}
                interval={fcastTickInterval}
                tickFormatter={fmtDate}
              />
              <YAxis
                tick={CHART_STYLE}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `$${Math.abs(v).toFixed(0)}`}
              />
              <Tooltip content={<LineTooltip />} />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#4f8ef7"
                strokeWidth={2}
                fill="url(#gradForecast)"
                dot={false}
                strokeDasharray="6 3"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}
