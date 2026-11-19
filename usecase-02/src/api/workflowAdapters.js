import { MONTHS } from '../data/ledger.js'
import { changeModel } from '../utils/policy.js'
import { WorkflowError } from './workflowClient.js'

// Every field the UI needs. All entries stay null until the backend supplies a response sample.
// Paths are dot-separated property names inside the response JSON.
export const RESPONSE_MAPPING = {
  // TODO(backend): response sample for Widget Values; do the six KPIs (including High-Value candidates) come from this workflow?
  values: null, // { net, deb, credits, lines, refs, review } -> path of each number
  // TODO(backend): response sample for Widget MOM; percentage or current/previous pair? comparison period? is there a High-Value MoM?
  mom: null, // { net, deb, credits, lines, refs, window } -> path of each month-over-month percentage, and of the period text
  // TODO(backend): response sample for Widget Trend; month keys and coverage (Jan-Oct 2026?)
  trend: null, // { rows, month, amount } -> path of the array, then the month and amount keys inside each item
}

const MAPPING_PENDING = 'Response mapping not configured — awaiting backend response sample'

const pick = (json, path) => path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), json)

function toNumber(value) {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const isEmptyPayload = (json) => json == null || (Array.isArray(json) ? json.length === 0 : typeof json === 'object' && Object.keys(json).length === 0)

function mapped(json, section) {
  if (!RESPONSE_MAPPING[section]) throw new WorkflowError(MAPPING_PENDING)
  return isEmptyPayload(json) ? null : RESPONSE_MAPPING[section]
}

export function normalizeValues(json) {
  const mapping = mapped(json, 'values')
  if (!mapping) return { empty: true }
  return Object.fromEntries(['net', 'deb', 'credits', 'lines', 'refs', 'review'].map((stat) => [stat, toNumber(pick(json, mapping[stat]))]))
}

export function normalizeMom(json) {
  const mapping = mapped(json, 'mom')
  if (!mapping) return { empty: true }
  const change = (stat) => {
    const percent = toNumber(pick(json, mapping[stat]))
    return percent == null ? { label: '—', direction: 0, zeroBaseline: false } : changeModel(percent)
  }
  const window = pick(json, mapping.window)
  return { net: change('net'), deb: change('deb'), credits: change('credits'), lines: change('lines'), refs: change('refs'), window: typeof window === 'string' ? window : null }
}

export function normalizeTrend(json) {
  const mapping = mapped(json, 'trend')
  if (!mapping) return { empty: true }
  const items = pick(json, mapping.rows)
  if (!Array.isArray(items)) throw new WorkflowError('Unexpected response format')
  const values = MONTHS.map(() => null)
  for (const item of items) {
    const index = MONTHS.findIndex((m) => String(item[mapping.month]).trim().toLowerCase().startsWith(m.toLowerCase()))
    if (index < 0 || values[index] !== null) throw new WorkflowError('Trend periods do not match the chart axis')
    values[index] = toNumber(item[mapping.amount])
  }
  return values
}
