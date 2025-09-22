import { fetchForecast } from '../api'
import type { Tx } from '../api'
import { useEffect, useState } from 'react'
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, ResponsiveContainer, 
  CartesianGrid, Legend, BarChart, Bar 
} from 'recharts'

export default function Charts({ items }: { items: Tx[] }) {
  const expenses = items.filter(i => i.Amount < 0)

  const byCat = Object.values(
    expenses.reduce((acc: any, t) => {
      acc[t.Category] = acc[t.Category] || { name: t.Category, value: 0 }
      acc[t.Category].value += Math.abs(t.Amount)
      return acc
    }, {})
  ) as Array<{ name: string; value: number }>

  const byDay = Object.values(
    items.reduce((acc: any, t) => {
      const d = new Date(t.Date).toISOString().split('T')[0]
      acc[d] = acc[d] || { date: d, amount: 0 }
      acc[d].amount += t.Amount
      return acc
    }, {})
  ).sort((a: any, b: any) => a.date.localeCompare(b.date)) as Array<{ date: string; amount: number }>

  const [forecast, setForecast] = useState<{ date: string; predicted: number }[]>([])
  const [forecastSummary, setForecastSummary] = useState('')

  useEffect(() => {
    (async () => {
      const f = await fetchForecast()
      setForecast(f.points)
      setForecastSummary(f.summary)
    })()
  }, [items.length])

  // Palette for categories
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00c49f', '#ffbb28', '#d0ed57', '#a4de6c']

  // Split daily amounts into two datasets for conditional line coloring
  const byDayPositive = byDay.map(d => ({ ...d, amount: d.amount >= 0 ? d.amount : null }))
  const byDayNegative = byDay.map(d => ({ ...d, amount: d.amount < 0 ? d.amount : null }))

  return (
    <div className="grid">
      {/* Spending by Category */}
      <div className="card">
        <h3>Spending by Category</h3>
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie dataKey="value" data={byCat} outerRadius={110} label>
                {byCat.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Spending Trend */}
      <div className="card">
        <h3>Daily Spending Trend</h3>
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />

              {/* Positive line (green) */}
              <Line 
                type="monotone" 
                data={byDayPositive} 
                dataKey="amount" 
                stroke="#4caf50"
                dot={({ cx, cy, value }) => (
                  value != null ? (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={4} 
                      stroke="black" 
                      strokeWidth={1} 
                      fill="#4caf50" 
                    />
                  ) : <></>
                )}
              />

              {/* Negative line (red) */}
              <Line 
                type="monotone" 
                data={byDayNegative} 
                dataKey="amount" 
                stroke="#ff4d4f"
                dot={({ cx, cy, value }) => (
                  value != null ? (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={4} 
                      stroke="black" 
                      strokeWidth={1} 
                      fill="#ff4d4f" 
                    />
                  ) : <></>
                )}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast */}
      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <h3>30-Day Forecast</h3>
        <div style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="predicted">
                {forecast.map((entry, index) => (
                  <Cell 
                    key={`bar-${index}`} 
                    fill={entry.predicted < 0 ? '#ff4d4f' : '#4caf50'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p>{forecastSummary}</p>
      </div>
    </div>
  )
}