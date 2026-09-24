import {
  groupRecords,
  referenceAdvisor,
  referenceManager,
  vins,
} from "./dashboard.js";

// The initial chart values reproduce the reference dashboard's visible totals.
const referenceCharts = {
  dealerOrders: [
    { name: "6385", expected: 440, actual: 303 },
    { name: "SHELTON", expected: 1, actual: 1 },
  ],
  dealerLoss: [
    { name: "6385", loss: 21200 },
    { name: "SHELTON", loss: 20 },
  ],
  managers: referenceManager,
  advisors: referenceAdvisor,
  vinOrders: vins.slice(0, 6).map((name, index) => ({
    name,
    expected: index === 0 ? 2 : 1,
    actual: [1, 1, 0, 1, 0, 1][index],
  })),
  vinLoss: vins.slice(0, 6).map((name, index) => ({
    name,
    loss: [119, 107.23, 0, 61.75, 0, 119][index],
  })),
  recurring: [
    { name: vins[1], expected: 107.23, count: 2 },
    { name: vins[3], expected: 61.75, count: 1 },
    { name: vins[5], expected: 119, count: 1 },
    { name: vins[6], expected: 48.55, count: 1 },
    { name: vins[7], expected: 119, count: 1 },
  ],
};

// Uses record counts for the two bars in an order-count chart.
function orderCounts(group) {
  return { ...group, expected: group.total, actual: group.partial };
}

// Returns the reference charts or rebuilds them from the filtered sample rows.
export function getChartData(rows, filtered) {
  if (!filtered) return referenceCharts;

  const dealers = groupRecords(rows, "dealer");
  const vehicles = groupRecords(rows, "vin");
  return {
    dealerOrders: dealers.map(orderCounts),
    dealerLoss: dealers,
    managers: groupRecords(rows, "manager"),
    advisors: groupRecords(rows, "advisor"),
    vinOrders: vehicles.map(orderCounts),
    vinLoss: vehicles,
    recurring: vehicles,
  };
}

// Leaves space above the largest value, including when there are no records.
export function chartMaximum(data, key) {
  return Math.max(1, ...data.map((row) => row[key] || 0)) * 1.12;
}
