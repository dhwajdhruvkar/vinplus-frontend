import { JOURNALS } from '../data/ledger.js'
import { fmt, fmtSigned } from '../utils/format.js'
import { sumBy, sumNet } from '../utils/policy.js'
import GraphState from './GraphState.jsx'

const NEGATIVE_FILL = { background: 'linear-gradient(90deg,#1fae98,#27cfae)', boxShadow: 'none' }
const ZERO_LINE = { position: 'absolute', top: 0, width: 1, height: '100%', background: '#c9d9e8', boxShadow: 'none' }

// `items` ([{ name, value }]) comes from the Expense by Journal workflow in Live Mode; without it the demo ledger is used.
// Live bars sit on a shared zero baseline: positive values extend right of zero, negative values left of it, and the
// label keeps the minus sign. Demo Mode keeps its original rendering.
export default function JournalBars({ rows, items: liveItems, state, message, activeJournal, onSelect }) {
  if (state) return <GraphState state={state} message={message} noun="journal expense" />
  const demoTotals = liveItems ? null : sumBy(rows, 'journal')
  const items = liveItems ?? JOURNALS.map((name) => ({ name, value: demoTotals[name] || 0 }))
  const max = Math.max(1, ...items.map(({ value }) => Math.abs(value || 0)))
  const net = liveItems ? items.reduce((sum, { value }) => sum + (value || 0), 0) : sumNet(rows)

  const values = items.map(({ value }) => value || 0)
  const low = Math.min(0, ...values)
  const span = Math.max(0, ...values) - low || 1
  const hasNegative = liveItems && low < 0
  const barStyle = (amount) => {
    if (!liveItems) return { width: ((Math.abs(amount) / max) * 100).toFixed(1) + '%' }
    const left = ((Math.min(amount, 0) - low) / span) * 100
    return { marginLeft: left.toFixed(1) + '%', width: ((Math.abs(amount) / span) * 100).toFixed(1) + '%', ...(amount < 0 ? NEGATIVE_FILL : null) }
  }

  return items.map(({ name, value }) => {
    const amount = value || 0
    return (
      <div key={name} className={'journalBar' + (activeJournal === name ? ' selectedJournal' : '')} data-chart-journal={name} role="button" tabIndex={0} title={`Apply journal ${name} to dashboard`} onClick={() => onSelect('journal', name)}>
        <span>{name}</span>
        <div className="track" style={hasNegative ? { position: 'relative' } : undefined}>
          <div style={barStyle(amount)}></div>
          {hasNegative && <div style={{ ...ZERO_LINE, left: ((-low / span) * 100).toFixed(1) + '%' }}></div>}
        </div>
        <strong>{`${liveItems ? fmtSigned(amount) : fmt(amount)} (${((amount / (net || 1)) * 100).toFixed(1)}%)`}</strong>
      </div>
    )
  })
}
