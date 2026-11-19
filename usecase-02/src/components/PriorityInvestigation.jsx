import { amt } from '../utils/format.js'
import { accountLabel, rankPriority } from '../utils/policy.js'

export default function PriorityInvestigation({ rows, review, onOpen }) {
  if (!rows.length) {
    return (
      <>
        <div className="priorityEmpty">No transactions match the current filters.</div>
        <div className="priorityRule">Clear a review flag or another filter to find eligible transactions.</div>
      </>
    )
  }
  const { r, reasons } = rankPriority(rows, review)
  return (
    <>
      <div className="priorityLabel">{`FILTERED GL POSTING · ${r.ref}`}</div>
      <div className="priorityAmount">{amt(r.amount)}</div>
      <div className="priorityCaption">{`${r.dept} · ${r.journal}`}</div>
      <div className="prioritySecondary">{`${r.account} · ${accountLabel(r)}`}</div>
      <div className="priorityAlert">{reasons.join(' · ') || 'Largest amount in the selected rows'}</div>
      <button className="priorityCTA" onClick={() => onOpen(r.id)}>Open investigation →</button>
    </>
  )
}
