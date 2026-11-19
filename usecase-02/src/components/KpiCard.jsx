const GLYPHS = [
  <><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></>,
  <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h8" /></>,
  <><path d="M12 3v13" /><path d="m7 11 5 5 5-5" /><path d="M5 19v2h14v-2" /></>,
  <><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1.2" /><circle cx="3.5" cy="12" r="1.2" /><circle cx="3.5" cy="18" r="1.2" /></>,
  <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  <><path d="m10.29 3.86-8.38 14.5A2 2 0 0 0 3.64 21h16.72a2 2 0 0 0 1.73-3l-8.38-14.5a2 2 0 0 0-3.42.36Z" /><path d="M12 9v4M12 17h.01" /></>,
]
const SHADES = ['#ff335b', '#ff335b', '#00cdb8', '#a7e6ea', '#bbe5f4', '#ff335b']
const SPARK_POINTS = [[0, 17], [9, 12], [18, 17], [28, 7], [38, 14], [49, 11], [59, 14]]
const CHANGE_COLORS = { '1': '#fb6a82', '-1': '#37dfcb', '0': '#c9d9e8' }

function Spark({ index, color }) {
  const path = SPARK_POINTS.map(([x, y], j) => `${j ? 'L' : 'M'}${x},${y + ((j + index) % 3 - 1) * 2}`).join(' ')
  const gradient = `sparkG${index}`
  return (
    <svg className="spark" viewBox="0 0 60 25" aria-hidden="true">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".23" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L59,25 L0,25 Z`} fill={`url(#${gradient})`} />
      <path className="sparkLine" d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const STATE_HINTS = { loading: 'Loading…', empty: 'No data for these filters', error: 'Unavailable' }

export default function KpiCard({ index, title, value, red, change, comparisonWindow, thresholdLabel, state, stateMessage }) {
  const isReview = index === 5
  return (
    <div
      className={`kpi ${red ? 'is-red' : 'is-teal'} kpiInteractive`}
      role="group"
      title={state === 'error' ? stateMessage : isReview ? `High-value rule: ${thresholdLabel}` : `Month over month: ${comparisonWindow}`}
      aria-busy={state === 'loading' || undefined}
      aria-label={`${title}: ${value}, ${state ? STATE_HINTS[state] : isReview ? thresholdLabel : 'MoM ' + change.label}`}
    >
      <div className="label">
        <span className="metricIcon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={SHADES[index]} strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{GLYPHS[index]}</svg>
        </span>
        <span className="labelText">{title}</span>
      </div>
      <div className="value">{value}</div>
      <Spark index={index} color={red ? '#ff2b56' : '#00ddc6'} />
      <div className="hint">
        {state ? <span>{STATE_HINTS[state]}</span> : isReview ? <span>{thresholdLabel}</span> : (
          <>
            <b style={{ color: CHANGE_COLORS[change.direction] }}>{change.label}</b>
            <span>{' ' + (change.zeroBaseline ? 'no prior-month baseline' : 'vs. previous month')}</span>
          </>
        )}
      </div>
    </div>
  )
}
