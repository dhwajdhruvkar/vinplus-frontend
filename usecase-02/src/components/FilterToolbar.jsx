import { BRANDS, DEPTS, JOURNALS, REVIEW_STATUSES } from '../data/ledger.js'
import { DEFAULT_END, DEFAULT_START } from '../utils/policy.js'

function FilterSelect({ id, label, value, onChange, allLabel, options, slot }) {
  return (
    <div className="filterField">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} disabled={slot?.status === 'loading'} title={slot?.status === 'error' ? slot.error : undefined}>
        <option value="all">{allLabel}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function DateInput({ id, label, value, min, max, onChange }) {
  return <input type="date" className="dateInput" id={id} min={min} max={max} value={value} aria-label={label} onChange={(e) => onChange(e.target.value)} />
}

// In Live Mode `liveOptions` holds the five filter-option workflow results and the lists come only from the backend.
// Without it (Demo Mode) the built-in demo lists are used, unchanged.
export default function FilterToolbar({ filters, chips, liveOptions, onFilter, onDate, onClearOne }) {
  const optionsOf = (slotName, demo) => (liveOptions ? (liveOptions[slotName].status === 'success' ? liveOptions[slotName].data.options : []) : demo)
  const bounds = liveOptions?.date.status === 'success' ? liveOptions.date.data : { min: DEFAULT_START, max: DEFAULT_END }
  return (
    <div className="filterToolbar">
      <div className="filterGrid">
        <div className="filterField dateRangeField">
          <label htmlFor="dateStart" title={liveOptions ? undefined : 'Exact posting days are illustrative in this demo'}>{liveOptions ? 'Date range · From / To' : 'Date range · From / To (demo)'}</label>
          <div className="calendarPair">
            <DateInput id="dateStart" label="From date" value={filters.dateStart} min={bounds.min} max={bounds.max} onChange={(v) => onDate('dateStart', v)} />
            <DateInput id="dateEnd" label="To date" value={filters.dateEnd} min={bounds.min} max={bounds.max} onChange={(v) => onDate('dateEnd', v)} />
          </div>
        </div>
        <FilterSelect id="brand" label="Brand" value={filters.brand} onChange={(v) => onFilter('brand', v)} allLabel="All brands" options={optionsOf('brand', BRANDS)} slot={liveOptions?.brand} />
        <FilterSelect id="department" label="Department" value={filters.dept} onChange={(v) => onFilter('dept', v)} allLabel="All departments" options={optionsOf('department', DEPTS)} slot={liveOptions?.department} />
        <FilterSelect id="journal" label="Journal" value={filters.journal} onChange={(v) => onFilter('journal', v)} allLabel="All journals" options={optionsOf('journal', JOURNALS)} slot={liveOptions?.journal} />
        <FilterSelect id="reviewStatus" label="Review status" value={filters.status} onChange={(v) => onFilter('status', v)} allLabel="All statuses" options={optionsOf('reviewStatus', REVIEW_STATUSES)} slot={liveOptions?.reviewStatus} />
      </div>
      <div className="filterFooter"><b>FILTERS</b></div>
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
