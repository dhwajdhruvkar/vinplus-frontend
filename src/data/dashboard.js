// Presentation fixtures. No credentials, production endpoints, or backend calls.
export const defaultFilters = {
  from: "2024-02-01",
  to: "2024-02-13",
  manager: "",
  advisor: "",
  status: "",
  vin: "",
  ro: "",
  query: "",
};
export const managers = [
  "Abbas-Haider",
  "Christina-Athanasiadis",
  "Shyl-Patchell",
  "Danielle-Navarino",
  "Peter-Lehmann",
  "Garrett-Hayim",
];
export const advisors = [
  "Luis-Cue",
  "Cesar-Valdez",
  "Jonathan-Garcia",
  "Sean-Fitzgerald",
  "Yessid-Gonzalez",
  "Michael-Rivera",
];
export const vins = [
  "ZFF97CMAXN0269722",
  "ZFF96NMA1N0283166",
  "ZFF98RNA5P0289829",
  "ZN661XUAXNX391304",
  "WVGGR9P0CD002672",
  "ZFF99SLA7R0300842",
  "ZASPAKBNXR7077771",
  "ZFF73SKT2C0180466",
];
const sourceRows = [
  ["161326", "6385", "NULL", "FERR", "550M", 38.51, 0],
  ["163547", "6385", "NULL", "ALFA", "STELVI", 119, 99],
  ["163616", "6385", "NULL", "FERR", "PORTO", 119, 99],
  ["164226", "6385", "L", "FERR", "CALIT", 119, 99],
  ["164400", "6385", "NULL", "FERR", "488S", 119, 85.93],
  ["164466", "6385", "R", "MASE", "GRECALEM", 71.04, 0],
  ["164524", "6385", "R", "MASE", "GT550AU24", 119, 0],
  ["164540", "6385", "R", "FERR", "812GTS", 119, 0],
  ["164551", "6385", "R", "MASE", "LEVANTESGL", 119, 0],
  ["164567", "6385", "NULL", "FERR", "CAL-T", 119, 99],
  ["164670", "6385", "R", "MASE", "GHIBLI", 100.76, 67.17],
  ["164696", "6385", "NULL", "FERR", "812VS", 119, 0],
  ["164728", "6385", "NULL", "MASE", "QTRPRT", 119, 99],
  ["164744", "", "", "FERR", "246", 119, 99],
  ["164776", "6385", "R", "FERR", "360SP6X", 8.85, 0],
  ["164870", "6385", "R", "FERR", "F8SP", 32.63, 0],
];
// Only the visible table values were copied. Dates and chart associations below
// are sample metadata for demonstrating frontend filters, not production facts.
export const records = sourceRows.map(
  ([ro, dealer, type, make, model, expected, actual], i) => ({
    ro,
    dealer,
    type,
    make,
    model,
    expected,
    actual,
    loss: Number((expected - actual).toFixed(2)),
    // This row's source percentage uses greater precision than the rounded amounts.
    percent:
      ro === "164670"
        ? 33.33
        : expected
          ? ((expected - actual) / expected) * 100
          : 0,
    date: `2024-02-${String((i % 13) + 1).padStart(2, "0")}`,
    manager: managers[i % managers.length],
    advisor: advisors[i % advisors.length],
    vin: vins[i % vins.length],
    status: expected > actual ? "Partially Recovered" : "Fully Recovered",
    serviceSales: Number((expected * 17.22).toFixed(2)),
  }),
);
export const referenceSummary = {
  sales: 510659.19,
  expected: 29660.0645,
  partial: 307,
  total: 446,
  rate: 68.83,
  actual: 8379.69,
  recovery: 28.252434,
  loss: 21280.3745,
};
export const referenceManager = managers.map((name, i) => ({
  name,
  expected: [6700, 3470, 918.2, 177.5, 119, 119][i],
  actual: [1250, 297, 450.8, 39, 99, 99][i],
}));
export const referenceAdvisor = advisors.map((name, i) => ({
  name,
  count: [70, 45, 40, 41, 45, 26][i],
  loss: [4530, 4060, 3500, 2700, 2600, 1890][i],
}));
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// Formats an amount as US dollars, including cents.
export function money(amount) {
  return currencyFormatter.format(Number(amount) || 0);
}

// Shortens large dollar amounts for cards and chart labels.
export function compactMoney(amount) {
  if (Math.abs(amount) >= 1000) return `$${(amount / 1000).toFixed(2)}K`;
  return money(amount);
}

// Converts an ISO date into the month-day-year label used on this page.
export function dateLabel(value) {
  if (!value) return "All dates";
  return `${value.slice(5, 7)}-${value.slice(8, 10)}-${value.slice(0, 4)}`;
}

// Checks whether any selection differs from the original dashboard filters.
export function isFiltered(filters) {
  return Object.keys(defaultFilters).some(
    (key) => filters[key] !== defaultFilters[key],
  );
}
// Keeps rows that match every active filter and the optional search text.
export function filterRecords(rows, filters) {
  const query = filters.query.trim().toLowerCase();
  return rows.filter(
    (row) =>
      (!filters.from || row.date >= filters.from) &&
      (!filters.to || row.date <= filters.to) &&
      matchesFilter(row.manager, filters.manager) &&
      matchesFilter(row.advisor, filters.advisor) &&
      matchesFilter(row.status, filters.status) &&
      matchesFilter(row.vin, filters.vin) &&
      matchesFilter(row.ro, filters.ro) &&
      (!query ||
        [
          row.ro,
          row.dealer,
          row.make,
          row.model,
          row.manager,
          row.advisor,
          row.vin,
        ].some((value) => value.toLowerCase().includes(query))),
  );
}

// Matches a single value or any value from a multi-select control.
export function matchesFilter(value, selection) {
  if (Array.isArray(selection))
    return !selection.length || selection.includes(value);
  return !selection || value === selection;
}
// Calculates the totals and recovery percentages displayed in the summary cards.
export function summarize(rows) {
  const expected = rows.reduce((sum, row) => sum + row.expected, 0);
  const actual = rows.reduce((sum, row) => sum + row.actual, 0);
  const partial = rows.filter((row) => row.loss > 0).length;
  return {
    sales: rows.reduce((sum, row) => sum + row.serviceSales, 0),
    expected,
    actual,
    loss: expected - actual,
    partial,
    total: rows.length,
    rate: rows.length ? (partial / rows.length) * 100 : 0,
    recovery: expected ? (actual / expected) * 100 : 0,
  };
}
// Groups records by a field and adds the amounts and counts needed by charts.
export function groupRecords(rows, key) {
  const groups = Object.create(null);
  for (const row of rows) {
    const name = row[key] || "(Blank)";
    if (!groups[name]) {
      groups[name] = {
        name,
        expected: 0,
        actual: 0,
        loss: 0,
        total: 0,
        partial: 0,
        count: 0,
        sales: 0,
      };
    }
    const group = groups[name];
    group.expected += row.expected;
    group.actual += row.actual;
    group.loss += row.loss;
    group.sales += row.serviceSales;
    group.total++;
    group.count++;
    if (row.loss > 0) group.partial++;
  }
  return Object.values(groups);
}

// Picks the matching daily value for the summary card the user selected.
function metricValue(group, title) {
  switch (title) {
    case "Total Sales":
      return group.sales;
    case "Shop Supplies Partial Recovery":
      return group.partial;
    case "Partial Recovery %":
      return group.total ? (group.partial / group.total) * 100 : 0;
    case "Shop Supplies Recovery Status":
      return group.actual;
    default:
      return group.loss;
  }
}

// Builds one chart entry per date for a summary-card drill-down.
export function dailyMetrics(rows, title) {
  return groupRecords(rows, "date").map((row) => ({
    ...row,
    metric: metricValue(row, title),
  }));
}
export const tableColumns = [
  ["ro", "RO Number"],
  ["dealer", "Dealer Code"],
  ["type", "Dealer Type"],
  ["make", "Make"],
  ["model", "Model"],
  ["expected", "Expected Shop Supplies"],
  ["actual", "Actual Shop Supplies"],
  ["loss", "Unrecovered Shop Supplies"],
  ["percent", "Unrecovered %"],
];
// Uses the source percentage when supplied, otherwise calculates it from amounts.
export function unrecoveredPercent(row) {
  if (row.percent !== undefined && row.percent !== null) return row.percent;
  return row.expected ? (row.loss / row.expected) * 100 : 0;
}

// Quotes a CSV cell and prevents text from being read as a spreadsheet formula.
function csvCell(value) {
  const escaped = String(value)
    .replace(/^[=+@-]/, "'$&")
    .replaceAll('"', '""');
  return `"${escaped}"`;
}

// Exports the table columns and rows with the same displayed percentages.
export function toCSV(rows) {
  return [
    tableColumns.map(([, label]) => csvCell(label)).join(","),
    ...rows.map((row) =>
      tableColumns
        .map(([key]) =>
          csvCell(
            key === "percent"
              ? unrecoveredPercent(row).toFixed(2) + "%"
              : row[key],
          ),
        )
        .join(","),
    ),
  ].join("\r\n");
}
