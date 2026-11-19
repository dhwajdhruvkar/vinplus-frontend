import { Fragment } from 'react'
import { DEPTS, DEPT_SHORT, MONTHS } from '../data/ledger.js'
import { sumNet } from '../utils/policy.js'

export default function ReviewMatrix({ rows, onSelect }) {
  const values = DEPTS.map((d) => MONTHS.map((m) => sumNet(rows.filter((r) => r.dept === d && r.month === m)) / 1000))
  const maximum = Math.max(1, ...values.flat().map(Math.abs))
  return (
    <div className="heatWrap">
      <div className="matrixGrid">
        {DEPTS.map((d, i) => (
          <Fragment key={d}>
            <div className="mLabel">{DEPT_SHORT[i]}</div>
            {MONTHS.map((m, j) => {
              const n = values[i][j]
              const alpha = (0.27 + (Math.abs(n) / maximum) * 0.63).toFixed(2)
              return (
                <button key={m} data-chart-heat={`${i},${j}`} title={`Filter ${d} · ${m}`} style={{ background: `rgba(250,40,85,${alpha})` }} onClick={() => onSelect('matrix', d, m)}>
                  {Math.round(n)}K
                </button>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
