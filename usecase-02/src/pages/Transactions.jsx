import Panel from '../components/Panel.jsx'
import TransactionTable from '../components/TransactionTable.jsx'

const SORT_CHOICES = { amount: ['amount', 'desc'], asc: ['amount', 'asc'], reference: ['ref', 'asc'] }

function sortChoice({ key, direction }) {
  if (key === 'amount') return direction === 'desc' ? 'amount' : 'asc'
  return key === 'ref' ? 'reference' : ''
}

export default function Transactions({ rows, review, threads, table, onSortChoice, onOpenReview, onExport }) {
  const choice = sortChoice(table.sort)
  return (
    <Panel as="div" title="Policy Transaction Explorer" actions={<button className="btn" onClick={onExport}>Export filtered rows</button>}>
      <div className="row">
        <label htmlFor="sort">Sort:</label>
        <select className="select" id="sort" value={choice} onChange={(e) => onSortChoice(...SORT_CHOICES[e.target.value])}>
          {!choice && <option value="" hidden></option>}
          <option value="amount">Largest absolute value</option>
          <option value="asc">Smallest absolute value</option>
          <option value="reference">Reference number</option>
        </select>
      </div>
      <TransactionTable {...table} rows={rows} review={review} threads={threads} limit={12} onOpen={onOpenReview} />
    </Panel>
  )
}
