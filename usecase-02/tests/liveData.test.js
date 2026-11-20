import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import {
  COLUMNS, MATRIX_MONTHS, normalizeBrandOptions, normalizeDateBounds, normalizeDepartmentOptions, normalizeExpenseByDepartment,
  normalizeExpenseByJournal, normalizeJournalOptions, normalizeMatrix, normalizeMom, normalizeMonthlyTrend, normalizeOptions,
  normalizeReviewOptions, normalizeTrend, normalizeValues,
} from '../src/api/workflowAdapters.js'
import { WorkflowError, toWorkflowDate } from '../src/api/workflowClient.js'
import { CHART_WORKFLOW_IDS } from '../src/api/workflowConfig.js'
import { DEFAULT_FILTERS } from '../src/utils/policy.js'

// Fixtures are the backend team's response documents, kept verbatim in tests/fixtures. They prove the adapters
// parse that shape. They are NOT evidence of a successful authenticated request to the live API.
const load = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), 'utf8'))
const withResultSet = (fixture, resultSet) => {
  const copy = structuredClone(fixture)
  copy.data.data.resultSet = resultSet
  copy.data.data.queryInfo.totalRows = resultSet.length
  return copy
}
// Reverses the columns (metadata and values) and renumbers colIndex.
const reordered = (fixture) => {
  const copy = structuredClone(fixture)
  const { metaData, resultSet } = copy.data.data
  const last = metaData.length - 1
  copy.data.data.metaData = metaData.map((m) => ({ ...m, colIndex: last - m.colIndex })).reverse()
  copy.data.data.resultSet = resultSet.map((row) => [...row].reverse())
  return copy
}

// The values of one column of a fixture's result set.
const column = (fixture, index) => fixture.data.data.resultSet.map((row) => row[index])
const sum = (numbers) => numbers.reduce((total, n) => total + n, 0)
const CLOSE = 1e-6

const DATE = load('filter-date')
const BRAND = load('filter-brand')
const DEPARTMENT = load('filter-department')
const JOURNAL = load('filter-journal')
const REVIEW = load('filter-review-status')
const MONTHLY = load('chart-monthly-policy-expense-trend')
const BY_DEPARTMENT = load('chart-expense-by-department')
const BY_JOURNAL = load('chart-expense-by-journal')
const MATRIX = load('chart-department-month-review-matrix')
const VALUES_ZERO = load('widget-values-zero')
const MOM_NULL = load('widget-mom-null')
const TREND_EMPTY = load('widget-trend-empty')

// ---- Filters -------------------------------------------------------------------------------

test('date bounds are parsed from Min_Date / Max_Date as YYYY-MM-DD and the outgoing format stays DD-MM-YYYY', () => {
  const bounds = normalizeDateBounds(DATE)
  assert.deepEqual(bounds, { min: '2026-01-01', max: '2026-10-31' })
  assert.equal(toWorkflowDate(bounds.min), '01-01-2026')
  assert.equal(toWorkflowDate(bounds.max), '31-10-2026')
})

test('date bounds are found by column name, not position', () => {
  assert.deepEqual(normalizeDateBounds(reordered(DATE)), { min: '2026-01-01', max: '2026-10-31' })
})

test('date bounds reject malformed, inverted or missing values and report an empty result', () => {
  assert.throws(() => normalizeDateBounds(withResultSet(DATE, [['01-01-2026', '31-10-2026']])), WorkflowError)
  assert.throws(() => normalizeDateBounds(withResultSet(DATE, [['2026-10-31', '2026-01-01']])), WorkflowError)
  assert.throws(() => normalizeDateBounds(withResultSet(DATE, [['2026-01-01', null]])), WorkflowError)
  assert.deepEqual(normalizeDateBounds(withResultSet(DATE, [])), { empty: true })
  assert.deepEqual(normalizeDateBounds(withResultSet(DATE, [[null, null]])), { empty: true })
  const missing = structuredClone(DATE)
  missing.data.data.metaData[1].colName = 'Other'
  assert.throws(() => normalizeDateBounds(missing), /Max_Date/)
})

test('Brand returns every option the backend sent, in order', () => {
  assert.deepEqual(normalizeBrandOptions(BRAND), { options: ['Af', 'Fer', 'Jj', 'Mas'] })
})

test('Review Status keeps the exact backend value, including its spelling', () => {
  assert.deepEqual(normalizeReviewOptions(REVIEW), { options: ['Pendig'] })
})

test('Department and Journal options match the backend filter responses exactly, in order', () => {
  assert.deepEqual(normalizeDepartmentOptions(DEPARTMENT).options, column(DEPARTMENT, 0))
  const journals = normalizeJournalOptions(JOURNAL).options
  assert.equal(journals.length, 16)
  assert.deepEqual(journals, column(JOURNAL, 0))
})

test('empty Department and Journal option lists are still handled without errors', () => {
  assert.deepEqual(normalizeDepartmentOptions(withResultSet(DEPARTMENT, [])), { empty: true })
  assert.deepEqual(normalizeJournalOptions(withResultSet(JOURNAL, [])), { empty: true })
})

test('option lists are mapped by metadata and tolerate duplicates and nulls', () => {
  assert.deepEqual(normalizeOptions(withResultSet(BRAND, [['A'], [null], ['A'], [' b ']]), COLUMNS.filters.brand), { options: ['A', ' b '] })
  assert.throws(() => normalizeOptions(withResultSet(BRAND, [[1]]), COLUMNS.filters.brand), WorkflowError)
  assert.throws(() => normalizeOptions(BRAND, 'Journal'), /Journal/)
})

// ---- Charts ---------------------------------------------------------------------------------
// The backend has so far only returned empty result sets for the four charts, so populated rows below are
// SYNTHETIC structural rows used to prove metadata-driven mapping. They are not backend data.

test('all four chart fixtures have the backend column names and map to rows', () => {
  assert.deepEqual(MONTHLY.data.data.metaData.map((m) => m.colName), ['Months', 'Net Policy Expense'])
  assert.deepEqual(BY_DEPARTMENT.data.data.metaData.map((m) => m.colName), ['Department', 'Net Policy Expense'])
  assert.deepEqual(BY_JOURNAL.data.data.metaData.map((m) => m.colName), ['Journal Name', 'Net Policy Expense'])
  assert.deepEqual(MATRIX.data.data.metaData.map((m) => m.colName), ['Department', ...MATRIX_MONTHS])
  // the backend values are mapped through untouched, in row order, at full precision
  assert.deepEqual(normalizeMonthlyTrend(MONTHLY).rows.map((r) => [r.month, r.value]), MONTHLY.data.data.resultSet)
  assert.deepEqual(normalizeExpenseByDepartment(BY_DEPARTMENT).items.map((r) => [r.name, r.value]), BY_DEPARTMENT.data.data.resultSet)
  assert.deepEqual(normalizeExpenseByJournal(BY_JOURNAL).items.map((r) => [r.name, r.value]), BY_JOURNAL.data.data.resultSet)
  const matrix = normalizeMatrix(MATRIX)
  assert.deepEqual(matrix.rows.map((r) => [r.name, ...r.values]), MATRIX.data.data.resultSet)
})

test('empty chart result sets map to the empty state', () => {
  assert.deepEqual(normalizeMonthlyTrend(withResultSet(MONTHLY, [])), { empty: true })
  assert.deepEqual(normalizeExpenseByDepartment(withResultSet(BY_DEPARTMENT, [])), { empty: true })
  assert.deepEqual(normalizeExpenseByJournal(withResultSet(BY_JOURNAL, [])), { empty: true })
  assert.deepEqual(normalizeMatrix(withResultSet(MATRIX, [])), { empty: true })
})

test('the supplied chart responses have the expected sizes', () => {
  assert.equal(normalizeMonthlyTrend(MONTHLY).rows.length, 10)
  assert.equal(normalizeExpenseByDepartment(BY_DEPARTMENT).items.length, 13)
  assert.equal(normalizeExpenseByJournal(BY_JOURNAL).items.length, 16)
  assert.equal(normalizeMatrix(MATRIX).rows.length, 13)
})

test('Monthly Policy Expense Trend maps Months and Net Policy Expense by column name', () => {
  const rows = [['Jan', 100.5], ['Feb', -20], ['Mar', null]]
  const expected = { rows: [{ month: 'Jan', value: 100.5 }, { month: 'Feb', value: -20 }, { month: 'Mar', value: null }] }
  assert.deepEqual(normalizeMonthlyTrend(withResultSet(MONTHLY, rows)), expected)
  assert.deepEqual(normalizeMonthlyTrend(reordered(withResultSet(MONTHLY, rows))), expected)
  assert.throws(() => normalizeMonthlyTrend(withResultSet(MONTHLY, [[1, 2]])), WorkflowError)
})

test('Expense by Department and Expense by Journal map name and value by column name', () => {
  const rows = [['Alpha', 10], ['Beta', 0]]
  assert.deepEqual(normalizeExpenseByDepartment(withResultSet(BY_DEPARTMENT, rows)), { items: [{ name: 'Alpha', value: 10 }, { name: 'Beta', value: 0 }] })
  assert.deepEqual(normalizeExpenseByJournal(reordered(withResultSet(BY_JOURNAL, rows))), { items: [{ name: 'Alpha', value: 10 }, { name: 'Beta', value: 0 }] })
  assert.throws(() => normalizeExpenseByJournal(withResultSet(BY_DEPARTMENT, rows)), /Journal Name/)
})

test('Department x Month matrix has twelve month columns mapped by name', () => {
  assert.equal(MATRIX.data.data.metaData.length, 13)
  const row = ['Alpha', ...MATRIX_MONTHS.map((_, i) => i * 10)]
  const matrix = normalizeMatrix(withResultSet(MATRIX, [row, ['Beta', ...MATRIX_MONTHS.map(() => null)]]))
  assert.deepEqual(matrix.months, MATRIX_MONTHS)
  assert.equal(matrix.months.length, 12)
  assert.deepEqual(matrix.rows[0], { name: 'Alpha', values: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110] })
  assert.deepEqual(matrix.rows[1].values, Array(12).fill(null))
  assert.deepEqual(normalizeMatrix(reordered(withResultSet(MATRIX, [row]))).rows[0], matrix.rows[0])
  const missing = withResultSet(MATRIX, [row])
  missing.data.data.metaData.find((m) => m.colName === 'Dec').colName = 'December'
  assert.throws(() => normalizeMatrix(missing), /Dec/)
})

// ---- Cross-workflow consistency (assertions only: the app never recomputes backend values) ----

test('Expense by Department and Expense by Journal both total 992977.18', () => {
  assert.ok(Math.abs(sum(normalizeExpenseByDepartment(BY_DEPARTMENT).items.map((i) => i.value)) - 992977.18) < CLOSE)
  assert.ok(Math.abs(sum(normalizeExpenseByJournal(BY_JOURNAL).items.map((i) => i.value)) - 992977.18) < CLOSE)
  assert.ok(Math.abs(sum(normalizeMonthlyTrend(MONTHLY).rows.map((r) => r.value)) - 992977.18) < CLOSE)
})

test('each Department x Month column total reconciles with the Monthly Policy Expense Trend for Jan-Oct', () => {
  const matrix = normalizeMatrix(MATRIX)
  const trend = normalizeMonthlyTrend(MONTHLY).rows
  assert.equal(trend.length, 10)
  trend.forEach(({ month, value }, i) => {
    assert.equal(matrix.months[i], month)
    assert.ok(Math.abs(sum(matrix.rows.map((r) => r.values[i])) - value) < 1e-4, `${month} does not reconcile`)
  })
})

test('November and December stay zero in the matrix exactly as supplied', () => {
  const matrix = normalizeMatrix(MATRIX)
  for (const m of ['Nov', 'Dec']) {
    const i = matrix.months.indexOf(m)
    assert.deepEqual(matrix.rows.map((r) => r.values[i]), Array(13).fill(0))
  }
})

const DEPARTMENT_NAMES = [
  'Af Policy Work P&A', 'Af Policy Work Srv', 'Af Policy Work-Veh New', 'Af Policy Work-Veh Usd',
  'Fer Policy Work P&A', 'Fer Policy Work Srv', 'Fer Policy Work-Veh New', 'Fer Policy Work-Veh Usd',
  'Jj Policy Work-Veh Usd',
  'Mas Policy Work P&A', 'Mas Policy Work Srv', 'Mas Policy Work-Veh New', 'Mas Policy Work-Veh Usd',
]

test('the Department filter returns exactly the 13 backend options, in the backend order', () => {
  const { options } = normalizeDepartmentOptions(DEPARTMENT)
  assert.equal(DEPARTMENT.data.data.queryInfo.totalRows, 13)
  assert.equal(options.length, 13)
  assert.equal(new Set(options).size, 13)
  assert.deepEqual(options, DEPARTMENT_NAMES)
})

test('the Department filter names exactly match the Expense by Department and the Department x Month matrix names (set equality by exact string)', () => {
  const filter = normalizeDepartmentOptions(DEPARTMENT).options
  const chart = normalizeExpenseByDepartment(BY_DEPARTMENT).items.map((i) => i.name)
  const matrix = normalizeMatrix(MATRIX).rows.map((r) => r.name)
  assert.equal(chart.length, 13)
  assert.equal(matrix.length, 13)
  assert.deepEqual(new Set(filter), new Set(chart))
  assert.deepEqual(new Set(filter), new Set(matrix))
  assert.deepEqual([...filter].sort(), [...chart].sort())
  assert.deepEqual([...filter].sort(), [...matrix].sort())
  // the chart is ordered by expense, so position must never be used to compare
  assert.notDeepEqual(chart, filter)
})

test('all 13 Department options render in the Live Mode dropdown, and department selection and clearing are unchanged', () => {
  const options = normalizeDepartmentOptions(DEPARTMENT).options
  const slot = (status, data = null) => ({ status, data, error: null })
  const liveOptions = {
    date: slot('success', normalizeDateBounds(DATE)), brand: slot('success', normalizeBrandOptions(BRAND)),
    department: slot('success', { options }), journal: slot('success', normalizeJournalOptions(JOURNAL)), reviewStatus: slot('success', normalizeReviewOptions(REVIEW)),
  }
  const toolbar = (filters) => html('FilterToolbar', { filters, chips: [], liveOptions, onFilter: noop, onDate: noop, onClearOne: noop })
  const select = (out) => /<select id="department">(.*?)<\/select>/.exec(out)[1]
  const escape = (name) => name.replace(/&/g, '&amp;')

  const closed = select(toolbar(DEFAULT_FILTERS))
  assert.equal((closed.match(/<option /g) || []).length, 14) // "All departments" + 13
  for (const name of options) assert.ok(closed.includes(`<option value="${escape(name)}">${escape(name)}</option>`), name)

  // selecting each department (as the dropdown, donut slice or matrix row does) selects that exact option, and selecting it again clears it
  for (const name of options) {
    const selected = modules.policy.applySelection(DEFAULT_FILTERS, 'dept', name)
    assert.equal(selected.dept, name)
    assert.ok(select(toolbar(selected)).includes(`<option value="${escape(name)}" selected="">`), `${name} is not shown as selected`)
    assert.equal(modules.policy.applySelection(selected, 'dept', name).dept, 'all')
    assert.equal(modules.policy.clearFilter(selected, 'dept').dept, 'all')
  }
  assert.ok(select(toolbar(DEFAULT_FILTERS)).includes('<option value="all" selected="">All departments</option>'))
})

// ---- KPI edge cases -------------------------------------------------------------------------

test('all-zero KPI values stay valid zeros, not empty or missing', () => {
  const values = normalizeValues(VALUES_ZERO)
  assert.deepEqual(values, { net: 0, deb: 0, credits: 0, lines: 0, refs: 0, review: 0 })
  assert.equal(values.empty, undefined)
})

test('all-null MoM stays unavailable and is never turned into zero', () => {
  const mom = normalizeMom(MOM_NULL)
  for (const key of ['net', 'deb', 'credits', 'lines', 'refs']) {
    assert.deepEqual(mom[key], { label: '—', direction: 0, zeroBaseline: false, unavailable: true })
    assert.notEqual(mom[key].label, '+0.00%')
  }
  // a genuine zero is still a signed two-decimal value
  const zero = normalizeMom(withResultSet(MOM_NULL, [[0, 0, 0, 0, 0]]))
  assert.equal(zero.net.label, '+0.00%')
  assert.equal(zero.net.unavailable, undefined)
})

test('an empty KPI trend result is reported as empty', () => {
  assert.deepEqual(normalizeTrend(TREND_EMPTY), { empty: true })
})

test('the KPI trend and Monthly Policy Expense Trend use different column sets and adapters', () => {
  assert.equal(TREND_EMPTY.data.data.metaData.length, 7)
  assert.equal(MONTHLY.data.data.metaData.length, 2)
  assert.throws(() => normalizeTrend(withResultSet(MONTHLY, [['Jan', 1]])), /months/)
  assert.throws(() => normalizeMonthlyTrend(withResultSet(TREND_EMPTY, [['Jan', 1, 2, 3, 4, 5, 6]])), /Months/)
})

// ---- Rendering: Live Mode never falls back to demo data; Demo Mode is unchanged -------------------

let server
const modules = {}
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'silent', optimizeDeps: { noDiscovery: true } })
  for (const name of ['TrendChart', 'DonutChart', 'JournalBars', 'ReviewMatrix', 'FilterToolbar', 'KpiCard']) {
    modules[name] = (await server.ssrLoadModule(`/src/components/${name}.jsx`)).default
  }
  modules.ledger = await server.ssrLoadModule('/src/data/ledger.js')
  modules.policy = await server.ssrLoadModule('/src/utils/policy.js')
  modules.widgets = await server.ssrLoadModule('/src/utils/widgets.js')
  modules.tooltip = await server.ssrLoadModule('/src/utils/tooltip.js')
})
after(async () => {
  await server?.close()
})

const html = (name, props) => renderToStaticMarkup(createElement(modules[name], props))
const noop = () => {}
const demoRows = () => modules.policy.baseFilter(DEFAULT_FILTERS, {})

test('Live Mode with an empty chart result shows the empty state and no demo values', () => {
  const { DEPTS, JOURNALS } = modules.ledger
  const rows = demoRows()
  assert.ok(rows.length > 0)
  const empty = { rows, state: 'empty', onSelect: noop }
  for (const name of ['TrendChart', 'DonutChart', 'JournalBars', 'ReviewMatrix']) {
    const out = html(name, empty)
    assert.match(out, /class="graphEmpty">No .* for these filters</, name)
    assert.doesNotMatch(out, /\$\d/, `${name} leaked a dollar value`)
    assert.doesNotMatch(out, /<svg|<button|data-chart/, `${name} drew a chart`)
    for (const demo of [...DEPTS, ...JOURNALS]) assert.ok(!out.includes(demo), `${name} leaked "${demo}"`)
  }
})

test('Live Mode loading and error states also never show demo values', () => {
  const rows = demoRows()
  for (const name of ['TrendChart', 'DonutChart', 'JournalBars', 'ReviewMatrix']) {
    assert.match(html(name, { rows, state: 'loading', onSelect: noop }), /Loading/)
    assert.match(html(name, { rows, state: 'error', message: 'Not authorised', onSelect: noop }), /Not authorised/)
  }
})

test('Live Mode charts draw only the backend rows', () => {
  const rows = demoRows()
  const donut = html('DonutChart', { rows, items: [{ name: 'Alpha', value: 300 }, { name: 'Beta', value: 100 }], onSelect: noop })
  assert.match(donut, /Alpha/)
  assert.match(donut, /75\.0%/)
  assert.ok(!donut.includes('Used Vehicle Sales'))
  const journal = html('JournalBars', { rows, items: [{ name: 'J1', value: 50 }], onSelect: noop })
  assert.match(journal, /J1/)
  assert.ok(!journal.includes('Parts Sales'))
  const matrix = html('ReviewMatrix', { rows, matrix: { months: MATRIX_MONTHS, rows: [{ name: 'Alpha', values: [1000, ...Array(10).fill(null), 2000] }] }, onSelect: noop })
  assert.equal((matrix.match(/<button/g) || []).length, 12)
  assert.match(matrix, /1K/)
  assert.match(matrix, /2K/)
  assert.ok(!matrix.includes('Used Vehicle'))
  assert.match(html('TrendChart', { rows, series: [{ month: 'Jan', value: 5000 }, { month: 'Feb', value: 7000 }], onSelect: noop }), /<svg/)
})

test('Demo Mode renders the built-in demo data exactly as before', () => {
  const { DEPTS, JOURNALS, MONTHS } = modules.ledger
  const rows = demoRows()
  const donut = html('DonutChart', { rows, activeDept: 'all', onSelect: noop })
  for (const d of DEPTS) assert.ok(donut.includes(d.replace('&', '&amp;')), d)
  const journal = html('JournalBars', { rows, activeJournal: 'all', onSelect: noop })
  for (const j of JOURNALS) assert.ok(journal.includes(j.replace('&', '&amp;')), j)
  const matrix = html('ReviewMatrix', { rows, onSelect: noop })
  assert.equal((matrix.match(/<button/g) || []).length, DEPTS.length * MONTHS.length)
  assert.equal(MONTHS.length, 10)
  assert.ok(!matrix.includes('grid-template-columns'))
  assert.match(html('TrendChart', { rows, onSelect: noop }), /<svg[^>]*data-chart-trend/)
})

test('Demo Mode filter options are unchanged and Live Mode takes them from the backend only', () => {
  const { BRANDS, DEPTS, JOURNALS, REVIEW_STATUSES } = modules.ledger
  const base = { filters: DEFAULT_FILTERS, chips: [], onFilter: noop, onDate: noop, onClearOne: noop }
  const demo = html('FilterToolbar', base)
  for (const o of [...BRANDS, ...DEPTS, ...JOURNALS, ...REVIEW_STATUSES]) assert.ok(demo.includes(`>${o.replace('&', '&amp;')}<`), o)
  assert.ok(demo.includes('Date range · From / To (demo)'))

  const slot = (status, data = null) => ({ status, data, error: null })
  const live = {
    date: slot('success', { min: '2026-02-01', max: '2026-09-30' }),
    brand: slot('success', { options: ['Af', 'Fer', 'Jj', 'Mas'] }),
    department: slot('empty'),
    journal: slot('empty'),
    reviewStatus: slot('success', { options: ['Pendig'] }),
  }
  const out = html('FilterToolbar', { ...base, liveOptions: live })
  for (const o of ['Af', 'Fer', 'Jj', 'Mas', 'Pendig']) assert.ok(out.includes(`>${o}<`), o)
  for (const o of [...BRANDS, ...DEPTS, ...JOURNALS, ...REVIEW_STATUSES]) assert.ok(!out.includes(`>${o.replace('&', '&amp;')}<`), `demo option ${o} leaked`)
  assert.equal((out.match(/min="2026-02-01"/g) || []).length, 2)
  assert.equal((out.match(/max="2026-09-30"/g) || []).length, 2)
  // empty Department / Journal lists leave only the "All" entry
  assert.match(out, /<select id="department"><option value="all" selected="">All departments<\/option><\/select>/)
  assert.match(out, /<select id="journal"><option value="all" selected="">All journals<\/option><\/select>/)
  assert.ok(!out.includes('(demo)'))
})

test('KPI cards: zero is shown as a value, null MoM as unavailable, and an empty trend draws no sparkline', () => {
  const props = { index: 0, title: 'Net Policy Expense', value: '$0', change: normalizeMom(MOM_NULL).net, comparisonWindow: 'x', thresholdLabel: 't' }
  const unavailable = html('KpiCard', { ...props, sparkValues: [] })
  assert.match(unavailable, /class="value">\$0</)
  assert.match(unavailable, /MoM unavailable/)
  assert.ok(!unavailable.includes('vs. previous month'))
  assert.ok(!unavailable.includes('sparkLine'))
  const withTrend = html('KpiCard', { ...props, change: { label: '+1.00%', direction: 1, zeroBaseline: false }, sparkValues: [1, 3, 2] })
  assert.match(withTrend, /sparkLine/)
  assert.match(withTrend, /\+1\.00%/)
  const demo = html('KpiCard', { ...props, change: { label: '+1.0%', direction: 1, zeroBaseline: false } })
  assert.match(demo, /sparkLine/)
})

test('live exports contain only backend rows and are unavailable for empty charts', () => {
  const { widgetExport } = modules.widgets
  const slot = (status, data = null) => ({ status, data, error: null })
  const live = {
    monthly: slot('success', { rows: [{ month: 'Jan', value: 5 }] }),
    department: slot('empty'),
    journal: slot('success', { items: [{ name: 'J1', value: 2 }] }),
    matrix: slot('success', { months: MATRIX_MONTHS, rows: [{ name: 'A', values: Array(12).fill(1) }] }),
  }
  const rows = demoRows()
  assert.deepEqual(widgetExport('trend', rows, DEFAULT_FILTERS, {}, live).lines, [['Jan', 5]])
  assert.equal(widgetExport('department', rows, DEFAULT_FILTERS, {}, live), null)
  assert.deepEqual(widgetExport('journal', rows, DEFAULT_FILTERS, {}, live).columns, ['Journal Name', 'Net Policy Expense'])
  assert.equal(widgetExport('matrix', rows, DEFAULT_FILTERS, {}, live).columns.length, 13)
  // Demo Mode keeps exporting the demo ledger
  assert.equal(widgetExport('trend', rows, DEFAULT_FILTERS, {}, null).lines.length, 10)
})

// ---- Populated backend samples: every row is rendered and negative journal values keep their sign ----

const liveSlot = (data) => ({ status: 'success', data, error: null })
const journalItems = () => normalizeExpenseByJournal(BY_JOURNAL).items

test('all 13 department rows and all 16 journal rows are rendered, none dropped', () => {
  const rows = demoRows()
  const departments = normalizeExpenseByDepartment(BY_DEPARTMENT).items
  const donut = html('DonutChart', { rows, items: departments, onSelect: noop })
  assert.equal((donut.match(/class="legendItem/g) || []).length, 13)
  for (const { name } of departments) assert.ok(donut.includes(name.replace('&', '&amp;')), name)

  const journals = html('JournalBars', { rows, items: journalItems(), onSelect: noop })
  assert.equal((journals.match(/class="journalBar/g) || []).length, 16)
  for (const { name } of journalItems()) assert.ok(journals.includes(`>${name}<`), name)

  const matrix = html('ReviewMatrix', { rows, matrix: normalizeMatrix(MATRIX), onSelect: noop })
  assert.equal((matrix.match(/<button/g) || []).length, 13 * 12)
  assert.equal((matrix.match(/class="mLabel"/g) || []).length, 13)
})

test('negative journal values keep their minus sign in the chart labels and sit left of the zero line', () => {
  const out = html('JournalBars', { rows: demoRows(), items: journalItems(), onSelect: noop })
  assert.match(out, /Cash Receipts \(Balance Fwd\)<\/span>.*?<strong>−\$1,581 \(-0\.2%\)<\/strong>/)
  assert.match(out, /Warranty Credits<\/span>.*?<strong>−\$1,904 \(-0\.2%\)<\/strong>/)
  assert.match(out, /Service Sales Cash<\/span>.*?<strong>\$532,474 \(53\.6%\)<\/strong>/)

  const values = journalItems().map((i) => i.value)
  const low = Math.min(0, ...values)
  const span = Math.max(...values) - low
  const zero = ((-low / span) * 100).toFixed(1)
  const bar = (name) => out.split('<div class="journalBar').find((chunk) => chunk.includes(`>${name}<`))
  const leftOf = (name) => Number(/margin-left:([\d.]+)%/.exec(bar(name))[1])
  // positive bars start at zero, negative bars end at zero (they start to its left and are as wide as their value)
  assert.equal(leftOf('Service Sales Cash'), Number(zero))
  for (const name of ['Cash Receipts (Balance Fwd)', 'Warranty Credits']) {
    assert.ok(leftOf(name) < Number(zero), `${name} is not left of zero`)
    assert.match(bar(name), /#27cfae/)
  }
  assert.match(out, new RegExp(`left:${zero}%`))
  // no bar is clipped outside the track
  for (const chunk of out.split('<div class="journalBar').slice(1)) {
    const [, left, width] = /margin-left:([\d.]+)%;width:([\d.]+)%/.exec(chunk)
    assert.ok(Number(left) >= 0 && Number(left) + Number(width) <= 100.1)
  }
})

test('without negative values the live journal bars are laid out as before (no zero line)', () => {
  const out = html('JournalBars', { rows: demoRows(), items: [{ name: 'A', value: 50 }, { name: 'B', value: 100 }], onSelect: noop })
  assert.match(out, /margin-left:0\.0%;width:50\.0%/)
  assert.match(out, /margin-left:0\.0%;width:100\.0%/)
  assert.ok(!out.includes('position:relative'))
})

test('the journal tooltip preserves the negative sign', () => {
  const live = { journal: liveSlot({ items: journalItems() }) }
  const tip = (name) => modules.tooltip.tooltipModel(
    { target: { closest: (selector) => (selector.includes('data-chart-journal') ? { dataset: { chartJournal: name } } : null) } },
    demoRows(), DEFAULT_FILTERS, {}, live,
  )
  assert.equal(tip('Cash Receipts (Balance Fwd)').value, '−$1,581')
  assert.equal(tip('Warranty Credits').value, '−$1,904')
  assert.match(tip('Warranty Credits').percent, /^-/)
  assert.equal(tip('Service Sales Cash').value, '$532,474')
})

test('the journal CSV export keeps the original negative values and every row', () => {
  const live = { journal: liveSlot({ items: journalItems() }) }
  const file = modules.widgets.widgetExport('journal', demoRows(), DEFAULT_FILTERS, {}, live)
  assert.equal(file.lines.length, 16)
  assert.deepEqual(file.lines, BY_JOURNAL.data.data.resultSet)
  assert.deepEqual(file.lines.filter(([, value]) => value < 0), [['Cash Receipts (Balance Fwd)', -1581.02], ['Warranty Credits', -1904.1799999999996]])
  assert.equal(String(file.lines[15][1]), '-1904.1799999999996')
})

test('the matrix tooltip keeps the sign of a negative cell', () => {
  const matrix = normalizeMatrix(MATRIX)
  const i = matrix.rows.findIndex((r) => r.name === 'Fer Policy Work-Veh Usd')
  const june = matrix.months.indexOf('Jun')
  const tip = modules.tooltip.tooltipModel(
    { target: { closest: (selector) => (selector.includes('data-chart-heat') ? { dataset: { chartHeat: `${i},${june}` } } : null) } },
    demoRows(), DEFAULT_FILTERS, {}, { matrix: liveSlot(matrix) },
  )
  assert.equal(tip.value, '−$26,097')
  assert.equal(tip.label, 'Fer Policy Work-Veh Usd · Jun')
})

// ---- Final consistency audit ----------------------------------------------------------------

test('the Journal filter and Expense by Journal chart hold exactly the same 16 names (compared by exact string, not position)', () => {
  const filter = normalizeJournalOptions(JOURNAL).options
  const chart = normalizeExpenseByJournal(BY_JOURNAL).items.map((i) => i.name)
  assert.equal(filter.length, 16)
  assert.equal(chart.length, 16)
  assert.equal(new Set(filter).size, 16)
  assert.equal(new Set(chart).size, 16)
  assert.deepEqual(new Set(chart), new Set(filter))
  assert.deepEqual([...chart].sort(), [...filter].sort())
  // the row order does differ between the two workflows, which is why position must never be used
  assert.notDeepEqual(chart, filter)
})

test('clicking a journal bar selects the exact matching Journal filter option', () => {
  const options = normalizeJournalOptions(JOURNAL).options
  const items = normalizeExpenseByJournal(BY_JOURNAL).items
  const slot = (status, data = null) => ({ status, data, error: null })
  const liveOptions = {
    date: slot('success', normalizeDateBounds(DATE)), brand: slot('success', normalizeBrandOptions(BRAND)),
    department: slot('success', normalizeDepartmentOptions(DEPARTMENT)), journal: slot('success', { options }), reviewStatus: slot('success', normalizeReviewOptions(REVIEW)),
  }
  for (const { name } of items) {
    let clicked
    html('JournalBars', { rows: demoRows(), items, onSelect: (kind, value) => { clicked = [kind, value] } })
    // the bar's click handler is `onSelect('journal', name)`; apply it the way the dashboard does
    const filters = modules.policy.applySelection(DEFAULT_FILTERS, 'journal', name)
    assert.equal(filters.journal, name)
    assert.ok(options.includes(name), `no filter option for "${name}"`)
    const toolbar = html('FilterToolbar', { filters, chips: [], liveOptions, onFilter: noop, onDate: noop, onClearOne: noop })
    const escaped = name.replace(/&/g, '&amp;')
    assert.ok(toolbar.includes(`<option value="${escaped}" selected="">${escaped}</option>`), `"${name}" is not the selected option`)
    assert.equal(clicked, undefined)
  }
  // clicking the same bar again clears the filter (existing toggle behaviour)
  assert.equal(modules.policy.applySelection({ ...DEFAULT_FILTERS, journal: 'Warranty Credits' }, 'journal', 'Warranty Credits').journal, 'all')
})

test('the registered Expense by Journal workflow ID is the full 36-character ID and is the one the app calls', () => {
  assert.equal(CHART_WORKFLOW_IDS.expenseByJournal, '102810d7-e317-11f1-a77e-e5d170f381f7')
  assert.equal(CHART_WORKFLOW_IDS.expenseByJournal.length, 36)
  assert.ok(CHART_WORKFLOW_IDS.expenseByJournal.endsWith('381f7'))
  const hook = readFileSync(new URL('../src/hooks/useWorkflowData.js', import.meta.url), 'utf8')
  assert.match(hook, /\['journal', CHART_WORKFLOW_IDS\.expenseByJournal, normalizeExpenseByJournal\]/)
})

test('Demo Mode journal bars keep their original rendering, even for a negative journal total', () => {
  const { JOURNALS } = modules.ledger
  const base = demoRows()[0]
  const rows = [{ ...base, journal: JOURNALS[0], amount: -500 }, { ...base, journal: JOURNALS[1], amount: 1000 }]
  const out = html('JournalBars', { rows, activeJournal: 'all', onSelect: noop })
  assert.equal((out.match(/class="journalBar/g) || []).length, JOURNALS.length)
  assert.ok(!out.includes('margin-left'))
  assert.ok(!out.includes('position:'))
  assert.ok(!out.includes('#27cfae'))
  assert.ok(!out.includes('−'))
  // original behaviour: width is the absolute value relative to the largest, and the label is unsigned
  assert.ok(out.includes(`<span>${JOURNALS[0]}</span><div class="track"><div style="width:50.0%"></div></div><strong>$500 `))
})
