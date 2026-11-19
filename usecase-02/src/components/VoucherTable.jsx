import { moneyExact, moneySigned } from '../utils/format.js'
import { accountLabel, displayJV } from '../utils/policy.js'

export default function VoucherTable({ reference, rows }) {
  const debit = rows.reduce((n, x) => n + Math.max(0, x.amount), 0)
  const credit = rows.reduce((n, x) => n + Math.max(0, -x.amount), 0)
  const body = rows.map((x, i) => {
    const running = rows.slice(0, i + 1).reduce((n, y) => n + y.amount, 0)
    return (
      <tr key={x.id} className={x.ref === reference.ref ? 'jvMatchReference' : ''}>
        <td className="jvLineNumber">{x.postingsequence ?? i + 1}</td>
        <td className="jvRefValue">{x.ref}</td>
        <td>{x.postingtime}</td>
        <td>{x.journal}<small>Date unavailable</small></td>
        <td><b>{x.dept}</b><small>{`${accountLabel(x)} · ${x.account}`}</small></td>
        <td className="jvDetailDescription">{x.description || 'No description supplied'}</td>
        <td className="numeric">{x.amount > 0 ? moneyExact(x.amount) : '—'}</td>
        <td className="numeric">{x.amount < 0 ? moneyExact(x.amount) : '—'}</td>
        <td className="numeric">{moneySigned(running)}</td>
      </tr>
    )
  })

  return (
    <section className="refWalkthrough jvUnifiedDetail" aria-label="All available journal voucher GL posting details">
      <div className="refWalkthroughHeader">
        <div>
          <h4>JV Debit / Credit Transaction Details</h4>
          <p>{`${rows.length} entry${rows.length === 1 ? '' : 'ies'} · JV ${displayJV(reference)} · sorted by JV number and posting sequence`}</p>
        </div>
      </div>
      <div className="refWalkthroughTableWrap jvUnifiedScroll">
        <table className="refWalkthroughTable jvUnifiedTable">
          <thead>
            <tr><th>Seq.</th><th>Reference</th><th>JV Number</th><th>Journal / Date</th><th>Department / GL account</th><th>Description</th><th>Debit (+)</th><th>Credit (−)</th><th>Running net</th></tr>
          </thead>
          <tbody>{body}</tbody>
          <tfoot>
            <tr>
              <td colSpan="6"><b>{`JV TOTAL · Net movement ${moneySigned(debit - credit)}`}</b></td>
              <td className="numeric">{moneyExact(debit)}</td>
              <td className="numeric">{moneyExact(credit)}</td>
              <td className="numeric">{moneySigned(debit - credit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
