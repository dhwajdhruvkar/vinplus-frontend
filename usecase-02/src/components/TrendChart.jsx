import { Fragment } from 'react'
import { MONTHS } from '../data/ledger.js'
import { trendMonthIndex, trendX } from '../utils/chart.js'
import { fmt } from '../utils/format.js'

const BASELINE = 210
const HEIGHT = 181

const MESSAGES = { loading: 'Loading monthly trend…', empty: 'No trend data for these filters' }

export default function TrendChart({ rows, series: liveSeries, state, message, onSelect }) {
  const series = liveSeries ?? MONTHS.map((month) => ({ month, value: rows.filter((r) => r.month === month).reduce((s, r) => s + r.amount, 0) }))
  const values = series.map((s) => s.value)
  const known = values.filter((v) => v != null)
  if (state || !known.length) return <div className="graphEmpty">{state === 'error' ? message : MESSAGES[state ?? 'empty']}</div>

  const low = Math.min(0, ...known)
  const high = Math.max(1, ...known)
  const yAt = (v) => BASELINE - ((v - low) / (high - low || 1)) * HEIGHT
  const points = values.map((v, i) => (v == null ? null : [trendX(i, values.length), yAt(v)]))
  const present = points.filter(Boolean)
  const path = present.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${path} L${present[present.length - 1][0].toFixed(1)},210 L${present[0][0].toFixed(1)},210 Z`
  const ticks = Array.from({ length: 6 }, (_, i) => low + ((high - low) * i) / 5)

  return (
    <svg
      className="trendgraph" data-chart-trend="1" viewBox="0 0 605 245" role="button" tabIndex={0}
      aria-label="Illustrative monthly policy expense trend"
      onClick={(e) => {
        const label = series[trendMonthIndex(e.currentTarget, e.clientX, series.length)].month.toLowerCase()
        const month = MONTHS.find((m) => label.startsWith(m.toLowerCase()))
        if (month) onSelect('month', month)
      }}
    >
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff1e50" stopOpacity=".36" />
          <stop offset="100%" stopColor="#ff1e50" stopOpacity=".02" />
        </linearGradient>
      </defs>
      {ticks.map((val) => {
        const y = yAt(val)
        return (
          <Fragment key={val}>
            <line x1="58" x2="594" y1={y} y2={y} stroke="#344154" strokeWidth="1" />
            <text x="47" y={y + 4} textAnchor="end" fill="#c5d0de" fontSize="11">{`$${Math.round(val / 1000)}K`}</text>
          </Fragment>
        )
      })}
      <path d={area} fill="url(#trendFill)" />
      <path d={path} stroke="#ff1f52" strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((point, i) => point && (
        <circle key={`${series[i].month}-${i}`} cx={point[0]} cy={point[1]} r="3.1" fill="#ffdee5" stroke="#ff1f52" strokeWidth="1" style={{ cursor: 'pointer' }}>
          <title>{`${series[i].month} ${fmt(values[i])}`}</title>
        </circle>
      ))}
      {series.map(({ month }, i) => <text key={`${month}-${i}`} textAnchor="middle" x={trendX(i, series.length)} y="235" fill="#d0d9e5" fontSize="12">{month}</text>)}
    </svg>
  )
}
