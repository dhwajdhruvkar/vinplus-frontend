// Describes each chart's labels, series, and drill-down fields in one place.
export const panels = {
  dealerOrders: {
    title: "Partial Recovery Repair Orders by Dealer",
    type: "column",
    field: "dealer",
    selection: "Flagged Record",
    series: [
      ["expected", "Total Records by Dealer", "green"],
      ["actual", "Flagged records by Dealer", "yellow"],
    ],
    max: 600,
  },
  dealerLoss: {
    title: "Unrecovered Shop Supplies by Dealer",
    type: "bar",
    field: "dealer",
    selection: "Unrecovered SS",
    crumbs: ["Unrecovered SS", "Detail"],
    currency: true,
    series: [["loss", "Unrecovered Shop Supplies", "red"]],
    max: 25000,
  },
  salesMix: {
    title: "Unrecovered Shop Supplies Sales Metrics Breakdown",
    type: "donut",
    series: [],
  },
  manager: {
    title: "Manager Performance Analysis",
    type: "column",
    field: "manager",
    selection: "Manager",
    crumbs: ["Manager Name", "Manager Details", "Status Detail"],
    currency: true,
    line: true,
    series: [
      ["expected", "Expected Shop Supplies", "green"],
      ["actual", "Actual Shop Supplies", "yellow"],
    ],
    max: 7500,
  },
  advisor: {
    title: "Service Advisor Performance",
    type: "bar",
    field: "advisor",
    selection: "Service Advisor",
    crumbs: ["Service Advisor", "RO Details"],
    series: [
      ["count", "No of RO Number", "yellow", false, 60],
      ["loss", "Unrecovered Shop Supplies", "red", true],
    ],
    max: 5400,
  },
  monthly: {
    title: "Monthly Unrecovered Shop Supplies Trend",
    type: "trend",
    field: "month",
    selection: "Monthly",
    crumbs: ["Monthly", "RO Details"],
    series: [["loss", "Unrecovered Shop Supplies", "red", true]],
  },
  vinOrders: {
    title: "Partial Recovery Repair Orders by VIN",
    type: "bar",
    field: "vin",
    selection: "Flagg Records Vin",
    series: [
      ["expected", "Total Records", "green"],
      ["actual", "Partial Recovery", "red"],
    ],
    max: 2.5,
  },
  vinLoss: {
    title: "Unrecovered Shop Supplies by VIN",
    type: "bar",
    field: "vin",
    selection: "Unrecovered S S",
    crumbs: ["Unrecovered S S", "Details"],
    currency: true,
    series: [["loss", "Unrecovered Shop Supplies", "red"]],
    max: 125,
  },
  recurring: {
    title: "Recurring Shop Supplies Shortfall by Vehicle",
    type: "bar",
    field: "vin",
    selection: "VIN",
    crumbs: ["VIN", "Detail"],
    series: [
      ["expected", "Expected Shop Supplies", "green", true],
      ["count", "Recurring exceptions", "yellow", false, 60],
    ],
    max: 150,
  },
};

// Sorts a copy so display preferences never mutate shared chart fixtures.
export function sortChartRows(rows, sort) {
  if (!sort) return rows;
  return [...rows].sort((first, second) => {
    const a = first[sort.field];
    const b = second[sort.field];
    const difference =
      typeof a === "number"
        ? a - b
        : String(a ?? "").localeCompare(String(b ?? ""), undefined, {
            numeric: true,
          });
    return sort.direction === "ascending" ? difference : -difference;
  });
}
