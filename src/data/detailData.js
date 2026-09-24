import { compactMoney, unrecoveredPercent } from "./dashboard.js";

const salesColumns = [
  ["parts", "Part Sales", "money"],
  ["misc", "Misc Sales", "money"],
  ["labor", "Labor Sales", "money"],
  ["actual", "Shop Supplies", "money"],
];
const recoveryColumns = [
  ["expected", "Expected Shop Supplies", "money"],
  ["actual", "Actual Shop Supplies", "money"],
  ["loss", "Unrecovered Shop Supplies", "money"],
];

// Each drill-down uses the columns observed in the original dashboard.
export const detailColumns = {
  dealerLoss: [
    ["dealer", "Dealer"],
    ["ro", "RO Number"],
    ...salesColumns,
    ...recoveryColumns.slice(0, 2),
    ["collected", "Collected Shop Supplies Rate", "percent"],
    ["percent", "Unrecovered Shop Supplies Rate", "percent"],
  ],
  manager: [
    ["manager", "Manager"],
    ["advisors", "No of Service Advisor"],
    ["dealers", "No of Dealer"],
    ["count", "No of RO Number"],
    ...salesColumns,
    ...recoveryColumns,
  ],
  status: [["status", "Status Detail"], ...salesColumns, ...recoveryColumns],
  advisor: [
    ["advisor", "Service Advisor"],
    ["manager", "Sales Manager"],
    ["ro", "RO Number"],
    ...recoveryColumns,
  ],
  monthly: [
    ["ro", "RO Number"],
    ["advisor", "Service Advisor"],
    ["manager", "Sales Manager"],
    ["month", "Month"],
    ...salesColumns,
    ...recoveryColumns,
  ],
  vinLoss: [
    ["vin", "VIN"],
    ["ro", "RO Number"],
    ...salesColumns,
    ...recoveryColumns,
  ],
  recurring: [
    ["vin", "Vin"],
    ["ro", "RO Number"],
    ["dealer", "Dealer"],
    ...salesColumns,
    ["expected", "Total Shop Supplies"],
    ["expected", "Expected Shop Supplies"],
    ["actual", "Recovered Shop Supplies"],
  ],
};

// Adds sample sales categories for frontend tables; these are not production facts.
export function enrichRecord(row) {
  const labor = Number((row.serviceSales * 0.57).toFixed(2));
  return {
    ...row,
    labor,
    parts: Number((row.serviceSales - labor).toFixed(2)),
    misc: Number((row.serviceSales * 0.18).toFixed(2)),
    month: new Date(`${row.date}T12:00:00Z`)
      .toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
      .replace(" ", "-"),
    percent: unrecoveredPercent(row),
    collected: row.expected ? (row.actual / row.expected) * 100 : 0,
  };
}

// Totals the rows for manager and recovery-status tables.
export function aggregateDetails(rows, field) {
  const groups = new Map();
  for (const source of rows) {
    const row = enrichRecord(source);
    const name = row[field] || "(Blank)";
    if (!groups.has(name))
      groups.set(name, {
        [field]: name,
        parts: 0,
        misc: 0,
        labor: 0,
        expected: 0,
        actual: 0,
        loss: 0,
        count: 0,
        advisorSet: new Set(),
        dealerSet: new Set(),
      });
    const group = groups.get(name);
    for (const key of ["parts", "misc", "labor", "expected", "actual", "loss"])
      group[key] += row[key];
    group.count++;
    group.advisorSet.add(row.advisor);
    group.dealerSet.add(row.dealer);
  }
  return [...groups.values()].map(({ advisorSet, dealerSet, ...group }) => ({
    ...group,
    advisors: advisorSet.size,
    dealers: dealerSet.size,
  }));
}

// Formats a detail value without changing its underlying sorting value.
export function detailValue(value, format) {
  if (format === "integer") return Number(value || 0).toFixed(0);
  if (format === "money")
    return compactMoney(value).replace("$", "$ ").replace("K", " K");
  if (format === "percent") return `${Number(value || 0).toFixed(2)}%`;
  return value ?? "";
}

// Exports exactly the active detail columns and safely quotes every CSV value.
export function detailCSV(rows, columns) {
  // Prevents spreadsheet formulas and escapes commas, quotes, and line breaks.
  function cell(value) {
    return `"${String(value ?? "")
      .replace(/^[=+@-]/, "'$&")
      .replaceAll('"', '""')}"`;
  }
  return [
    columns.map(([, label]) => cell(label)).join(","),
    ...rows.map((row) =>
      columns
        .map(([key, , format]) =>
          cell(format === "percent" ? detailValue(row[key], format) : row[key]),
        )
        .join(","),
    ),
  ].join("\r\n");
}
