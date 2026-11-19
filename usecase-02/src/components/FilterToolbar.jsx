import { BRANDS, DEPTS, JOURNALS, REVIEW_STATUSES } from '../data/ledger.js'
import { DEFAULT_END, DEFAULT_START } from '../utils/policy.js'

function FilterSelect({ id, label, value, onChange, allLabel, options }) {
  return (
    <div className="filterField">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="all">{allLabel}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function DateInput({ id, label, value, onChange }) {
  return <input type="date" className="dateInput" id={id} min={DEFAULT_START} max={DEFAULT_END} value={value} aria-label={label} onChange={(e) => onChange(e.target.value)} />
}

export default function FilterToolbar({ filters, chips, onFilter, onDate, onClearOne }) {
  return (
    <div className="filterToolbar">
      <div className="filterGrid">
        <div className="filterField dateRangeField">
          <label htmlFor="dateStart" title="Exact posting days are illustrative in this demo">Date range · From / To (demo)</label>
          <div className="calendarPair">
            <DateInput id="dateStart" label="From date" value={filters.dateStart} onChange={(v) => onDate('dateStart', v)} />
            <DateInput id="dateEnd" label="To date" value={filters.dateEnd} onChange={(v) => onDate('dateEnd', v)} />
          </div>
        </div>
        <FilterSelect id="brand" label="Brand" value={filters.brand} onChange={(v) => onFilter('brand', v)} allLabel="All brands" options={BRANDS} />
        <FilterSelect id="department" label="Department" value={filters.dept} onChange={(v) => onFilter('dept', v)} allLabel="All departments" options={DEPTS} />
        <FilterSelect id="journal" label="Journal" value={filters.journal} onChange={(v) => onFilter('journal', v)} allLabel="All journals" options={JOURNALS} />
        <FilterSelect id="reviewStatus" label="Review status" value={filters.status} onChange={(v) => onFilter('status', v)} allLabel="All statuses" options={REVIEW_STATUSES} />
      </div>
      <div className="filterFooter"><b>FILTERS</b><button className="clearBtn" id="reset" onClick={() => onClearOne('all')}>Clear all</button></div>
      <div className="associationBar" id="associationBar" aria-label="Active dashboard selections">
        {chips.length > 0 && (
          <>
            <span className="associationLabel">ACTIVE FILTERS</span>
            {chips.map(([key, label]) => (
              <button key={key} className="associationChip" title={`Remove ${label}`} onClick={() => onClearOne(key)}>{`${label} ×`}</button>
            ))}
            <button className="associationClear" onClick={() => onClearOne('all')}>Clear all</button>
          </>
        )}
      </div>
    </div>
  )
}
