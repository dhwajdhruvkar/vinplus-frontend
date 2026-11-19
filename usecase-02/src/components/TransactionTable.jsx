import { amt } from '../utils/format.js'
import { SORT_COLUMNS, displayJV, hasNotes, sortRows, status, voucherThread } from '../utils/policy.js'

const QUEUE_COLUMN_WIDTHS = [8, 8, 9, 10, 13, 7, 19, 9, 11, 6]
const PILL_TONES = { Reviewed: ' green', 'Needs Action': ' red', Pending: ' gold' }

export default function TransactionTable({ rows, review, threads, limit, compact, page, onPage, sort, onSort, onOpen }) {
  const sorted = sortRows(rows, sort.key, sort.direction, review)
  const last = Math.max(0, Math.ceil(sorted.length / limit) - 1)
  const current = Math.min(page, last)
  const visible = sorted.slice(current * limit, (current + 1) * limit)

  return (
    <>
      <div className="tableWrap">
        <table className={'tbl' + (compact ? ' queueTbl' : '')}>
          {compact && <colgroup>{QUEUE_COLUMN_WIDTHS.map((w, i) => <col key={i} style={{ width: w + '%' }} />)}</colgroup>}
          <thead>
            <tr>
              {SORT_COLUMNS.map(([key, label]) => {
                const selected = sort.key === key
                const align = key === 'amount' ? ' sortNum' : key === 'notes' ? ' sortCentered' : ''
                return (
                  <th key={key} scope="col" aria-sort={selected ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'} className={'sortCol' + align}>
                    <button type="button" className="sortButton" title={`Sort by ${label} — click to reverse direction`} onClick={() => onSort(key)}>
                      {label} <span className="sortIndicator" aria-hidden="true">{!selected ? '⇅' : sort.direction === 'asc' ? '↑' : '↓'}</span>
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const state = status(r, review)
              return (
                <tr key={r.id} title={`Open ${r.ref} review panel`} onClick={() => onOpen(r.id)}>
                  <td><button className="referenceLink" type="button" title={`Open JV GL details for ${r.ref}`}>{r.ref}</button></td>
                  <td title={r.jvNumbers.join(', ')}>{displayJV(r)}</td>
                  <td title="Fictional demonstration posting date">{r.postDate}</td>
                  <td title={r.journal}>{r.journal}</td>
                  <td title={r.dept}>{r.dept}</td>
                  <td>{r.account}</td>
                  <td title={r.description}>{r.description}</td>
                  <td className="num">{amt(r.amount)}</td>
                  <td><span className={'pill' + (PILL_TONES[state] ?? '')}>{state}</span></td>
                  <td className="noteCell">
                    {hasNotes(r, review) ? (
                      <>
                        <span className="noteMarker" aria-label="Manager note or conversation exists" title="Manager note exists"></span>
                        <span className="noteCount">{voucherThread(r, threads, review).comment ? '1' : ''}</span>
                      </>
                    ) : <span className="sub">—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="between">
        <span className="sub">{`Showing ${visible.length} of ${sorted.length} demo references · Page ${current + 1}`}</span>
        <div className="row">
          <button className="btn" disabled={current === 0} onClick={() => onPage(current - 1)}>Previous</button>
          <button className="btn" disabled={current === last} onClick={() => onPage(current + 1)}>Next</button>
        </div>
      </div>
    </>
  )
}
