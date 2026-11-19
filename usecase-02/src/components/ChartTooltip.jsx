import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DEPTS, DEPT_COLORS, MONTHS } from '../data/ledger.js'
import { trendMonthIndex } from '../utils/chart.js'
import { fmt, pct } from '../utils/format.js'
import { FLAG_SPEC, baseFilter, matchFlag, sumBy, sumNet } from '../utils/policy.js'

const MATRIX_NOTE = 'Click to filter all charts by department and month.'

function tooltipModel(event, rows, filters, review) {
  const target = event.target
  if (target.closest('.kpiInteractive,.sourceKpiLeft .metricClickable')) return null

  let node = target.closest('[data-chart-heat]')
  if (node) {
    const [d, m] = node.dataset.chartHeat.split(',').map(Number)
    const value = sumNet(rows.filter((x) => x.dept === DEPTS[d] && x.month === MONTHS[m]))
    return { caption: 'Department × Month Review Matrix', label: `${DEPTS[d]} · ${MONTHS[m]} 2026`, value: fmt(value), note: MATRIX_NOTE, color: DEPT_COLORS[d] }
  }
  node = target.closest('[data-chart-dept]')
  if (node) {
    const i = Number(node.dataset.chartDept)
    const totals = sumBy(rows, 'dept')
    const amount = totals[DEPTS[i]] || 0
    const total = Object.values(totals).reduce((sum, n) => sum + Math.max(0, n || 0), 0)
    return { caption: 'Expense by Department', label: DEPTS[i], value: fmt(amount), percent: pct(Math.max(0, amount), total), note: 'Charged department · Click to filter the dashboard.', color: DEPT_COLORS[i] }
  }
  node = target.closest('[data-chart-trend]')
  if (node) {
    const i = trendMonthIndex(node, event.clientX)
    const value = sumNet(rows.filter((x) => x.month === MONTHS[i]))
    return { caption: 'Monthly Policy Expense Trend', label: `${MONTHS[i]} 2026`, value: fmt(value), note: 'Monthly net policy expense · Click to filter by this month.', color: '#ff315e' }
  }
  node = target.closest('[data-overview-journal]')
  if (node) {
    const journal = node.dataset.overviewJournal
    const dept = filters.flag !== 'all' && filters.dept === 'all' ? null : filters.dept === 'all' ? filters.focus : filters.dept
    const scoped = rows.filter((x) => !dept || x.dept === dept)
    const value = sumNet(scoped.filter((x) => x.journal === journal))
    return { caption: 'Source Journal → Charged Department', label: `${journal} · ${dept || 'All departments'}`, value: fmt(value), percent: pct(value, sumNet(scoped)), note: 'Net selected-department charges from this journal.', color: '#fa3359' }
  }
  node = target.closest('[data-chart-journal]')
  if (node) {
    const totals = sumBy(rows, 'journal')
    const value = totals[node.dataset.chartJournal] || 0
    return { caption: 'Expense by Journal', label: node.dataset.chartJournal, value: fmt(value), percent: pct(value, sumNet(rows)), note: 'Click to filter all KPI cards by this journal.', color: '#f12e58' }
  }
  node = target.closest('[data-chart-flag]')
  if (node) {
    const code = node.dataset.chartFlag
    const count = baseFilter(filters, review, { ignoreFlag: true }).filter((r) => matchFlag(r, code)).length
    return { caption: 'Key Review Flags', label: FLAG_SPEC[code].label, value: `${count} postings`, note: 'Screening candidates only; click to filter the dashboard.', color: '#f7b94d' }
  }
  return null
}

export default function ChartTooltip({ shellRef, rows, filters, review }) {
  const [tip, setTip] = useState(null)
  const rootRef = useRef(null)

  useEffect(() => {
    const shell = shellRef.current
    const move = (e) => {
      const model = tooltipModel(e, rows, filters, review)
      setTip(model && { model, x: e.clientX || 0, y: e.clientY || 0 })
    }
    const hide = () => setTip(null)
    shell.addEventListener('pointermove', move)
    shell.addEventListener('pointerleave', hide)
    window.addEventListener('scroll', hide, { passive: true, capture: true })
    return () => {
      shell.removeEventListener('pointermove', move)
      shell.removeEventListener('pointerleave', hide)
      window.removeEventListener('scroll', hide, { capture: true })
    }
  }, [shellRef, rows, filters, review])

  useLayoutEffect(() => {
    if (!tip) return
    const root = rootRef.current
    const width = root.offsetWidth || 220
    const height = root.offsetHeight || 100
    const x = Math.max(8, Math.min(tip.x + 18, (window.innerWidth || 1024) - width - 10))
    const y = Math.max(8, Math.min(tip.y + 18, (window.innerHeight || 768) - height - 10))
    root.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`
  }, [tip])

  const model = tip?.model
  return (
    <div id="vinplusChartTooltip" ref={rootRef} className="vinplusChartTooltip" role="tooltip" hidden={!tip} style={{ borderLeftColor: model?.color || '#ff315e' }}>
      {model && (
        <>
          <div className="tipCaption">{model.caption}</div>
          <div className="tipLabel">{model.label}</div>
          <div className="tipAmount">{model.value}</div>
          {model.percent && <div className="tipPercent">{model.percent} of selected total</div>}
          <div className="tipNote">{model.note}</div>
          <div className="tipBar" style={{ background: model.color || '#ff315e' }}></div>
        </>
      )}
    </div>
  )
}
