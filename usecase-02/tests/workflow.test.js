import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { normalizeMom, normalizeTrend, normalizeValues } from '../src/api/workflowAdapters.js'
import { WorkflowError, postWorkflow, toWorkflowDate, toWorkflowVariables } from '../src/api/workflowClient.js'
import { DEFAULT_FILTERS } from '../src/utils/policy.js'

// Complete response objects supplied by the backend team (see tests/fixtures). They are local fixtures,
// not evidence of a successful authenticated request to the live API.
const load = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), 'utf8'))
const VALUES = load('widget-values')
const MOM = load('widget-mom')
const TREND = load('widget-trend')

// Same response with its columns (metadata and values) in reverse order and colIndex renumbered.
function reordered(fixture) {
  const copy = structuredClone(fixture)
  const { metaData, resultSet } = copy.data.data
  const last = metaData.length - 1
  copy.data.data.metaData = metaData.map((m) => ({ ...m, colIndex: last - m.colIndex })).reverse()
  copy.data.data.resultSet = resultSet.map((row) => [...row].reverse())
  return copy
}

const withResultSet = (fixture, resultSet) => {
  const copy = structuredClone(fixture)
  copy.data.data.resultSet = resultSet
  copy.data.data.queryInfo.totalRows = resultSet.length
  return copy
}

const MONTHS_RETURNED = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']

test('fixtures keep the complete response envelope', () => {
  for (const [fixture, columns, rows] of [[VALUES, 6, 1], [MOM, 5, 1], [TREND, 7, 10]]) {
    assert.deepEqual(fixture.version, { name: 'vanilla', version: 'Lumenore Studio' })
    assert.deepEqual(fixture.status, { code: '200', value: 'success' })
    assert.equal(fixture.error, false)
    assert.deepEqual(fixture.data.data.queryInfo, { totalRows: rows, type: 'selected' })
    assert.equal(fixture.data.data.resultSet.length, rows)
    assert.equal(fixture.data.data.metaData.length, columns)
    for (const m of fixture.data.data.metaData) {
      assert.deepEqual(Object.keys(m), ['colIndex', 'colName', 'colType', 'colId', 'cryptographicFunction'])
      assert.equal(m.colId, m.colName)
      assert.equal(m.cryptographicFunction, 'NONE')
    }
  }
})

test('Widget Values maps all six KPI values exactly', () => {
  assert.deepEqual(normalizeValues(VALUES), {
    net: 992977.1799999999, deb: 1152195.13, credits: 159217.94999999998, lines: 3066, refs: 2238, review: 49,
  })
})

test('Widget Values maps by column name when the order changes', () => {
  assert.deepEqual(normalizeValues(reordered(VALUES)), normalizeValues(VALUES))
})

test('Widget Values keeps zero as a value and reports missing columns, bad numbers and bad envelopes', () => {
  assert.equal(normalizeValues(withResultSet(VALUES, [[0, 0, 0, 0, 0, 0]])).refs, 0)
  const missing = structuredClone(VALUES)
  missing.data.data.metaData.pop()
  assert.throws(() => normalizeValues(missing), /missing the expected column "High-Value Review Candidates"/)
  assert.throws(() => normalizeValues(withResultSet(VALUES, [['x', 1, 2, 3, 4, 5]])), /Invalid numeric value/)
  assert.throws(() => normalizeValues({ ...VALUES, error: true }), WorkflowError)
  assert.throws(() => normalizeValues({ ...VALUES, status: { code: '500', value: 'failure' } }), WorkflowError)
  assert.throws(() => normalizeValues({ status: VALUES.status, error: false }), /Unexpected response format/)
})

test('an empty result set is reported as empty, not as zeros', () => {
  assert.deepEqual(normalizeValues(withResultSet(VALUES, [])), { empty: true })
  assert.deepEqual(normalizeMom(withResultSet(MOM, [])), { empty: true })
  assert.deepEqual(normalizeTrend(withResultSet(TREND, [])), { empty: true })
})

test('Widget MOM maps the five supplied values unscaled, keeping signs, with no High-Value entry', () => {
  const mom = normalizeMom(MOM)
  assert.deepEqual(Object.keys(mom).sort(), ['credits', 'deb', 'lines', 'net', 'refs', 'window'])
  assert.deepEqual(mom.net, { label: '+17.2%', direction: 1, zeroBaseline: false })
  assert.deepEqual(mom.deb, { label: '+15.9%', direction: 1, zeroBaseline: false })
  assert.deepEqual(mom.credits, { label: '+3.4%', direction: 1, zeroBaseline: false })
  assert.deepEqual(mom.lines, { label: '−3.0%', direction: -1, zeroBaseline: false })
  assert.deepEqual(mom.refs, { label: '−2.8%', direction: -1, zeroBaseline: false })
  assert.equal(mom.window, null)
  assert.equal('review' in mom, false)
})

test('Widget MOM maps by column name when the order changes, and handles zero', () => {
  assert.deepEqual(normalizeMom(reordered(MOM)), normalizeMom(MOM))
  assert.deepEqual(normalizeMom(withResultSet(MOM, [[0, 0, 0, 0, 0]])).net, { label: '0.0%', direction: 0, zeroBaseline: false })
})

test('Widget Trend maps all ten rows and six series exactly, in backend order', () => {
  const { rows } = normalizeTrend(TREND)
  assert.deepEqual(rows.map((r) => r.month), MONTHS_RETURNED)
  assert.deepEqual(rows[0], { month: 'Jan', net: 107554.79000000001, deb: 117451.23000000001, credits: 9896.44, lines: 327, refs: 247, review: 7 })
  assert.deepEqual(rows[2], { month: 'Mar', net: 71061.47, deb: 93437.79000000001, credits: 22376.319999999996, lines: 306, refs: 239, review: 3 })
  assert.deepEqual(rows[9], { month: 'Oct', net: 119688.04, deb: 130961.07999999999, credits: 11273.04, lines: 286, refs: 227, review: 5 })
  assert.equal(rows.length, 10)
})

test('Widget Trend maps by column name when the order changes', () => {
  assert.deepEqual(normalizeTrend(reordered(TREND)), normalizeTrend(TREND))
})

test('Widget Trend keeps the returned labels and order, without a fixed axis or an invented year', () => {
  const { rows } = normalizeTrend(withResultSet(TREND, [['Mar', 1, 2, 3, 4, 5, 6], ['Jan', 7, 8, 9, 10, 11, 12]]))
  assert.deepEqual(rows.map((r) => r.month), ['Mar', 'Jan'])
  assert.equal(rows.length, 2)
  assert.equal(normalizeTrend(withResultSet(TREND, [['Jan', 0, 0, 0, 0, 0, 0]])).rows[0].net, 0)
  assert.throws(() => normalizeTrend(withResultSet(TREND, [[null, 1, 2, 3, 4, 5, 6]])), /Unexpected response format/)
})

test('Filters map to all six workflow variables with DD-MM-YYYY dates', () => {
  assert.deepEqual(toWorkflowVariables(DEFAULT_FILTERS), {
    Brand: '', Department: '', Journal: '', Review_Status: '', Min_Date: '01-01-2026', Max_Date: '31-10-2026',
  })
  const selected = { ...DEFAULT_FILTERS, brand: 'Ferrari', dept: 'Service', journal: 'Parts Sales', status: 'Needs Action', dateStart: '2026-03-09', dateEnd: '2026-07-31' }
  assert.deepEqual(toWorkflowVariables(selected), {
    Brand: 'Ferrari', Department: 'Service', Journal: 'Parts Sales', Review_Status: 'Needs Action', Min_Date: '09-03-2026', Max_Date: '31-07-2026',
  })
  assert.equal(toWorkflowDate(''), '')
})

test('Any of the six filters changes the request key that drives the three workflows', () => {
  const base = JSON.stringify(toWorkflowVariables(DEFAULT_FILTERS))
  for (const change of [{ brand: 'Ferrari' }, { dept: 'Service' }, { journal: 'Parts Sales' }, { status: 'Pending' }, { dateStart: '2026-02-01' }, { dateEnd: '2026-09-30' }]) {
    assert.notEqual(JSON.stringify(toWorkflowVariables({ ...DEFAULT_FILTERS, ...change })), base)
  }
  for (const change of [{ metric: 'net' }, { flag: 'cross' }, { focus: 'Service' }]) {
    assert.equal(JSON.stringify(toWorkflowVariables({ ...DEFAULT_FILTERS, ...change })), base)
  }
})

test('postWorkflow sends multipart data with the application-id header and no content type', async () => {
  const original = globalThis.fetch
  let call
  globalThis.fetch = async (url, options) => {
    call = { url, options }
    return new Response(JSON.stringify(VALUES), { status: 200 })
  }
  try {
    const variables = toWorkflowVariables(DEFAULT_FILTERS)
    const json = await postWorkflow('wf-id', variables, new AbortController().signal)
    assert.equal(json.error, false)
    assert.ok(call.url.endsWith('/wf-id'))
    assert.equal(call.options.method, 'POST')
    assert.equal(call.options.credentials, 'omit')
    assert.deepEqual(Object.keys(call.options.headers), ['application-id'])
    const payload = JSON.parse(call.options.body.get('data'))
    assert.deepEqual(payload.variable, variables)
    assert.equal(payload.data.appId, '36b2f3dd-e259-11f1-bb3e-25ec636cd1f0')
  } finally {
    globalThis.fetch = original
  }
})

test('postWorkflow maps HTTP and network failures to user-safe messages', async () => {
  const original = globalThis.fetch
  try {
    globalThis.fetch = async () => new Response('{}', { status: 401 })
    await assert.rejects(postWorkflow('x', {}), /Not authorised/)
    globalThis.fetch = async () => new Response('{}', { status: 500 })
    await assert.rejects(postWorkflow('x', {}), /Service error \(HTTP 500\)/)
    globalThis.fetch = async () => {
      throw new TypeError('Failed to fetch')
    }
    await assert.rejects(postWorkflow('x', {}), /CORS/)
  } finally {
    globalThis.fetch = original
  }
})
