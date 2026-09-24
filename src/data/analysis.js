import { detailValue, enrichRecord, aggregateDetails } from "./detailData.js";
import { getChartData } from "./chartData.js";
import { summarize, referenceSummary } from "./dashboard.js";
import { salesMix } from "./salesMix.js";

// Rebuilds the chart or drill table when filters change inside the analysis drawer.
export function analysisRows(id, rows, filtered, level) {
  if (id === "records") return rows;
  if (level)
    return id === "manager"
      ? aggregateDetails(rows, level === 2 ? "status" : "manager")
      : rows.map(enrichRecord);
  if (id === "salesMix") return salesMix(rows, filtered);
  if (id === "monthly")
    return [
      {
        name: "2024-02",
        loss: (filtered ? summarize(rows) : referenceSummary).loss,
      },
    ];
  return (
    getChartData(rows, filtered)[
      { manager: "managers", advisor: "advisors" }[id] || id
    ] || []
  );
}

// Summarizes the displayed values without inventing an AI response or unseen records.
export function chartFindings(rows, columns, prompt = "") {
  const labelKey = columns[0]?.[0];
  const numeric = columns.filter(([key]) =>
    rows.some((row) => typeof row[key] === "number"),
  );
  const lowest = /lowest|smallest|bottom|minimum/i.test(prompt);
  return numeric.map(([key, label, format]) => {
    const sorted = [...rows].sort(
      (a, b) => (Number(a[key]) || 0) - (Number(b[key]) || 0),
    );
    const total = rows.reduce((sum, row) => sum + (Number(row[key]) || 0), 0);
    const item = lowest ? sorted[0] : sorted.at(-1);
    const value =
      format === "percent" && rows.length ? total / rows.length : total;
    return `${label}${format === "percent" ? " (average)" : ""}: ${detailValue(value, format)} across ${rows.length} entries. ${lowest ? "Lowest" : "Highest"}: ${item?.[labelKey] || "—"} (${detailValue(item?.[key] || 0, format)}).`;
  });
}

// Groups the available records by year, quarter, or month for local change analysis.
export function periodMetrics(rows, field, value, metric, frequency) {
  const groups = new Map();
  for (const row of rows) {
    if (
      field &&
      (field === "month" ? row.date.slice(0, 7) : row[field]) !== value
    )
      continue;
    const [year, month] = row.date.split("-");
    const name =
      frequency === "YTD"
        ? year
        : frequency === "QTD"
          ? `${year} Q${Math.ceil(Number(month) / 3)}`
          : `${year}-${month}`;
    const amount = metric === "count" ? 1 : Number(row[metric]) || 0;
    groups.set(name, (groups.get(name) || 0) + amount);
  }
  const ordered = [...groups].sort(([a], [b]) => a.localeCompare(b));
  return ordered.map(([name, value], index) => ({
    name,
    value,
    change:
      index && ordered[index - 1][1]
        ? ((value - ordered[index - 1][1]) / ordered[index - 1][1]) * 100
        : null,
  }));
}
