import { LINES_BY_REF, MONTHS, ROWS } from '../data/ledger.js'

export const HIGH_VALUE_THRESHOLD = 5000
export const DEFAULT_START = '2026-01-01'
export const DEFAULT_END = '2026-10-31'
export const DEFAULT_FILTERS = {
  dateStart: DEFAULT_START, dateEnd: DEFAULT_END, brand: 'all', dept: 'all', journal: 'all', status: 'all',
  metric: 'all', flag: 'all', focus: 'Used Vehicle Sales',
}

export const FLAG_SPEC = {
  cross: { label: 'Service charged to other department', note: 'Service Sales journal charged to a non-Service department', color: '#fa2856' },
  weak: { label: 'Missing description', note: 'Description blank or explicitly unavailable', color: '#ffc032' },
  duplicate: { label: 'Repeated reference (review)', note: 'Several GL lines share the reference; not proof of duplication', color: '#ffba36' },
  offset: { label: 'Offset / reversal match (candidate)', note: 'Opposite signed amounts sharing reference and account; verify the underlying adjustment', color: '#00cebe' },
  coupon: { label: 'Potential coupon or discount mention', note: 'GL narrative mentions coupon or discount', color: '#00cebe' },
}
const FLAG_NAMES = {
  high: 'High value', weak: 'Missing description', offset: 'Offset match candidates',
  cross: 'Cross-department service', duplicate: 'Repeated reference', coupon: 'Coupon/discount',
}
const METRIC_NAMES = {
  net: 'Net expense', debits: 'Debit postings', credits: 'Credit postings', lines: 'Posting lines',
  refs: 'References', high: 'High-value', open: 'Open review',
}

export const status = (r, review) => review[r.id]?.decision || ((review[r.id]?.note || '').trim() ? 'Commented' : 'Pending')
export const hasNotes = (r, review) => !!(review[r.id]?.note || '').trim()
export const accountLabel = (r) => r.accountdescription || 'Account description unavailable'
export const sumBy = (rows, key) => rows.reduce((acc, r) => ((acc[r[key]] = (acc[r[key]] || 0) + r.amount), acc), {})
export const sumNet = (rows) => rows.reduce((s, r) => s + r.amount, 0)
export const distinctRefs = (rows) => new Set(rows.map((r) => r.ref)).size

export function matchFlag(r, flag) {
  switch (flag) {
    case 'high': return Math.abs(r.amount) >= HIGH_VALUE_THRESHOLD
    case 'cross': return r.journal === 'Service Sales' && r.dept !== 'Service'
    case 'weak': return !r.description.trim() || /not provided|not supplied|missing description|description unavailable/i.test(r.description)
    case 'duplicate': return r.glEntryCount > 1
    case 'offset': return r.hasOffset
    case 'coupon': return /coupon|discount/i.test(r.description)
    default: return true
  }
}

const METRIC_TESTS = {
  debits: (r) => r.amount > 0,
  credits: (r) => r.amount < 0,
  high: (r) => matchFlag(r, 'high'),
  open: (r, review) => status(r, review) !== 'Reviewed',
}

export function baseFilter(filters, review, { ignoreDate = false, ignoreFlag = false } = {}) {
  const metricTest = METRIC_TESTS[filters.metric]
  return ROWS.filter((r) =>
    (filters.brand === 'all' || r.brand === filters.brand) &&
    (ignoreDate || (r.postDate >= filters.dateStart && r.postDate <= filters.dateEnd)) &&
    (filters.dept === 'all' || r.dept === filters.dept) &&
    (filters.journal === 'all' || r.journal === filters.journal) &&
    (filters.status === 'all' || status(r, review) === filters.status) &&
    (ignoreFlag || filters.flag === 'all' || matchFlag(r, filters.flag)) &&
    (!metricTest || metricTest(r, review)))
}

export const getStats = (rows) => ({
  net: sumNet(rows),
  deb: rows.reduce((s, r) => s + r.policyDebit, 0),
  credits: rows.reduce((s, r) => s + r.policyCredit, 0),
  lines: rows.reduce((s, r) => s + r.policyLineCount, 0),
  refs: distinctRefs(rows),
  review: rows.filter((r) => matchFlag(r, 'high')).length,
})

export function monthComparison(filters, review) {
  const pad = (n) => String(n).padStart(2, '0')
  const latest = filters.dateEnd.slice(0, 7)
  const [year, month] = latest.split('-').map(Number)
  const previous = new Date(Date.UTC(year, month - 2, 1)).toISOString().slice(0, 7)
  const previousDays = new Date(Date.UTC(year, month - 1, 0)).getUTCDate()
  const startDay = filters.dateStart.slice(0, 7) === latest ? Number(filters.dateStart.slice(8, 10)) : 1
  const endDay = Number(filters.dateEnd.slice(8, 10))
  const currentStart = `${latest}-${pad(startDay)}`
  const previousStart = `${previous}-${pad(Math.min(startDay, previousDays))}`
  const previousEnd = `${previous}-${pad(Math.min(endDay, previousDays))}`
  const scoped = baseFilter(filters, review, { ignoreDate: true })
  return {
    current: getStats(scoped.filter((r) => r.postDate >= currentStart && r.postDate <= filters.dateEnd)),
    prior: getStats(scoped.filter((r) => r.postDate >= previousStart && r.postDate <= previousEnd)),
    window: `${currentStart} to ${filters.dateEnd} compared with ${previousStart} to ${previousEnd}`,
  }
}

export function momValue(current, previous) {
  if (previous === 0) return { label: current === 0 ? '0.0%' : 'N/A', direction: 0, zeroBaseline: current !== 0 }
  const change = ((current - previous) / Math.abs(previous)) * 100
  const normal = Math.abs(change) < 0.05 ? 0 : change
  return {
    label: (normal > 0 ? '+' : normal < 0 ? '−' : '') + Math.abs(normal).toFixed(1) + '%',
    direction: normal > 0 ? 1 : normal < 0 ? -1 : 0,
    zeroBaseline: false,
  }
}

const monthRange = (index) => {
  const m = `2026-${String(index + 1).padStart(2, '0')}`
  return [`${m}-01`, `${m}-${new Date(2026, index + 1, 0).getDate()}`]
}

export function applySelection(filters, kind, value, month) {
  const toggle = (key) => ({ ...filters, [key]: filters[key] === value ? 'all' : value })
  switch (kind) {
    case 'month': {
      const [start, end] = monthRange(MONTHS.indexOf(value))
      const same = filters.dateStart === start && filters.dateEnd === end
      return { ...filters, dateStart: same ? DEFAULT_START : start, dateEnd: same ? DEFAULT_END : end }
    }
    case 'dept': return { ...toggle('dept'), focus: value }
    case 'matrix': {
      const [start, end] = monthRange(MONTHS.indexOf(month))
      return { ...filters, dept: value, focus: value, dateStart: start, dateEnd: end }
    }
    default: return toggle(kind)
  }
}

export function clearFilter(filters, key) {
  if (key === 'all') return DEFAULT_FILTERS
  if (key === 'date') return { ...filters, dateStart: DEFAULT_START, dateEnd: DEFAULT_END }
  return { ...filters, [key]: 'all' }
}

export function activeFilterChips(f) {
  const chips = []
  if (f.dateStart !== DEFAULT_START || f.dateEnd !== DEFAULT_END) chips.push(['date', `${f.dateStart} → ${f.dateEnd}`])
  for (const key of ['brand', 'dept', 'journal', 'status']) if (f[key] !== 'all') chips.push([key, f[key]])
  if (f.metric !== 'all') chips.push(['metric', METRIC_NAMES[f.metric] || f.metric])
  if (f.flag !== 'all') chips.push(['flag', FLAG_NAMES[f.flag] || f.flag])
  return chips
}

const PRIORITY_RULES = [
  ['high', 3, 'Large absolute amount'], ['weak', 3, 'Missing description'], ['cross', 2, 'Service charge to another department'],
  ['offset', 2, 'Matching debit / credit candidate'], ['duplicate', 1, 'Repeated reference'], ['coupon', 2, 'Coupon or discount mention'],
]

export function rankPriority(rows, review) {
  const pending = rows.filter((r) => status(r, review) !== 'Reviewed')
  const ranked = (pending.length ? pending : rows).map((r) => {
    const hits = PRIORITY_RULES.filter(([flag]) => matchFlag(r, flag))
    return { r, score: hits.reduce((s, [, points]) => s + points, 0), reasons: hits.map(([, , label]) => label), magnitude: Math.abs(r.amount) }
  })
  ranked.sort((a, b) => b.score - a.score || b.magnitude - a.magnitude || a.r.ref.localeCompare(b.r.ref))
  return ranked[0]
}

const jvNumber = (r) => String(r.postingtime ?? '').trim()

export const SORT_COLUMNS = [
  ['ref', 'Reference / RO'], ['jv', 'JV Number'], ['postDate', 'Demo Date'], ['journal', 'Journal'], ['dept', 'Charged department'],
  ['account', 'Account'], ['description', 'Description'], ['amount', 'Amount'], ['status', 'Review Status'], ['notes', 'Notes'],
]

function sortValue(r, key, review) {
  switch (key) {
    case 'jv': return jvNumber(r)
    case 'postDate': case 'journal': case 'dept': case 'account': case 'description': return r[key]
    case 'amount': return r.amount
    case 'status': return status(r, review)
    case 'notes': return hasNotes(r, review) ? 1 : 0
    default: return r.ref
  }
}

export function sortRows(rows, key, direction, review) {
  const dir = direction === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    const x = sortValue(a, key, review)
    const y = sortValue(b, key, review)
    const diff = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'en', { numeric: true, sensitivity: 'base' })
    return diff === 0 ? a.ref.localeCompare(b.ref, 'en', { numeric: true }) : diff * dir
  })
}

export const voucherEntries = (r) => LINES_BY_REF.get(r.ref) || [r]
export const voucherKey = (r) => `jv:DEMO:${jvNumber(r)}`

export function displayJV(r) {
  const j = r.jvNumbers
  return j.length > 1 ? `${j[0]} (+${j.length - 1})` : j[0]
}

export function voucherThread(r, threads, review) {
  const t = threads[voucherKey(r)]
  return t && typeof t === 'object' ? t : { comment: (review[r.id]?.note || '').trim(), replies: [], createdAt: null, updatedAt: null }
}

export const demoManagerDraft = (r) =>
  `Please verify the policy expense postings and department allocation for reference ${r.ref}. Confirm whether the available GL evidence supports the charge and advise if any correction is required.`

const ADVISOR_REPLIES = [
  'Demo resolution: The policy charge was reviewed against the illustrative approval workflow and marked resolved. No correction is required in this simulated case.',
  'Demo resolution: The department allocation was reviewed and the simulated discrepancy was corrected. This is a demonstration outcome only.',
  'Demo resolution: The questioned expense was traced to an illustrative goodwill approval and marked resolved for demonstration purposes.',
]

export const simulatedAdvisorReply = () => ({
  id: `demo-reply-${Date.now()}`,
  text: ADVISOR_REPLIES[Math.floor(Math.random() * ADVISOR_REPLIES.length)],
  name: 'Demo Service Advisor (simulated)',
  time: new Date().toISOString(),
  demoGenerated: true,
})

export function applyReview(review, r, patch) {
  const next = { ...review }
  for (const entry of [r, ...voucherEntries(r)]) next[entry.id] = { ...(review[entry.id] || {}), ...patch }
  return next
}
