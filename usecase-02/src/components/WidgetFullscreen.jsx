import { createPortal } from 'react-dom'
import { WidgetInfo, WidgetTools } from './WidgetControls.jsx'

export default function WidgetFullscreen({ title, info, onExport, onClose, children }) {
  return createPortal(
    <div className="widgetFullscreenOverlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <section className="widgetFullscreen" role="dialog" aria-modal="true" aria-label={title}>
        <div className="widgetHead">
          <div className="panelTitle"><h3>{title}</h3><WidgetInfo title={title} text={info} /></div>
          <WidgetTools title={title} onExport={onExport} onClose={onClose} />
        </div>
        <div className="widgetFullscreenBody">{children}</div>
      </section>
    </div>,
    document.body,
  )
}
