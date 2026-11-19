import { Fragment } from 'react'
import { MONTHS } from '../data/ledger.js'
import { trendMonthIndex } from '../utils/chart.js'
import { fmt } from '../utils/format.js'

const BASELINE = 210
const HEIGHT = 181

export default function TrendChart({ rows, onSelect }) {
  const values = MONTHS.map((m) => rows.filter((r) => r.month === m).reduce((s, r) => s + r.amount, 0))
  const low = Math.min(0, ...values)
  const high = Math.max(1, ...values)
  const yAt = (v) => BASELINE - ((v - low) / (high - low || 1)) * HEIGHT
  const points = values.map((v, i) => [58 + i * 58.5, yAt(v)])
  const path = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${path} L${points[points.length - 1][0].toFixed(1)},210 L58,210 Z`
  const ticks = Array.from({ length: 6 }, (_, i) => low + ((high - low) * i) / 5)

  return (
    <svg
      className="trendgraph" data-chart-trend="1" viewBox="0 0 605 245" role="button" tabIndex={0}
      aria-label="Illustrative monthly policy expense trend"
      onClick={(e) => onSelect('month', MONTHS[trendMonthIndex(e.currentTarget, e.clientX)])}
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
      {points.map(([x, y], i) => (
        <circle key={MONTHS[i]} cx={x} cy={y} r="3.1" fill="#ffdee5" stroke="#ff1f52" strokeWidth="1" style={{ cursor: 'pointer' }}>
          <title>{`${MONTHS[i]} ${fmt(values[i])}`}</title>
        </circle>
      ))}
      {MONTHS.map((m, i) => <text key={m} textAnchor="middle" x={points[i][0]} y="235" fill="#d0d9e5" fontSize="12">{m}</text>)}
    </svg>
  )
}
