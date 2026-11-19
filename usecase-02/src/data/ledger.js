export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
export const DEPTS = ['New Vehicle Sales', 'Used Vehicle Sales', 'Service', 'Parts & Accessories', 'Other Departments']
export const DEPT_SHORT = ['New Vehicle', 'Used Vehicle', 'Service', 'Parts', 'Other']
export const DEPT_COLORS = ['#9a5cf6', '#00bfa5', '#ed4352', '#f6b545', '#259dff']
export const JOURNALS = ['Service Sales', 'Parts Sales', 'General Journal', 'Used Car Wholesale', 'Cash Disbursements', 'Other Journals']
export const BRANDS = ['Ferrari', 'Maserati', 'Alfa Romeo', 'Other']
export const REVIEW_STATUSES = ['Pending', 'Commented', 'Reviewed', 'Needs Action']

const DEPT_BY_NUMBER = { 1: 'New Vehicle Sales', 2: 'Used Vehicle Sales', 3: 'Service', 4: 'Parts & Accessories' }
const JOURNAL_BY_ID = {
  30: 'Service Sales', 32: 'Parts Sales', 80: 'General Journal', 25: 'Used Car Wholesale', 60: 'Cash Disbursements',
}
const DESCRIPTIONS = [
  'Demo customer goodwill repair', 'Demo courtesy transportation accommodation',
  'Demo post-delivery policy charge', 'Demo vehicle preparation adjustment',
  'Demo parts replacement under goodwill', 'Demo internal service correction',
  'Demo policy account adjustment', 'Demo approval review required',
  'Demo manager-authorized expense', 'Demo credit applied after review',
  'Demo sales department chargeback', 'Demo customer satisfaction adjustment',
  'Demo month-end policy expense', 'Demo workshop consumables correction',
  'Demo customer request accommodation', 'Demo policy reversal / offset',
  'Demo voucher entry for accounting review', 'Demo parts discount adjustment',
  'Demo audit narrative pending', '',
]
const JOURNAL_IDS = ['30', '32', '80', '25', '60', '99']
const BRAND_LABELS = ['Fer', 'Mas', 'Af']
const BRAND_NAMES = ['Ferrari', 'Maserati', 'Alfa Romeo']
const CLEARING_LABELS = ['Demo Clearing – Sales', 'Demo Clearing – Service', 'Demo Clearing – Parts', 'Demo Settlement Clearing', 'Demo Internal Transfer Clearing']

function makeFictionalLedger() {
  let seed = 20261116
  const next = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
  const accounts = new Map()
  const addAccount = (code, label, deptNumber) => {
    accounts.set(code, { label, dept: DEPT_BY_NUMBER[deptNumber] ?? 'Other Departments', brand: BRAND_NAMES.find((name, i) => label.startsWith(BRAND_LABELS[i] + ' ')) ?? 'Other' })
  }
  for (let brand = 0; brand < 3; brand++) {
    for (let dept = 0; dept < 5; dept++) {
      addAccount(`DM${brand + 1}E${dept + 1}`, `${BRAND_LABELS[brand]} Demo Policy Work - ${DEPTS[dept]}`, dept + 1)
    }
  }
  const clearCodes = CLEARING_LABELS.map((label, i) => {
    addAccount(`DMC${i + 1}`, label, 5)
    return `DMC${i + 1}`
  })

  const lines = []
  const summary = []
  let voucherIndex = 0
  for (let i = 0; i < 720; i++) {
    const ref = `DEMO-RO-${10001 + i}`
    const brand = i % 13 < 8 ? 0 : i % 13 < 11 ? 1 : 2
    const dept = i % 5
    const policyCode = `DM${brand + 1}E${dept + 1}`
    const clearingCode = clearCodes[(i + dept) % clearCodes.length]
    const month = (i % 10) + 1
    const day = ((i * 7) % 28) + 1
    const date = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const descriptionId = i % 19
    const vouchers = []
    const refJournals = []
    let totalPolicy = 0
    const jvCount = 1 + (i % 4 === 0 ? 1 : 0) + (i % 29 === 0 ? 1 : 0)
    for (let j = 0; j < jvCount; j++) {
      const journalId = JOURNAL_IDS[(i + j * 2) % JOURNAL_IDS.length]
      voucherIndex += 1
      const voucher = '98' + String(voucherIndex).padStart(7, '0')
      vouchers.push(voucher)
      refJournals.push(journalId)
      let seq = 0
      const post = (code, amountCents, descId = descriptionId) => {
        lines.push({ ref, voucher, seq: ++seq, code, amount: amountCents / 100, journalId, descId })
      }
      const expense = Math.round((245 + next() * 7600 + (i % 31 === 0 ? 7200 : 0)) * 100)
      post(policyCode, expense)
      post(clearingCode, -expense, 16)
      totalPolicy += expense
      if ((i + j) % 6 === 0) {
        const corrected = Math.round(expense * (0.18 + next() * 0.28))
        post(policyCode, -corrected, 15)
        post(clearingCode, corrected, 6)
        totalPolicy -= corrected
      }
      if ((i + j) % 49 === 0) {
        const reversed = Math.round(expense * 0.4)
        post(policyCode, -reversed, 15)
        post(clearingCode, reversed, 6)
        totalPolicy -= reversed
      }
      if ((i + j) % 5 === 0) {
        const dept2 = (dept + 1 + (i % 3)) % 5
        const extra = Math.round((140 + next() * 1100) * 100)
        post(`DM${brand + 1}E${dept2 + 1}`, extra, 6)
        post(clearingCode, -extra, 16)
        totalPolicy += extra
      }
      if (i % 7 === 0) {
        const ancillary = Math.round((40 + next() * 220) * 100)
        post(clearCodes[(dept + 2) % clearCodes.length], ancillary, 12)
        post(clearingCode, -ancillary, 16)
      }
    }
    summary.push({ ref, vouchers, code: policyCode, net: totalPolicy / 100, journalId: refJournals[0], date, description: DESCRIPTIONS[descriptionId] || 'Demo narrative unavailable' })
  }
  return { accounts, lines, summary }
}

function buildDataset() {
  const { accounts, lines, summary } = makeFictionalLedger()
  const byRef = new Map()
  lines.forEach((x, i) => {
    const account = accounts.get(x.code)
    const item = {
      id: `demo-line:${i}`, ref: x.ref, postingtime: x.voucher, postingsequence: x.seq, account: x.code,
      accountdescription: account.label, amount: x.amount, journal: JOURNAL_BY_ID[x.journalId] ?? 'Other Journals',
      dept: account.dept, description: DESCRIPTIONS[x.descId],
    }
    if (!byRef.has(x.ref)) byRef.set(x.ref, [])
    byRef.get(x.ref).push(item)
  })
  for (const list of byRef.values()) {
    list.sort((a, b) => a.postingtime.localeCompare(b.postingtime, 'en', { numeric: true }) || a.postingsequence - b.postingsequence || a.id.localeCompare(b.id))
  }
  const rows = summary.map((v, i) => {
    const account = accounts.get(v.code)
    const detail = byRef.get(v.ref)
    const postings = detail.filter((x) => accounts.get(x.account).label.includes('Policy Work'))
    const amounts = new Map()
    postings.forEach((x) => {
      const key = `${x.account}|${Math.round(Math.abs(x.amount) * 100)}`
      const t = amounts.get(key) ?? { p: 0, n: 0 }
      if (x.amount > 0) t.p++
      if (x.amount < 0) t.n++
      amounts.set(key, t)
    })
    return {
      id: `demo-reference:${i}`, ref: v.ref, postingtime: v.vouchers[0], jvNumbers: v.vouchers, account: v.code,
      accountdescription: account.label, amount: Math.round(v.net * 100) / 100,
      policyDebit: postings.reduce((s, x) => s + Math.max(0, x.amount), 0),
      policyCredit: postings.reduce((s, x) => s + Math.max(0, -x.amount), 0),
      policyLineCount: postings.length, glEntryCount: detail.length,
      hasOffset: [...amounts.values()].some((x) => x.p && x.n),
      dept: account.dept, brand: account.brand, journal: JOURNAL_BY_ID[v.journalId] ?? 'Other Journals',
      description: v.description, postDate: v.date, month: MONTHS[Number(v.date.slice(5, 7)) - 1],
    }
  })
  return { rows, byRef }
}

export const { rows: ROWS, byRef: LINES_BY_REF } = buildDataset()
export const ROW_BY_ID = new Map(ROWS.map((r) => [r.id, r]))
