import { JOURNALS } from '../data/ledger.js'
import { fmt } from '../utils/format.js'
import { sumBy, sumNet } from '../utils/policy.js'

export default function JournalBars({ rows, activeJournal, onSelect }) {
  const values = sumBy(rows, 'journal')
  const max = Math.max(1, ...Object.values(values).map(Math.abs))
  const net = sumNet(rows)
  return JOURNALS.map((j) => {
    const value = values[j] || 0
    return (
      <div key={j} className={'journalBar' + (activeJournal === j ? ' selectedJournal' : '')} data-chart-journal={j} role="button" tabIndex={0} title={`Apply journal ${j} to dashboard`} onClick={() => onSelect('journal', j)}>
        <span>{j}</span>
        <div className="track"><div style={{ width: ((Math.abs(value) / max) * 100).toFixed(1) + '%' }}></div></div>
        <strong>{`${fmt(value)} (${((value / (net || 1)) * 100).toFixed(1)}%)`}</strong>
      </div>
    )
  })
}
