const exact = { minimumFractionDigits: 2, maximumFractionDigits: 2 }

export const fmt = (n) => '$' + Math.abs(Number(n) || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })
// Whole-dollar amount that keeps the sign (fmt drops it). Used for Live Mode values that can legitimately be negative.
export const fmtSigned = (n) => (Number(n) < 0 ? '−' : '') + fmt(n)
export const amt =(n) => (n < 0 ? '−' : '') + '$' + Math.abs(Number(n) || 0).toLocaleString('en-US', exact)
export const moneyExact = (v) => '$' + Math.abs(Number(v) || 0).toLocaleString('en-US', exact)
export const moneySigned = (v) => (Number(v) < 0 ? '−' : Number(v) > 0 ? '+' : '') + moneyExact(v)
export const pct = (v, total) => (((Number(v) || 0) / (total || 1)) * 100).toFixed(1) + '%'

export function displayTime(time) {
  try {
    return new Date(time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return ''
  }
}
