import { changeModel } from '../utils/policy.js'
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
    return percent == null ? { label: '—', direction: 0, zeroBaseline: false } : changeModel(percent)
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
