import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { tooltipModel } from '../utils/tooltip.js'

export default function ChartTooltip({ rows, filters, review, live }) {
  const [tip, setTip] = useState(null)
  const rootRef = useRef(null)

  useEffect(() => {
    const move = (e) => {
      const model = tooltipModel(e, rows, filters, review, live)
      setTip(model && { model, x: e.clientX || 0, y: e.clientY || 0 })
    }
    const hide = () => setTip(null)
    document.addEventListener('pointermove', move)
    document.documentElement.addEventListener('pointerleave', hide)
    window.addEventListener('scroll', hide, { passive: true, capture: true })
    return () => {
      document.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', hide)
      window.removeEventListener('scroll', hide, { capture: true })
    }
  }, [rows, filters, review, live])

  useLayoutEffect(() => {
    if (!tip) return
    const root = rootRef.current
    const width = root.offsetWidth || 220
    const height = root.offsetHeight || 100
    const x = Math.max(8, Math.min(tip.x + 18, (window.innerWidth || 1024) - width - 10))
    const y = Math.max(8, Math.min(tip.y + 18, (window.innerHeight || 768) - height - 10))
    root.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`
  }, [tip])

  const model = tip?.model
  return (
    <div id="vinplusChartTooltip" ref={rootRef} className="vinplusChartTooltip" role="tooltip" hidden={!tip} style={{ borderLeftColor: model?.color || '#ff315e' }}>
      {model && (
        <>
          <div className="tipCaption">{model.caption}</div>
          <div className="tipLabel">{model.label}</div>
          <div className="tipAmount">{model.value}</div>
          {model.percent && <div className="tipPercent">{model.percent} of selected total</div>}
          <div className="tipNote">{model.note}</div>
          <div className="tipBar" style={{ background: model.color || '#ff315e' }}></div>
        </>
      )}
    </div>
  )
}
