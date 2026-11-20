// Shown instead of a chart in Live Mode while data loads, when it fails, or when the backend returns no rows.
// It never falls back to demo values.
export default function GraphState({ state, message, noun = 'data' }) {
  const text = state === 'error' ? message : state === 'loading' ? `Loading ${noun}…` : `No ${noun} for these filters`
  return <div className="graphEmpty">{text}</div>
}
