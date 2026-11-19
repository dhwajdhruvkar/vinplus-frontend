export default function Panel({ title, as: Tag = 'section', className = '', actions, children }) {
  return (
    <Tag className={'panel' + (className ? ' ' + className : '')}>
      {actions ? <div className="panelhead"><h3>{title}</h3>{actions}</div> : <h3>{title}</h3>}
      {children}
    </Tag>
  )
}
