import { Fragment } from 'react'
import { DEPTS, DEPT_SHORT, MONTHS } from '../data/ledger.js'
import { sumNet } from '../utils/policy.js'
import GraphState from './GraphState.jsx'

const LIVE_GRID = { gridTemplateColumns: '118px repeat(12, minmax(25px, 1fr))', minWidth: 590 }
const LIVE_LABEL = { overflow: 'hidden', textOverflow: 'ellipsis' }

// `matrix` ({ months, rows: [{ name, values }] }) comes from the Department x Month workflow in Live Mode, with twelve month columns;
// without it the demo ledger (ten months) is used.
export default function ReviewMatrix({ rows, matrix, state, message, onSelect }) {
  if (state) return <GraphState state={state} message={message} noun="matrix data" />
  const months = matrix ? matrix.months : MONTHS
  const lines = matrix
    ? matrix.rows.map((r) => ({ name: r.name, label: r.name, values: r.values.map((v) => (v == null ? null : v / 1000)) }))
    : DEPTS.map((d, i) => ({ name: d, label: DEPT_SHORT[i], values: MONTHS.map((m) => sumNet(rows.filter((r) => r.dept === d && r.month === m)) / 1000) }))
  const maximum = Math.max(1, ...lines.flatMap((l) => l.values).filter((v) => v != null).map(Math.abs))
  return (
    <div className="heatWrap">
      <div className="matrixGrid" style={matrix ? LIVE_GRID : undefined}>
        {lines.map((line, i) => (
          <Fragment key={line.name}>
            <div className="mLabel" style={matrix ? LIVE_LABEL : undefined} title={matrix ? line.name : undefined}>{line.label}</div>
            {months.map((m, j) => {
              const n = line.values[j]
              const alpha = (0.27 + ((n == null ? 0 : Math.abs(n)) / maximum) * 0.63).toFixed(2)
              // The click filter maps months onto the demo calendar, so month columns it cannot place (Nov, Dec) are display-only.
              const selectable = MONTHS.includes(m)
              return (
                <button
                  key={m} data-chart-heat={`${i},${j}`} title={`Filter ${line.name} · ${m}`} style={{ background: `rgba(250,40,85,${alpha})` }}
                  onClick={() => selectable && onSelect('matrix', line.name, m)}
                >
                  {n == null ? '—' : `${Math.round(n)}K`}
                </button>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
