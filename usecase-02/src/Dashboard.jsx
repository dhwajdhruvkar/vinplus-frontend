import { useEffect, useState } from 'react'
import { ROWS, ROW_BY_ID } from './data/ledger.js'
import { useStoredState } from './hooks/useStoredState.js'
import { downloadCSV, exportCSV } from './utils/csv.js'
import { widgetExport } from './utils/widgets.js'
import {
  DEFAULT_FILTERS, activeFilterChips, applyReview, applySelection, baseFilter, clearFilter, demoManagerDraft,
  simulatedAdvisorReply, voucherKey, voucherThread,
} from './utils/policy.js'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import FilterToolbar from './components/FilterToolbar.jsx'
import Drawer from './components/Drawer.jsx'
import ReviewDrawer from './components/ReviewDrawer.jsx'
import ProfileDrawer from './components/ProfileDrawer.jsx'
import ChartTooltip from './components/ChartTooltip.jsx'
import Toast from './components/Toast.jsx'
import PolicyWorkControl from './pages/PolicyWorkControl.jsx'
import Transactions from './pages/Transactions.jsx'

const PAGE_TITLES = { overview: 'Policy Work Control', transactions: 'Transactions' }
const DEFAULT_PROFILE = { name: 'Demo Manager', username: 'demo.manager', designation: 'Policy Manager', department: 'Used Vehicle Sales', email: 'manager@example.test' }
const CLICKABLE_BY_KEY = '[data-chart-dept],[data-chart-journal],[data-chart-flag],[data-metric]'

const isRecord = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : undefined)
const seedNotifications = () => [{
  id: 'demo-initial', refId: 'demo-reference:0', summary: 'Demo reference assigned for review',
  body: 'Sample assignment notification for the Policy Work Control wireframe.', time: new Date().toISOString(), read: false,
}]
const validProfiles = (v) => (isRecord(v?.manager) ? { manager: { ...DEFAULT_PROFILE, ...v.manager } } : undefined)

export default function Dashboard({ onLogout }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [tab, setTab] = useState('overview')
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState({ key: 'amount', direction: 'desc' })
  const [drawer, setDrawer] = useState(null)
  const [draftNote, setDraftNote] = useState(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [fullscreen, setFullscreen] = useState(null)
  const [review, setReview] = useStoredState('vinplus-share-demo-reviews-v1', {}, isRecord)
  const [threads, setThreads] = useStoredState('vinplus-share-demo-jv-threads-v1', {}, isRecord)
  const [notifications, setNotifications] = useStoredState('vinplus-share-demo-notifications-v2', seedNotifications, (v) => (Array.isArray(v) && v.length ? v : undefined))
  const [profiles, setProfiles] = useStoredState('vinplus-share-demo-profiles-v2', { manager: DEFAULT_PROFILE }, validProfiles)

  const rows = baseFilter(filters, review)
  const profile = profiles.manager
  const drawerRow = drawer?.kind === 'review' ? ROW_BY_ID.get(drawer.id) || ROWS[0] : null
  const drawerOpen = drawer !== null

  const flash = (text) => setToast({ text })
  const closeDrawer = () => setDrawer(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2700)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!drawerOpen && !fullscreen) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen, fullscreen])

  useEffect(() => {
    if (!notificationsOpen) return
    const closeOnOutsideClick = (e) => {
      if (!e.target.closest('#notificationPopover') && !e.target.closest('#notificationButton')) setNotificationsOpen(false)
    }
    document.addEventListener('click', closeOnOutsideClick)
    return () => document.removeEventListener('click', closeOnOutsideClick)
  }, [notificationsOpen])

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.(CLICKABLE_BY_KEY)) {
        e.preventDefault()
        e.target.click()
      } else if (e.key === 'Escape') {
        if (drawerOpen) setDrawer(null)
        else if (fullscreen) setFullscreen(null)
        else setNotificationsOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen, fullscreen])

  const changeFilters = (update) => {
    setFilters(update)
    setPage(0)
  }
  const setDate = (key, value) => {
    if (!value) return
    changeFilters((f) => {
      const next = { ...f, [key]: value }
      if (next.dateStart > next.dateEnd) next[key === 'dateStart' ? 'dateEnd' : 'dateStart'] = value
      return next
    })
  }

  const goto = (next) => {
    setTab(next)
    setPage(0)
    setFullscreen(null)
    closeDrawer()
    window.scrollTo({ top: 0, behavior: 'auto' })
  }
  const sortBy = (key) => {
    setSort((s) => ({ key, direction: s.key === key && s.direction === 'asc' ? 'desc' : 'asc' }))
    setPage(0)
  }
  const chooseSort = (key, direction) => {
    setSort({ key, direction })
    setPage(0)
  }

  const openReview = (id) => {
    const row = ROW_BY_ID.get(id)
    setDrawer({ kind: 'review', id, focusDept: filters.dept !== 'all' ? filters.dept : row?.dept || 'Other Departments' })
    setDraftNote(null)
    setNotificationsOpen(false)
  }
  const openProfile = () => {
    setDrawer({ kind: 'profile' })
    setNotificationsOpen(false)
  }
  const openNotification = (notification) => {
    setNotifications((list) => list.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
    setNotificationsOpen(false)
    if (notification.refId) openReview(notification.refId)
  }
  const readAllNotifications = () => {
    setNotifications((list) => list.map((n) => ({ ...n, read: true })))
    setNotificationsOpen(false)
  }

  const saveDecision = (decision) => {
    if ((review[drawerRow.id]?.decision || '') === decision) return
    setReview(applyReview(review, drawerRow, { decision }))
    flash('Review decision saved in this browser')
  }
  const saveComment = () => {
    const existing = voucherThread(drawerRow, threads, review)
    const note = (draftNote ?? (existing.comment || demoManagerDraft(drawerRow))).trim()
    if (!note) return flash('Enter your single manager comment before saving')
    if (existing.comment === note) return flash('No changes to the existing comment')
    const stamp = new Date().toISOString()
    const replies = Array.isArray(existing.replies) && existing.replies.length ? existing.replies : [simulatedAdvisorReply()]
    setThreads({ ...threads, [voucherKey(drawerRow)]: { ...existing, comment: note, createdAt: existing.createdAt || stamp, updatedAt: stamp, replies } })
    setReview(applyReview(review, drawerRow, { note, decision: review[drawerRow.id]?.decision || '' }))
    setDraftNote(note)
    flash(existing.comment ? 'Manager comment updated (saved in this browser)' : 'Manager comment saved in this browser')
  }
  const exportRows = () => {
    exportCSV(rows, review)
    flash('Reference-grouped demo postings exported')
  }

  const exportWidget = (id) => {
    const file = widgetExport(id, rows, filters, review)
    if (!file) return flash('No data to export for this widget')
    downloadCSV(file.filename, file.columns, file.lines)
    flash(`${file.title} exported as CSV`)
  }

  const select = (kind, value, month) => changeFilters((f) => applySelection(f, kind, value, month))
  const setFilter = (key, value) => changeFilters((f) => ({ ...f, [key]: value }))
  const clearOne = (key) => changeFilters((f) => clearFilter(f, key))
  const table = { page, onPage: setPage, sort, onSort: sortBy }
  const contentKey = [tab, page, sort.key, sort.direction, ...Object.values(filters)].join('|')

  return (
    <>
      <div className="shell" id="app">
        <Sidebar tab={tab} onGoto={goto} />
        <div className="main">
          <Header
            title={PAGE_TITLES[tab]} profile={profile} notifications={notifications} notificationsOpen={notificationsOpen}
            onToggleNotifications={() => setNotificationsOpen(!notificationsOpen)} onReadAll={readAllNotifications}
            onOpenNotification={openNotification} onProfile={openProfile} onLogout={onLogout}
          />
          <FilterToolbar filters={filters} chips={activeFilterChips(filters)} onFilter={setFilter} onDate={setDate} onClearOne={clearOne} />
          <main className="body" id="content">
            {tab === 'overview' ? (
              <PolicyWorkControl
                key={contentKey} rows={rows} filters={filters} review={review} threads={threads} table={table} fullscreen={fullscreen} onFullscreen={setFullscreen}
                onSelect={select} onClearOne={clearOne} onOpenReview={openReview} onExport={exportRows} onExportWidget={exportWidget} onViewAll={() => goto('transactions')}
              />
            ) : (
              <Transactions key={contentKey} rows={rows} review={review} threads={threads} table={table} onSortChoice={chooseSort} onOpenReview={openReview} onExport={exportRows} />
            )}
          </main>
        </div>
      </div>
      <Drawer kind={drawer?.kind} onClose={closeDrawer}>
        {drawerRow && (
          <ReviewDrawer
            key={drawerRow.id} row={drawerRow} review={review} threads={threads} focusDept={drawer.focusDept} draftNote={draftNote}
            onDraftChange={setDraftNote} onDecision={saveDecision} onSave={saveComment} onClose={closeDrawer}
          />
        )}
        {drawer?.kind === 'profile' && (
          <ProfileDrawer profile={profile} onSave={(manager) => setProfiles({ manager })} onToast={flash} onClose={closeDrawer} />
        )}
      </Drawer>
      <Toast toast={toast} />
      <ChartTooltip rows={rows} filters={filters} review={review} />
    </>
  )
}
