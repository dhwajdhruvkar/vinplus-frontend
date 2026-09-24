import test from "node:test";
import assert from "node:assert/strict";
import { getChartData, chartMaximum } from "../src/data/chartData.js";
import {
  records,
  filterRecords,
  defaultFilters,
  summarize,
  toCSV,
} from "../src/data/dashboard.js";

test("the default charts retain the reference counts even with only sample rows", () => {
  const data = getChartData(records, false);
  assert.deepEqual(data.dealerOrders, [
    { name: "6385", expected: 440, actual: 303 },
    { name: "SHELTON", expected: 1, actual: 1 },
  ]);
  assert.equal(data.dealerLoss[0].loss, 21200);
  assert.equal(data.vinOrders[0].expected, 2);
});

test("filtered chart counts and dollar totals agree with the selected repair orders", () => {
  const selected = filterRecords(records, {
    ...defaultFilters,
    advisor: "Luis-Cue",
  });
  const original = structuredClone(selected);
  const data = getChartData(selected, true);
  const summary = summarize(selected);
  assert.equal(
    data.dealerOrders.reduce((sum, row) => sum + row.expected, 0),
    selected.length,
  );
  assert.equal(
    data.vinOrders.reduce((sum, row) => sum + row.actual, 0),
    summary.partial,
  );
  assert.equal(
    data.recurring.reduce((sum, row) => sum + row.count, 0),
    selected.length,
  );
  for (const groups of [
    data.dealerLoss,
    data.managers,
    data.advisors,
    data.vinLoss,
  ]) {
    const loss = groups.reduce((sum, row) => sum + row.loss, 0);
    assert.ok(Math.abs(loss - summary.loss) < 1e-9);
  }
  assert.deepEqual(selected, original);
});

test("empty filtered charts stay empty with a usable axis range", () => {
  const data = getChartData([], true);
  for (const rows of Object.values(data)) {
    assert.deepEqual(rows, []);
    assert.ok(chartMaximum(rows, "expected") > 0);
  }
});

test("CSV preserves the source percentage instead of recalculating rounded amounts", () => {
  const row = records.find((record) => record.ro === "164670");
  assert.ok(toCSV([row]).includes('"33.33%"'));
});
