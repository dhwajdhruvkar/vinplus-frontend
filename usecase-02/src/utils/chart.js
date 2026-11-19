const FIRST_X = 58
const LAST_X = 584.5

// Slots are spread evenly from FIRST_X to LAST_X, which is 58.5 apart for the usual ten months.
export const trendX = (index, count) => (count > 1 ? FIRST_X + (index * (LAST_X - FIRST_X)) / (count - 1) : (FIRST_X + LAST_X) / 2)

export function trendMonthIndex(svg, clientX, count = 10) {
  const box = svg.getBoundingClientRect()
  const x = ((clientX - box.left) * 605) / (box.width || 605)
  const step = count > 1 ? (LAST_X - FIRST_X) / (count - 1) : 1
  return Math.max(0, Math.min(count - 1, Math.round((x - FIRST_X) / step)))
}
