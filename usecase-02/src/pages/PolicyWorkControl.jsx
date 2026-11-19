import KpiCard from '../components/KpiCard.jsx'
import Panel from '../components/Panel.jsx'
import TrendChart from '../components/TrendChart.jsx'
import DonutChart from '../components/DonutChart.jsx'
import JournalBars from '../components/JournalBars.jsx'
import ReviewMatrix from '../components/ReviewMatrix.jsx'
import ReviewFlags from '../components/ReviewFlags.jsx'
import PriorityInvestigation from '../components/PriorityInvestigation.jsx'
import SourceJournalCard from '../components/SourceJournalCard.jsx'
import TransactionTable from '../components/TransactionTable.jsx'
import { amt, fmt } from '../utils/format.js'
import { FLAG_SPEC, HIGH_VALUE_THRESHOLD, baseFilter, distinctRefs, getStats, momValue, monthComparison, sumNet } from '../utils/policy.js'

const count = (n) => n.toLocaleString()
const KPIS = [
  { title: 'Net Policy Expense', metric: 'net', stat: 'net', format: fmt },
  { title: 'Gross Policy Debits', metric: 'debits', stat: 'deb', format: fmt, red: true },
  { title: 'Credits / Offsets', metric: 'credits', stat: 'credits', format: fmt },
  { title: 'Policy Posting Entries', metric: 'lines', stat: 'lines', format: count },
  { title: 'Unique References', metric: 'refs', stat: 'refs', format: count },
  { title: 'High-Value Review Candidates', metric: 'high', stat: 'review', format: count, red: true },
]

export default function PolicyWorkControl({ rows, filters, review, threads, table, onSelect, onFilter, onClearOne, onOpenReview, onExport, onViewAll }) {
  const stats = getStats(rows)
  const comparison = monthComparison(filters, review)
  const thresholdLabel = 'GL posting ≥ ' + fmt(HIGH_VALUE_THRESHOLD)

  return (
    <>
      <div className="kpis">
        {KPIS.map(({ title, metric, stat, format, red }, index) => (
          <KpiCard
            key={metric} index={index} title={title} metric={metric} red={red} value={format(stats[stat])} active={filters.metric === metric}
            change={momValue(comparison.current[stat], comparison.prior[stat])} comparisonWindow={comparison.window} thresholdLabel={thresholdLabel} onSelect={onSelect}
          />
        ))}
      </div>
      <div className="tri topcharts">
        <Panel title="Monthly Policy Expense Trend"><TrendChart rows={rows} onSelect={onSelect} /></Panel>
        <Panel title="Expense by Department"><DonutChart rows={rows} activeDept={filters.dept} onSelect={onSelect} /></Panel>
        <Panel title="Expense by Journal"><JournalBars rows={rows} activeJournal={filters.journal} onSelect={onSelect} /></Panel>
      </div>
      <div className="tri lowercharts">
        <Panel title="Department × Month Review Matrix"><ReviewMatrix rows={rows} onSelect={onSelect} /></Panel>
        <Panel title="Key Review Flags"><ReviewFlags rows={baseFilter(filters, review, { ignoreFlag: true })} activeFlag={filters.flag} onSelect={onSelect} /></Panel>
        <Panel title="Priority Investigation"><PriorityInvestigation rows={rows} review={review} onOpen={onOpenReview} /></Panel>
      </div>
      {filters.flag !== 'all' && (
        <div className="flagConnection">
          <b>{FLAG_SPEC[filters.flag]?.label || filters.flag}</b>
          <span>{`${rows.length} posting lines · ${distinctRefs(rows)} references · net ${amt(sumNet(rows))} · all linked KPIs use this selection`}</span>
          <button type="button" onClick={() => onClearOne('flag')}>Clear filter</button>
        </div>
      )}
      <SourceJournalCard rows={rows} filters={filters} onSelect={onSelect} onFilter={onFilter} />
      <Panel
        title="Policy Transaction Review Queue" className="belowFold"
        actions={<div className="row"><button className="btn" onClick={onExport}>Export CSV</button><button className="btn primary" onClick={onViewAll}>View all transactions</button></div>}
      >
        <TransactionTable {...table} rows={rows} review={review} threads={threads} limit={10} compact onOpen={onOpenReview} />
      </Panel>
    </>
  )
}
