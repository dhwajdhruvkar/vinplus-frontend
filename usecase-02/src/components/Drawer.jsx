import { useState } from 'react'

const KIND_CLASSES = { profile: ' profileDrawer', review: ' referenceDrawer' }

export default function Drawer({ kind, onClose, children }) {
  const [lastKind, setLastKind] = useState(null)
  if (kind && kind !== lastKind) setLastKind(kind)

  return (
    <div className={'drawerOverlay' + (kind ? ' open' : '')} id="drawerOverlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <aside className={'drawer' + (KIND_CLASSES[kind ?? lastKind] ?? '')} id="drawerPanel" role="dialog" aria-modal="true" aria-label="Review or profile">
        {children}
      </aside>
    </div>
  )
}
