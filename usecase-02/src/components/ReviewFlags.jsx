import { FLAG_SPEC, matchFlag } from '../utils/policy.js'

export default function ReviewFlags({ rows, activeFlag, onSelect }) {
  return (
    <>
      <p className="flagExplainer">Select a flag to filter all financial KPIs, the matrix, Priority Investigation, and the review queue.</p>
      {Object.entries(FLAG_SPEC).map(([code, { label, note, color }]) => (
        <div key={code} className={'flag' + (activeFlag === code ? ' activeFlag' : '')} data-chart-flag={code} role="button" tabIndex={0} aria-pressed={activeFlag === code} title={note} onClick={() => onSelect('flag', code)}>
          <i className="flagDash" style={{ background: color }}></i>
          <div className="flagText">{label}</div>
          <span className="countBadge" style={{ color }}>{rows.filter((r) => matchFlag(r, code)).length}</span>
        </div>
      ))}
    </>
  )
}
