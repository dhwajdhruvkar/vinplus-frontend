export function trendMonthIndex(svg, clientX) {
  const box = svg.getBoundingClientRect()
  const x = ((clientX - box.left) * 605) / (box.width || 605)
  return Math.max(0, Math.min(9, Math.round((x - 58) / 58.5)))
}
