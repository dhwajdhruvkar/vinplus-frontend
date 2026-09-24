import test from "node:test";
import assert from "node:assert/strict";
import {
  records,
  defaultFilters,
  filterRecords,
  summarize,
  groupRecords,
  toCSV,
  isFiltered,
  dailyMetrics,
} from "../src/data/dashboard.js";

test("the default period includes the complete visible reference table", () => {
  assert.equal(filterRecords(records, defaultFilters).length, 16);
  assert.equal(isFiltered(defaultFilters), false);
});
test("date ranges include both boundaries and exclude records outside them", () => {
  const rows = filterRecords(records, {
    ...defaultFilters,
    from: "2024-02-02",
    to: "2024-02-02",
  });
  assert.equal(rows.length, 2);
  assert.ok(rows.every((r) => r.date === "2024-02-02"));
  assert.equal(
    filterRecords(records, { ...defaultFilters, from: "2024-03-01" }).length,
    0,
  );
});
test("manager and advisor selections intersect rather than overwriting each other", () => {
  assert.equal(
    filterRecords(records, { ...defaultFilters, manager: "Abbas-Haider" })
      .length,
    3,
  );
  assert.equal(
    filterRecords(records, {
      ...defaultFilters,
      manager: "Abbas-Haider",
      advisor: "Cesar-Valdez",
    }).length,
    0,
  );
});
test("search is case insensitive and can match a repair order or a vehicle", () => {
  assert.equal(
    filterRecords(records, { ...defaultFilters, query: " 163547 " })[0].model,
    "STELVI",
  );
  assert.ok(
    filterRecords(records, { ...defaultFilters, query: "ferr" }).every(
      (r) => r.make === "FERR",
    ),
  );
});
test("summary figures retain monetary precision and handle an empty selection", () => {
  const sum = summarize(records.slice(0, 2));
  assert.equal(sum.total, 2);
  assert.ok(Math.abs(sum.loss - 58.51) < 1e-9);
  assert.equal(sum.partial, 2);
  const empty = summarize([]);
  assert.equal(empty.rate, 0);
  assert.equal(empty.recovery, 0);
  assert.equal(empty.loss, 0);
  assert.ok(Object.values(empty).every(Number.isFinite));
});
test("grouped chart totals reconcile with filtered detail records", () => {
  const groups = groupRecords(records, "manager");
  assert.equal(
    groups.reduce((sum, g) => sum + g.total, 0),
    records.length,
  );
  assert.ok(
    Math.abs(
      groups.reduce((sum, g) => sum + g.loss, 0) - summarize(records).loss,
    ) < 1e-9,
  );
});
test("status filtering and exact repair order selection produce correct empty states", () => {
  assert.equal(
    filterRecords(records, { ...defaultFilters, status: "Fully Recovered" })
      .length,
    0,
  );
  assert.equal(
    filterRecords(records, {
      ...defaultFilters,
      status: "Partially Recovered",
      ro: "164226",
    }).length,
    1,
  );
});
test("CSV escapes quotes, preserves amounts, and neutralizes spreadsheet formulas", () => {
  const csv = toCSV([{ ...records[0], model: '=HYPERLINK("x")' }]);
  assert.ok(csv.includes('"\'=HYPERLINK(""x"")"'));
  assert.ok(csv.includes('"38.51"'));
  assert.equal(csv.split("\r\n").length, 2);
});
test("each daily KPI drill-down uses its own metric", () => {
  const sample = records.slice(0, 1);
  assert.equal(
    dailyMetrics(sample, "Total Sales")[0].metric,
    sample[0].serviceSales,
  );
  assert.equal(
    dailyMetrics(sample, "Shop Supplies Partial Recovery")[0].metric,
    1,
  );
  assert.equal(dailyMetrics(sample, "Partial Recovery %")[0].metric, 100);
  assert.equal(
    dailyMetrics(sample, "Shop Supplies Recovery Status")[0].metric,
    sample[0].actual,
  );
  assert.equal(
    dailyMetrics(sample, "Unrecovered Shop Supplies")[0].metric,
    sample[0].loss,
  );
});
