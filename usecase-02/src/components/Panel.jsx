import { WidgetInfo, WidgetTools } from './WidgetControls.jsx'

export default function Panel({ title, as: Tag = 'section', className = '', actions, info, onExport, onFullscreen, children }) {
  let head = <h3>{title}</h3>
  if (info) {
    head = (
      <div className="widgetHead">
        <div className="panelTitle"><h3>{title}</h3><WidgetInfo title={title} text={info} /></div>
        <WidgetTools title={title} onExport={onExport} onFullscreen={onFullscreen} />
      </div>
    )
  } else if (actions) {
    head = <div className="panelhead"><h3>{title}</h3>{actions}</div>
  }
  return (
    <Tag className={'panel' + (className ? ' ' + className : '')}>
      {head}
      {children}
    </Tag>
  )
}
