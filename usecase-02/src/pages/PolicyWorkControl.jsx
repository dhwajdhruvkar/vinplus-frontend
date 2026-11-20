import KpiCard from '../components/KpiCard.jsx'
import Panel from '../components/Panel.jsx'
import TrendChart from '../components/TrendChart.jsx'
import DonutChart from '../components/DonutChart.jsx'
import JournalBars from '../components/JournalBars.jsx'
import ReviewMatrix from '../components/ReviewMatrix.jsx'
import ReviewFlags from '../components/ReviewFlags.jsx'
import PriorityInvestigation from '../components/PriorityInvestigation.jsx'
import SourceJournalCard, { SourceJournalBars } from '../components/SourceJournalCard.jsx'
import TransactionTable from '../components/TransactionTable.jsx'
import WidgetFullscreen from '../components/WidgetFullscreen.jsx'
import { ExportIcon } from '../components/WidgetControls.jsx'
import { amt, fmt } from '../utils/format.js'
import { FLAG_SPEC, HIGH_VALUE_THRESHOLD, baseFilter, distinctRefs, getStats, momValue, monthComparison, sumNet } from '../utils/policy.js'
import { WIDGETS } from '../utils/widgets.js'

const count = (n) => n.toLocaleString()
const KPIS = [
  { title: 'Net Policy Expense', metric: 'net', stat: 'net', format: fmt },
  { title: 'Gross Policy Debits', metric: 'debits', stat: 'deb', format: fmt, red: true },
  { title: 'Credits / Offsets', metric: 'credits', stat: 'credits', format: fmt },
  { title: 'Policy Posting Entries', metric: 'lines', stat: 'lines', format: count },
  { title: 'Unique References', metric: 'refs', stat: 'refs', format: count },
  { title: 'High-Value Review Candidates', metric: 'high', stat: 'review', format: count, red: true },
]

export default function PolicyWorkControl({ rows, filters, review, threads, table, fullscreen, live, onFullscreen, onSelect, onClearOne, onOpenReview, onExport, onExportWidget, onViewAll }) {
  const stats = getStats(rows)
  const comparison = monthComparison(filters, review)
  const thresholdLabel = 'GL posting ≥ ' + fmt(HIGH_VALUE_THRESHOLD)
  const openFromWidget = (id) => {
    onFullscreen(null)
    onOpenReview(id)
  }

  const kpiProps = (stat, index, format) => {
    if (!live) return { value: format(stats[stat]), change: momValue(comparison.current[stat], comparison.prior[stat]), comparisonWindow: comparison.window }
    const { values, mom, trend } = live
    const failing = values.status !== 'success' ? values : index < 5 && mom.status !== 'success' ? mom : null
    const value = values.status === 'success' ? values.data[stat] : null
    return {
      value: value == null ? '—' : format(value),
      change: mom.status === 'success' ? mom.data[stat] : undefined,
      comparisonWindow: mom.data?.window || 'Backend comparison period not specified',
      state: failing?.status, stateMessage: failing?.error,
      // Real KPI-trend series only; a loading, failed or empty trend draws no sparkline instead of the demo shape.
      sparkValues: trend.status === 'success' ? trend.data.rows.map((r) => r[stat]).filter((v) => v != null) : [],
    }
  }
  // Live chart props: the backend result, or a loading / empty / error state. Never the demo ledger.
  const fromLive = (slot, build) => (!slot ? {} : slot.status === 'success' ? build(slot.data) : { state: slot.status, message: slot.error })

  const bodies = {
    trend: <TrendChart rows={rows} {...fromLive(live?.monthly, (d) => ({ series: d.rows }))} onSelect={onSelect} />,
    department: <DonutChart rows={rows} {...fromLive(live?.department, (d) => ({ items: d.items }))} activeDept={filters.dept} onSelect={onSelect} />,
    journal: <JournalBars rows={rows} {...fromLive(live?.journal, (d) => ({ items: d.items }))} activeJournal={filters.journal} onSelect={onSelect} />,
    matrix: <ReviewMatrix rows={rows} {...fromLive(live?.matrix, (d) => ({ matrix: d }))} onSelect={onSelect} />,
    flags: <ReviewFlags rows={baseFilter(filters, review, { ignoreFlag: true })} activeFlag={filters.flag} onSelect={onSelect} />,
    priority: <PriorityInvestigation rows={rows} review={review} onOpen={openFromWidget} />,
    source: <div className="sourceKpiRight"><SourceJournalBars rows={rows} filters={filters} onSelect={onSelect} /></div>,
  }
  const widgetPanel = (id) => (
    <Panel title={WIDGETS[id].title} info={WIDGETS[id].info} onExport={() => onExportWidget(id)} onFullscreen={() => onFullscreen(id)}>{bodies[id]}</Panel>
  )

  return (
    <>
      <div className="kpis">
        {KPIS.map(({ title, metric, stat, format, red }, index) => (
          <KpiCard
            key={metric} index={index} title={title} red={red} thresholdLabel={thresholdLabel} {...kpiProps(stat, index, format)}
          />
        ))}
      </div>
      <div className="tri topcharts">
        {widgetPanel('trend')}
        {widgetPanel('department')}
        {widgetPanel('journal')}
      </div>
      <div className="tri lowercharts">
        {widgetPanel('matrix')}
        {widgetPanel('flags')}
        {widgetPanel('priority')}
      </div>
      {filters.flag !== 'all' && (
        <div className="flagConnection">
          <b>{FLAG_SPEC[filters.flag]?.label || filters.flag}</b>
          <span>{`${rows.length} posting lines · ${distinctRefs(rows)} references · net ${amt(sumNet(rows))} · all linked KPIs use this selection`}</span>
          <button type="button" onClick={() => onClearOne('flag')}>Clear filter</button>
        </div>
      )}
      <SourceJournalCard
        rows={rows} filters={filters} widget={WIDGETS.source} onSelect={onSelect}
        onExport={() => onExportWidget('source')} onFullscreen={() => onFullscreen('source')}
      />
      <Panel
        title="Policy Transaction Review Queue" className="belowFold"
        actions={<div className="row"><button className="widgetToolButton" title="Export CSV" aria-label="Export CSV" onClick={onExport}><ExportIcon /></button><button className="btn primary" onClick={onViewAll}>View all transactions</button></div>}
      >
        <TransactionTable {...table} rows={rows} review={review} threads={threads} limit={10} compact onOpen={onOpenReview} />
      </Panel>
      {fullscreen && (
        <WidgetFullscreen title={WIDGETS[fullscreen].title} info={WIDGETS[fullscreen].info} onExport={() => onExportWidget(fullscreen)} onClose={() => onFullscreen(null)}>
          {bodies[fullscreen]}
        </WidgetFullscreen>
      )}
    </>
  )
}
