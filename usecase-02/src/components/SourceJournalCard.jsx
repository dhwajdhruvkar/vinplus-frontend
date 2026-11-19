import { DEPTS, JOURNALS } from '../data/ledger.js'
import { fmt } from '../utils/format.js'
import { distinctRefs, sumBy, sumNet } from '../utils/policy.js'

export default function SourceJournalCard({ rows, filters, onSelect, onFilter }) {
  const { flag, dept: filteredDept, focus, journal: source } = filters
  const dept = flag !== 'all' && filteredDept === 'all' ? null : filteredDept === 'all' ? focus : filteredDept
  const scoped = dept ? rows.filter((r) => r.dept === dept) : rows
  const bySource = sumBy(scoped, 'journal')
  const max = Math.max(1, ...JOURNALS.map((j) => Math.abs(bySource[j] || 0)))

  return (
    <section className="sourceKpiCard belowFold" aria-label="Source Journal to Charged Department KPIs">
      <div className="sourceKpiHead">
        <div><h3>Source Journal → Charged Department</h3><div className="sub">Policy charges by selected department and accounting journal</div></div>
        <div className="sourceFilterControls">
          <div className="sourceDepts" role="group" aria-label="Choose charged department">
            {DEPTS.map((d) => (
              <button key={d} type="button" className={filteredDept === d ? 'active' : ''} aria-pressed={filteredDept === d} onClick={() => onSelect('dept', d)}>{d}</button>
            ))}
          </div>
          <div className="sourceJournalSelect">
            <label htmlFor="overviewSourceJournal">Journal source</label>
            <select id="overviewSourceJournal" aria-label="Filter KPI by source journal" value={source} onChange={(e) => onFilter('journal', e.target.value)}>
              <option value="all">All Source Journals</option>
              {JOURNALS.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="sourceKpiBody">
        <div className="sourceKpiLeft">
          <div className="consolidatedKpis">
            <div className={'consolidatedMetric' + (dept ? ' metricClickable' : '')} data-chart-dept={dept ? DEPTS.indexOf(dept) : undefined} onClick={dept ? () => onSelect('dept', dept) : undefined}>
              <div className="title">Charged Department</div>
              <div className="value">{dept || 'All Departments'}</div>
              <div className="hint">{dept ? 'Currently selected department' : 'All matched departments'}</div>
            </div>
            <div className="consolidatedMetric metricClickable" data-metric="net" onClick={() => onSelect('metric', 'net')}>
              <div className="title">Net GL Charges</div>
              <div className="value">{fmt(sumNet(scoped))}</div>
              <div className="hint">{'Net postings' + (source === 'all' ? ' across all journals' : ' from ' + source)}</div>
            </div>
            <div className="consolidatedMetric metricClickable" data-metric="refs" onClick={() => onSelect('metric', 'refs')}>
              <div className="title">Different References</div>
              <div className="value">{distinctRefs(scoped).toLocaleString()}</div>
              <div className="hint">Distinct GL references for this selection</div>
            </div>
          </div>
        </div>
        <div className="sourceKpiRight">
          <div className="sourceBreakdownTitle">Source Journal Breakdown</div>
          <div className="sourceJournalBars">
            {JOURNALS.map((j) => {
              const value = bySource[j] || 0
              return (
                <button key={j} type="button" className={'journalMini' + (source === j ? ' active' : '')} data-overview-journal={j} aria-label={`Filter by ${j}`} onClick={() => onSelect('journal', j)}>
                  <div className="jName">{j}</div>
                  <div className="jValue">{fmt(value)}</div>
                  <div className="jTrack"><div style={{ width: Math.max(2, (Math.abs(value) / max) * 100).toFixed(1) + '%' }}></div></div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <div className="sourceFoot">Select a department or journal to inspect its policy charges. Source journal does not confirm the operational department that requested the work.</div>
    </section>
  )
}
