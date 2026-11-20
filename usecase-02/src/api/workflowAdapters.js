import { WorkflowError } from './workflowClient.js'

// Column names exactly as returned in body.data.data.metaData[].colName.
export const COLUMNS = {
  values: {
    net: 'Net Policy Expense', deb: 'Gross Policy Debits', credits: 'Credits / Offsets',
    lines: 'Policy Posting Entries', refs: 'Unique References', review: 'High-Value Review Candidates',
  },
  // The backend supplies no High-Value Review Candidates MoM, so it is intentionally absent here.
  mom: {
    net: 'MoM - Net Policy Expense', deb: 'MoM - Gross Policy Debits', credits: 'MoM - Credits / Offsets',
    lines: 'MoM - Policy Posting Entries', refs: 'MoM - Unique References',
  },
  trend: {
    net: 'Net Policy Expense Trend', deb: 'Gross Policy Debits Trend', credits: 'Credits / Offsets Trend',
    lines: 'Policy Posting Entries Trend', refs: 'Unique References Trend', review: 'High-Value Review Candidates Trend',
  },
  trendMonth: 'months',
  // Filter-option workflows: each returns one column (or, for the date bounds, two) read by colName.
  filters: { min: 'Min_Date', max: 'Max_Date', brand: 'Brand', department: 'Department', journal: 'Journal', reviewStatus: 'Review' },
  // Chart workflows.
  charts: {
    monthly: { month: 'Months', value: 'Net Policy Expense' },
    department: { name: 'Department', value: 'Net Policy Expense' },
    journal: { name: 'Journal Name', value: 'Net Policy Expense' },
    matrixName: 'Department',
  },
}

export const MATRIX_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Backend MoM numbers are displayed as received: explicit sign, two decimals, no scaling.
export function momChange(percent) {
  const rounded = Number(percent.toFixed(2))
  return {
    label: `${rounded < 0 ? '-' : '+'}${Math.abs(rounded).toFixed(2)}%`,
    direction: Math.sign(rounded),
    zeroBaseline: false,
  }
}

const fail = (message) => {
  throw new WorkflowError(message)
}

function toNumber(value, column) {
  if (value == null) return null
  const n = typeof value === 'string' && value.trim() === '' ? NaN : Number(value)
  return Number.isFinite(n) ? n : fail(`Invalid numeric value for "${column}"`)
}

// Validates the envelope and returns { rows, index(columnName) }, or null when the result set is empty.
function readResultSet(json) {
  if (!json || typeof json !== 'object') fail('Unexpected response format')
  if (String(json.status?.code) !== '200' || json.status?.value !== 'success' || json.error !== false) fail('Backend reported an unsuccessful response')
  const result = json.data?.data
  if (!Array.isArray(result?.resultSet) || !Array.isArray(result?.metaData)) fail('Unexpected response format')
  if (!result.resultSet.length) return null
  const index = (name) => {
    const column = result.metaData.find((m) => m?.colName === name)
    return Number.isInteger(column?.colIndex) ? column.colIndex : fail(`Response is missing the expected column "${name}"`)
  }
  return { rows: result.resultSet, index }
}

function readColumns(json, columns) {
  const result = readResultSet(json)
  if (!result) return null
  const positions = Object.fromEntries(Object.entries(columns).map(([key, name]) => [key, result.index(name)]))
  return { rows: result.rows, positions }
}

export function normalizeValues(json) {
  const table = readColumns(json, COLUMNS.values)
  if (!table) return { empty: true }
  return Object.fromEntries(Object.entries(table.positions).map(([key, position]) => [key, toNumber(table.rows[0][position], COLUMNS.values[key])]))
}

export function normalizeMom(json) {
  const table = readColumns(json, COLUMNS.mom)
  if (!table) return { empty: true }
  const change = (key) => {
    const percent = toNumber(table.rows[0][table.positions[key]], COLUMNS.mom[key])
    return percent == null ? { label: '—', direction: 0, zeroBaseline: false, unavailable: true } : momChange(percent)
  }
  return { net: change('net'), deb: change('deb'), credits: change('credits'), lines: change('lines'), refs: change('refs'), window: null }
}

export function normalizeTrend(json) {
  const table = readColumns(json, { month: COLUMNS.trendMonth, ...COLUMNS.trend })
  if (!table) return { empty: true }
  const rows = table.rows.map((row) => {
    if (!Array.isArray(row) || typeof row[table.positions.month] !== 'string') fail('Unexpected response format')
    return {
      month: row[table.positions.month],
      ...Object.fromEntries(Object.keys(COLUMNS.trend).map((key) => [key, toNumber(row[table.positions[key]], COLUMNS.trend[key])])),
    }
  })
  return { rows }
}

// ---- Filter-option workflows -------------------------------------------------------------

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

// Backend dates arrive as YYYY-MM-DD and are kept in that form (the date inputs use it too).
// The outgoing request format DD-MM-YYYY is produced separately by toWorkflowDate.
export function normalizeDateBounds(json) {
  const table = readColumns(json, { min: COLUMNS.filters.min, max: COLUMNS.filters.max })
  if (!table) return { empty: true }
  const row = table.rows[0]
  const [min, max] = [row[table.positions.min], row[table.positions.max]]
  if (min == null && max == null) return { empty: true }
  for (const value of [min, max]) if (typeof value !== 'string' || !ISO_DATE.test(value)) fail('Invalid date bound (expected YYYY-MM-DD)')
  if (min > max) fail('Invalid date bounds (Min_Date is after Max_Date)')
  return { min, max }
}

// Option values are kept exactly as the backend sends them (no trimming, no spelling fixes).
export function normalizeOptions(json, column) {
  const table = readColumns(json, { value: column })
  if (!table) return { empty: true }
  const options = []
  for (const row of table.rows) {
    const value = Array.isArray(row) ? row[table.positions.value] : fail('Unexpected response format')
    if (value == null) continue
    if (typeof value !== 'string') fail(`Invalid option value for "${column}"`)
    if (!options.includes(value)) options.push(value)
  }
  return options.length ? { options } : { empty: true }
}

export const normalizeBrandOptions = (json) => normalizeOptions(json, COLUMNS.filters.brand)
export const normalizeDepartmentOptions = (json) => normalizeOptions(json, COLUMNS.filters.department)
export const normalizeJournalOptions = (json) => normalizeOptions(json, COLUMNS.filters.journal)
export const normalizeReviewOptions = (json) => normalizeOptions(json, COLUMNS.filters.reviewStatus)

// ---- Chart workflows ---------------------------------------------------------------------

const text = (row, position) => (Array.isArray(row) && typeof row[position] === 'string' ? row[position] : fail('Unexpected response format'))

export function normalizeMonthlyTrend(json) {
  const table = readColumns(json, COLUMNS.charts.monthly)
  if (!table) return { empty: true }
  return { rows: table.rows.map((row) => ({ month: text(row, table.positions.month), value: toNumber(row[table.positions.value], COLUMNS.charts.monthly.value) })) }
}

const named = (columns) => (json) => {
  const table = readColumns(json, columns)
  if (!table) return { empty: true }
  return { items: table.rows.map((row) => ({ name: text(row, table.positions.name), value: toNumber(row[table.positions.value], columns.value) })) }
}
export const normalizeExpenseByDepartment = named(COLUMNS.charts.department)
export const normalizeExpenseByJournal = named(COLUMNS.charts.journal)

export function normalizeMatrix(json) {
  const table = readColumns(json, { name: COLUMNS.charts.matrixName, ...Object.fromEntries(MATRIX_MONTHS.map((m) => [m, m])) })
  if (!table) return { empty: true }
  return {
    months: MATRIX_MONTHS,
    rows: table.rows.map((row) => ({ name: text(row, table.positions.name), values: MATRIX_MONTHS.map((m) => toNumber(row[table.positions[m]], m)) })),
  }
}
