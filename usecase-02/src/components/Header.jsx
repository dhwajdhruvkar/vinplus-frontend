import { companyLabel, useCompany } from '../company/companyContext.js'
import { displayTime } from '../utils/format.js'

export default function Header({ liveNotice, title, profile, notifications, notificationsOpen, onToggleNotifications, onReadAll, onOpenNotification, onProfile, onLogout }) {
  const company = useCompany()
  const unread = notifications.filter((n) => !n.read).length
  const initials = (profile.name || profile.username || 'DM').trim().split(/\s+/).map((s) => s[0] || '').slice(0, 2).join('').toUpperCase()

  return (
    <header className="sticky">
      <div>
        <h1 id="pageTitle">{title}</h1>
        <div className="sub">{`VINPlus  /  ${company.companyName}  /  ${companyLabel(company)}`}</div>
      </div>
      <div className="actions">
        {liveNotice && <span className="pill gold">Live: KPIs &amp; trend · other widgets demo</span>}
        <div className="headerControls">
          <button type="button" className="iconButton" id="notificationButton" aria-label="Notifications" onClick={onToggleNotifications}>
            <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>
            <span className="badgeCount" id="notificationBadge" hidden={unread === 0}>{unread > 99 ? '99+' : String(unread)}</span>
          </button>
          <button type="button" className="avatarButton" id="profileButton" aria-label="Profile" title={`${profile.name} · ${profile.designation}`} onClick={onProfile}>{initials || 'DM'}</button>
          <button type="button" className="iconButton logoutButton" id="logoutButton" aria-label="Log out" title="Log out" onClick={onLogout}>
            <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
          </button>
          <div className="notificationPopover" id="notificationPopover" hidden={!notificationsOpen}>
            {notificationsOpen && (
              <>
                <div className="popoverTitle"><b>Notifications</b><button className="textLink" onClick={onReadAll}>Mark all read</button></div>
                <div className="infoLine">{`Viewing ${profile.name} · Manager`}</div>
                {notifications.length ? notifications.slice(0, 40).map((n) => (
                  <button key={n.id} className={'notificationRow' + (n.read ? '' : ' unread')} onClick={() => onOpenNotification(n)}>
                    <span className="notificationDot" style={{ opacity: n.read ? 0 : 0.98 }}></span>
                    <span className="notificationText"><strong>{n.summary}</strong><span>{n.body || ''}</span><small>{displayTime(n.time)}</small></span>
                  </button>
                )) : <p className="sub" style={{ padding: 13 }}>No notifications yet.</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
