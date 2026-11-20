import { DEPTS, DEPT_COLORS, MONTHS } from '../data/ledger.js'
import { trendMonthIndex } from './chart.js'
import { fmt, fmtSigned, pct } from './format.js'
import { FLAG_SPEC, baseFilter, matchFlag, sourceScope, sumBy, sumNet } from './policy.js'

const MATRIX_NOTE = 'Click to filter all charts by department and month.'

export function tooltipModel(event, rows, filters, review, live) {
  const target = event.target
  if (target.closest('.kpiInteractive,.sourceKpiLeft .metricClickable')) return null

  let node = target.closest('[data-chart-heat]')
  if (node) {
    const [d, m] = node.dataset.chartHeat.split(',').map(Number)
    if (live) {
      const matrix = live.matrix.data
      const cell = matrix?.rows[d]?.values[m]
      return { caption: 'Department × Month Review Matrix', label: `${matrix?.rows[d]?.name ?? '—'} · ${matrix?.months[m] ?? '—'}`, value: cell == null ? '—' : fmtSigned(cell), note: MATRIX_NOTE, color: DEPT_COLORS[d % DEPT_COLORS.length] }
    }
    const value = sumNet(rows.filter((x) => x.dept === DEPTS[d] && x.month === MONTHS[m]))
    return { caption: 'Department × Month Review Matrix', label: `${DEPTS[d]} · ${MONTHS[m]} 2026`, value: fmt(value), note: MATRIX_NOTE, color: DEPT_COLORS[d] }
  }
  node = target.closest('[data-chart-dept]')
  if (node) {
    const i = Number(node.dataset.chartDept)
    if (live) {
      const items = live.department.data?.items ?? []
      const amount = items[i]?.value || 0
      const total = items.reduce((sum, item) => sum + Math.max(0, item.value || 0), 0)
      return { caption: 'Expense by Department', label: items[i]?.name ?? '—', value: fmt(amount), percent: pct(Math.max(0, amount), total), note: 'Charged department · Click to filter the dashboard.', color: DEPT_COLORS[i % DEPT_COLORS.length] }
    }
    const totals = sumBy(rows, 'dept')
    const amount = totals[DEPTS[i]] || 0
    const total = Object.values(totals).reduce((sum, n) => sum + Math.max(0, n || 0), 0)
    return { caption: 'Expense by Department', label: DEPTS[i], value: fmt(amount), percent: pct(Math.max(0, amount), total), note: 'Charged department · Click to filter the dashboard.', color: DEPT_COLORS[i] }
  }
  node = target.closest('[data-chart-trend]')
  if (node) {
    const liveRows = live?.monthly.data?.rows ?? []
    const i = trendMonthIndex(node, event.clientX, live ? liveRows.length : 10)
    const value = live ? liveRows[i]?.value :sumNet(rows.filter((x) => x.month === MONTHS[i]))
    return { caption: 'Monthly Policy Expense Trend', label: live ? liveRows[i]?.month ?? '—' : `${MONTHS[i]} 2026`, value: value == null ? '—' : fmt(value), note: 'Monthly net policy expense · Click to filter by this month.', color: '#ff315e' }
  }
  node = target.closest('[data-overview-journal]')
  if (node) {
    const journal = node.dataset.overviewJournal
    const { dept, scoped } = sourceScope(rows, filters)
    const value = sumNet(scoped.filter((x) => x.journal === journal))
    return { caption: 'Source Journal → Charged Department', label: `${journal} · ${dept || 'All departments'}`, value: fmt(value), percent: pct(value, sumNet(scoped)), note: 'Net selected-department charges from this journal.', color: '#fa3359' }
  }
  node = target.closest('[data-chart-journal]')
  if (node) {
    const items = live?.journal.data?.items
    const totals = items ? Object.fromEntries(items.map((item) => [item.name, item.value])) : sumBy(rows, 'journal')
    const value = totals[node.dataset.chartJournal] || 0
    const total = items ? items.reduce((sum, item) => sum + (item.value || 0), 0) : sumNet(rows)
    return { caption: 'Expense by Journal', label: node.dataset.chartJournal, value: items ? fmtSigned(value) : fmt(value), percent: pct(value, total), note: 'Click to filter all KPI cards by this journal.', color: '#f12e58' }
  }
  node = target.closest('[data-chart-flag]')
  if (node) {
    const code = node.dataset.chartFlag
    const count = baseFilter(filters, review, { ignoreFlag: true }).filter((r) => matchFlag(r, code)).length
    return { caption: 'Key Review Flags', label: FLAG_SPEC[code].label, value: `${count} postings`, note: 'Screening candidates only; click to filter the dashboard.', color: '#f7b94d' }
  }
  return null
}
