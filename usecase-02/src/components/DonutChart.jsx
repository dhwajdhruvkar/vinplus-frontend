import { DEPTS, DEPT_COLORS } from '../data/ledger.js'
import { fmt } from '../utils/format.js'
import { sumBy } from '../utils/policy.js'
import GraphState from './GraphState.jsx'

const RADIUS = 64
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// `items` ([{ name, value }]) comes from the Expense by Department workflow in Live Mode; without it the demo ledger is used.
export default function DonutChart({ rows, items: liveItems, state, message, activeDept, onSelect }) {
  if (state) return <GraphState state={state} message={message} noun="department expense" />
  const demoTotals = liveItems ? null : sumBy(rows, 'dept')
  const items = liveItems ?? DEPTS.map((name) => ({ name, value: demoTotals[name] || 0 }))
  const color = (i) => DEPT_COLORS[i % DEPT_COLORS.length]
  const weights = items.map(({ value }) => Math.max(0, Number(value) || 0))
  const total = weights.reduce((a, b) => a + b, 0)
  const denominator = total || 1

  const slices = weights.map((n, i) => {
    const share = n / denominator
    const before = weights.slice(0, i).reduce((a, b) => a + b, 0) / denominator
    const middle = (before + share / 2) * 2 * Math.PI - Math.PI / 2
    return { i, n, share, length: share * CIRCUMFERENCE, offset: -before * CIRCUMFERENCE, x: 90 + 65 * Math.cos(middle), y: 90 + 65 * Math.sin(middle) }
  })

  return (
    <div className="donutWrap">
      <div className="donut donutSourceColors" title="Click any colored segment to filter the dashboard">
        <svg className="ringPercent" viewBox="0 0 180 180" role="img" aria-label="Policy expense by department">
          <circle cx="90" cy="90" r={RADIUS} stroke="#26384d" strokeWidth="31" fill="none"></circle>
          {slices.filter((s) => s.n > 0).map(({ i, n, length, offset }) => (
            <circle
              key={items[i].name} className="donutSlice" data-chart-dept={i} cx="90" cy="90" r={RADIUS} fill="none" stroke={color(i)}
              strokeWidth="31" strokeDasharray={`${length.toFixed(3)} ${CIRCUMFERENCE.toFixed(3)}`} strokeDashoffset={offset.toFixed(3)}
              transform="rotate(-90 90 90)" aria-label={`${items[i].name}: ${((n / denominator) * 100).toFixed(1)}%`}
              onClick={() => onSelect('dept', items[i].name)}
            >
              <title>{`${items[i].name} · ${fmt(n)} · ${((n / denominator) * 100).toFixed(1)}%`}</title>
            </circle>
          ))}
          {slices.filter((s) => s.share > 0.032).map(({ i, share, x, y }) => (
            <text key={items[i].name} data-chart-dept={i} x={x.toFixed(2)} y={y.toFixed(2)} dominantBaseline="central" textAnchor="middle" onClick={() => onSelect('dept', items[i].name)}>
              {`${Math.round(share * 100)}%`}
            </text>
          ))}
        </svg>
        <span className="donutInner" data-metric="net" onClick={() => onSelect('metric', 'net')}>{fmt(total)}<small>Total Policy<br />Expense</small></span>
      </div>
      <div className="legend">
        {items.map(({ name, value }, i) => (
          <div key={name} className={'legendItem' + (activeDept === name ? ' activeSlice' : '')} data-chart-dept={i} role="button" tabIndex={0} title={`Filter all KPIs to ${name}`} onClick={() => onSelect('dept', name)}>
            <i className="dot" style={{ background: color(i) }}></i>
            <span className="legendName">{name}</span>
            <span className="legendAmount">{`${fmt(value || 0)} (${((weights[i] / denominator) * 100).toFixed(1)}%)`}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
