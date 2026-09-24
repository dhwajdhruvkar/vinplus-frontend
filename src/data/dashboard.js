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
export const money = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(n) || 0,
  );
export const compactMoney = (n) =>
  Math.abs(n) >= 1000 ? `$${(n / 1000).toFixed(2)}K` : money(n);
export const dateLabel = (value) =>
  value
    ? `${value.slice(5, 7)}-${value.slice(8, 10)}-${value.slice(0, 4)}`
    : "All dates";
export function isFiltered(filters) {
  return Object.keys(defaultFilters).some(
    (key) => filters[key] !== defaultFilters[key],
  );
}
export function filterRecords(rows, f) {
  const query = f.query.trim().toLowerCase();
  return rows.filter(
    (row) =>
      (!f.from || row.date >= f.from) &&
      (!f.to || row.date <= f.to) &&
      (!f.manager || row.manager === f.manager) &&
      (!f.advisor || row.advisor === f.advisor) &&
      (!f.status || row.status === f.status) &&
      (!f.vin || row.vin === f.vin) &&
      (!f.ro || row.ro === f.ro) &&
      (!query ||
        [
          row.ro,
          row.dealer,
          row.make,
          row.model,
          row.manager,
          row.advisor,
          row.vin,
        ].some((v) => v.toLowerCase().includes(query))),
  );
}
export function summarize(rows) {
  const expected = rows.reduce((sum, r) => sum + r.expected, 0),
    actual = rows.reduce((sum, r) => sum + r.actual, 0);
  const partial = rows.filter((r) => r.loss > 0).length;
  return {
    sales: rows.reduce((sum, r) => sum + r.serviceSales, 0),
    expected,
    actual,
    loss: expected - actual,
    partial,
    total: rows.length,
    rate: rows.length ? (partial / rows.length) * 100 : 0,
    recovery: expected ? (actual / expected) * 100 : 0,
  };
}
export function groupRecords(rows, key) {
  return Object.values(
    rows.reduce((all, row) => {
      const name = row[key] || "(Blank)";
      all[name] ||= {
        name,
        expected: 0,
        actual: 0,
        loss: 0,
        total: 0,
        partial: 0,
        count: 0,
        sales: 0,
      };
      const group = all[name];
      group.expected += row.expected;
      group.actual += row.actual;
      group.loss += row.loss;
      group.sales += row.serviceSales;
      group.total++;
      group.count++;
      if (row.loss > 0) group.partial++;
      return all;
    }, {}),
  );
}
export function dailyMetrics(rows, title) {
  return groupRecords(rows, "date").map((row) => ({
    ...row,
    metric:
      title === "Total Sales"
        ? row.sales
        : title === "Shop Supplies Partial Recovery"
          ? row.partial
          : title === "Partial Recovery %"
            ? row.total
              ? (row.partial / row.total) * 100
              : 0
            : title === "Shop Supplies Recovery Status"
              ? row.actual
              : row.loss,
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
export function toCSV(rows) {
  const cell = (value) =>
    '"' +
    String(value)
      .replace(/^[=+@-]/, "'$&")
      .replaceAll('"', '""') +
    '"';
  return [
    tableColumns.map((c) => cell(c[1])).join(","),
    ...rows.map((row) =>
      tableColumns
        .map(([key]) =>
          cell(
            key === "percent"
              ? (
                  row.percent ??
                  (row.expected ? (row.loss / row.expected) * 100 : 0)
                ).toFixed(2) + "%"
              : row[key],
          ),
        )
        .join(","),
    ),
  ].join("\r\n");
}
