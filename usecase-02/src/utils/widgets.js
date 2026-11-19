import { DEPTS, MONTHS, JOURNALS } from '../data/ledger.js'
import { accountLabel, baseFilter, FLAG_SPEC, matchFlag, rankPriority, status, sourceScope, sumBy, sumNet } from './policy.js'

const money = (n) => Number(n.toFixed(2))
const share = (value, total) => (((value || 0) / (total || 1)) * 100).toFixed(1)

export const WIDGETS = {
  trend: {
    title: 'Monthly Policy Expense Trend',
    info: 'Displays monthly policy expense movements over the selected date range.',
    columns: ['Month', 'Net Policy Expense'],
    lines: (rows) => MONTHS.map((m) => [`${m} 2026`, money(sumNet(rows.filter((r) => r.month === m)))]),
  },
  department: {
    title: 'Expense by Department',
    info: 'Shows the distribution of net policy expenses across departments.',
    columns: ['Department', 'Net Policy Expense', 'Share of Positive Total (%)'],
    lines: (rows) => {
      const totals = sumBy(rows, 'dept')
      const positive = DEPTS.reduce((s, d) => s + Math.max(0, totals[d] || 0), 0)
      return DEPTS.map((d) => [d, money(totals[d] || 0), share(Math.max(0, totals[d] || 0), positive)])
    },
  },
  journal: {
    title: 'Expense by Journal',
    info: 'Breaks down policy expenses according to their source accounting journals.',
    columns: ['Journal', 'Net Policy Expense', 'Share of Net (%)'],
    lines: (rows) => {
      const totals = sumBy(rows, 'journal')
      return JOURNALS.map((j) => [j, money(totals[j] || 0), share(totals[j], sumNet(rows))])
    },
  },
  matrix: {
    title: 'Department × Month Review Matrix',
    info: 'Shows department-level policy expense distribution across individual months.',
    columns: ['Department', 'Month', 'Net Policy Expense'],
    lines: (rows) => DEPTS.flatMap((d) => MONTHS.map((m) => [d, `${m} 2026`, money(sumNet(rows.filter((r) => r.dept === d && r.month === m)))])),
  },
  flags: {
    title: 'Key Review Flags',
    info: 'Highlights transaction patterns and potential policy exceptions requiring review.',
    columns: ['Review Flag', 'Description', 'Matching Postings'],
    lines: (rows, filters, review) => {
      const scope = baseFilter(filters, review, { ignoreFlag: true })
      return Object.entries(FLAG_SPEC).map(([code, { label, note }]) => [label, note, scope.filter((r) => matchFlag(r, code)).length])
    },
  },
  priority: {
    title: 'Priority Investigation',
    info: 'Displays the highest-priority transaction identified by the current review filters.',
    columns: ['GL Reference', 'JV Number', 'Accounting Date', 'Journal', 'Department Charged', 'Account Code', 'Account Description', 'Amount', 'Review Status', 'Priority Reasons'],
    lines: (rows, filters, review) => {
      const { r, reasons } = rankPriority(rows, review)
      return [[r.ref, r.jvNumbers.join(' '), r.postDate, r.journal, r.dept, r.account, accountLabel(r), r.amount, status(r, review), reasons.join('; ')]]
    },
  },
  source: {
    title: 'Source Journal Breakdown',
    info: 'Shows how GL charges are distributed across source journals for the selected department.',
    columns: ['Charged Department', 'Source Journal', 'Net GL Charges'],
    lines: (rows, filters) => {
      const { dept, scoped } = sourceScope(rows, filters)
      const totals = sumBy(scoped, 'journal')
      return JOURNALS.map((j) => [dept || 'All Departments', j, money(totals[j] || 0)])
    },
  },
}

export function widgetExport(id, rows, filters, review) {
  if (!rows.length) return null
  const widget = WIDGETS[id]
  const slug = widget.title.toLowerCase().replace(/×/g, 'x').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
  return {
    title: widget.title,
    columns: widget.columns,
    lines: widget.lines(rows, filters, review),
    filename: `vinplus_${slug}_${filters.dateStart}_to_${filters.dateEnd}.csv`,
  }
}
