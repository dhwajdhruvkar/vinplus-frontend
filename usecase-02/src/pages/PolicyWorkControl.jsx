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

export default function PolicyWorkControl({ rows, filters, review, threads, table, fullscreen, onFullscreen, onSelect, onClearOne, onOpenReview, onExport, onExportWidget, onViewAll }) {
  const stats = getStats(rows)
  const comparison = monthComparison(filters, review)
  const thresholdLabel = 'GL posting ≥ ' + fmt(HIGH_VALUE_THRESHOLD)
  const openFromWidget = (id) => {
    onFullscreen(null)
    onOpenReview(id)
  }

  const bodies = {
    trend: <TrendChart rows={rows} onSelect={onSelect} />,
    department: <DonutChart rows={rows} activeDept={filters.dept} onSelect={onSelect} />,
    journal: <JournalBars rows={rows} activeJournal={filters.journal} onSelect={onSelect} />,
    matrix: <ReviewMatrix rows={rows} onSelect={onSelect} />,
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
            key={metric} index={index} title={title} red={red} value={format(stats[stat])}
            change={momValue(comparison.current[stat], comparison.prior[stat])} comparisonWindow={comparison.window} thresholdLabel={thresholdLabel}
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
        actions={<div className="row"><button className="btn" onClick={onExport}>Export CSV</button><button className="btn primary" onClick={onViewAll}>View all transactions</button></div>}
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
