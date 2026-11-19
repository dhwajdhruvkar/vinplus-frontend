import { accountLabel, status } from './policy.js'

const COLUMNS = [
  'GL Reference', 'Posting Order', 'Accounting Date', 'Accounting Journal', 'Initiating Department', 'Department Charged',
  'Account Description', 'Account Code', 'Control Reference', 'Secondary Control', 'Posting Description', 'Debit', 'Credit',
  'Net Amount', 'Service Advisor', 'Review Status', 'Manager Note', 'Data Quality',
]

function refGroups(rows) {
  const groups = new Map()
  rows.forEach((r) => {
    if (!groups.has(r.ref)) groups.set(r.ref, [])
    groups.get(r.ref).push(r)
  })
  return [...groups]
    .sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }))
    .map(([, entries]) => entries.sort((a, b) => a.postDate.localeCompare(b.postDate)))
}

export function downloadCSV(filename, columns, lines) {
  const quote = (x) => '"' + String(x ?? '').replace(/"/g, '""') + '"'
  const csv = [columns, ...lines].map((row) => row.map(quote).join(',')).join('\r\n')
  const anchor = document.createElement('a')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

export function exportCSV(rows, review) {
  const lines = refGroups(rows).flatMap((entries) => entries.map((x, i) => [
    x.ref, i + 1, x.postDate, x.journal, 'Not verified in GL', x.dept, accountLabel(x), x.account, '', '', x.description,
    x.amount > 0 ? x.amount : 0, x.amount < 0 ? -x.amount : 0, x.amount, 'Not in GL', status(x, review),
    review[x.id]?.note || '', 'Demonstration data',
  ]))
  downloadCSV('vinplus_policy_grouped_reference_demo.csv', COLUMNS, lines)
}
