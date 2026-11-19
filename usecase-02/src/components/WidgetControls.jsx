import { useId } from 'react'

const icon = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

export function WidgetInfo({ title, text }) {
  const id = useId()
  return (
    <span className="widgetInfo">
      <button type="button" className="widgetInfoButton" aria-label={`About ${title}`} aria-describedby={id}>
        <svg {...icon}><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></svg>
      </button>
      <span role="tooltip" id={id} className="widgetInfoTip">{text}</span>
    </span>
  )
}

export function ExportIcon() {
  return <svg {...icon}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 20h14" /></svg>
}

export function WidgetTools({ title, onExport, onFullscreen, onClose }) {
  return (
    <div className="widgetTools">
      <button type="button" className="widgetToolButton" title="Export CSV" aria-label={`Export ${title} as CSV`} onClick={onExport}>
        <ExportIcon />
      </button>
      {onClose ? (
        <button type="button" className="widgetToolButton" title="Close full screen" aria-label="Close full screen" onClick={onClose}>
          <svg {...icon}><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      ) : (
        <button type="button" className="widgetToolButton" title="Full screen" aria-label={`Open ${title} full screen`} onClick={onFullscreen}>
          <svg {...icon}><path d="M4 9V4h5" /><path d="M20 9V4h-5" /><path d="M4 15v5h5" /><path d="M20 15v5h-5" /></svg>
        </button>
      )}
    </div>
  )
}
