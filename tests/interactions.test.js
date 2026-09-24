import test from "node:test";
import assert from "node:assert/strict";
import {
  initialInteractions,
  interactionReducer,
  matchSelections,
} from "../src/data/interactions.js";
import {
  defaultFilters,
  filterRecords,
  records,
  referenceSummary,
} from "../src/data/dashboard.js";
import { weekdayMetrics } from "../src/data/kpiData.js";
import {
  aggregateDetails,
  detailCSV,
  detailColumns,
} from "../src/data/detailData.js";
import { salesMix } from "../src/data/salesMix.js";

// Builds a chart selection in the same shape used by the dashboard hook.
function choose(state, owner, field, value, level, depth = level || 0) {
  return interactionReducer(state, {
    type: "select",
    level,
    selection: { id: `${owner}-${depth}`, owner, field, value, depth },
  });
}

test("dealer charts keep separate selections even when they share a field", () => {
  let state = choose(initialInteractions, "dealerOrders", "dealer", "6385");
  state = choose(state, "dealerLoss", "dealer", "SHELTON", 1);
  assert.equal(state.selections.length, 2);
  assert.equal(matchSelections(records, state.selections).length, 0);
  state = interactionReducer(state, { type: "remove", id: "dealerLoss-1" });
  assert.equal(state.levels.dealerLoss, 0);
  assert.equal(state.selections[0].owner, "dealerOrders");
  assert.equal(matchSelections(records, state.selections).length, 15);
});

test("manager drill-up removes dependent status selections one level at a time", () => {
  let state = choose(
    initialInteractions,
    "manager",
    "manager",
    "Abbas-Haider",
    1,
  );
  state = choose(state, "manager", "manager", "Abbas-Haider", 2);
  state = choose(state, "manager", "status", "Partially Recovered", 2, 3);
  state = choose(state, "vinOrders", "vin", records[0].vin);
  state = interactionReducer(state, { type: "up", owner: "manager" });
  assert.equal(state.levels.manager, 1);
  assert.deepEqual(
    state.selections.map((item) => item.id),
    ["manager-1", "vinOrders-0"],
  );
  state = interactionReducer(state, { type: "up", owner: "manager" });
  assert.equal(state.levels.manager, 0);
  assert.equal(state.selections.length, 1);
});

test("removing a parent chip removes its child selections without leaving a stale table", () => {
  let state = choose(initialInteractions, "advisor", "advisor", "Luis-Cue", 1);
  state = choose(state, "advisor", "ro", "161326", 1, 2);
  state = interactionReducer(state, { type: "remove", id: "advisor-1" });
  assert.deepEqual(state.selections, []);
  assert.equal(state.levels.advisor, 0);
});

test("changing a category replaces that panel's drill filters and global reset clears all", () => {
  let state = choose(
    initialInteractions,
    "manager",
    "manager",
    "Abbas-Haider",
    1,
  );
  state = choose(state, "manager", "manager", "Abbas-Haider", 2);
  state = choose(state, "manager", "manager", "Shyl-Patchell", 1);
  assert.equal(state.selections.length, 1);
  assert.equal(state.selections[0].value, "Shyl-Patchell");
  state = interactionReducer(state, { type: "reset" });
  assert.equal(state.revision, 1);
  assert.deepEqual(state.selections, []);
  assert.deepEqual(state.levels, {});
});

test("multi-select values combine within a field and intersect other fields", () => {
  const result = filterRecords(records, {
    ...defaultFilters,
    advisor: ["Luis-Cue", "Cesar-Valdez"],
    ro: ["161326", "163547", "163616"],
  });
  assert.deepEqual(
    result.map((row) => row.ro),
    ["161326", "163547"],
  );
  assert.equal(
    filterRecords(records, { ...defaultFilters, advisor: [] }).length,
    16,
  );
});

test("weekday reference values reconcile with each KPI total", () => {
  for (const metric of ["sales", "partial", "actual", "loss"]) {
    const sum = weekdayMetrics(records, metric, false).reduce(
      (total, row) => total + row.value,
      0,
    );
    assert.ok(Math.abs(sum - referenceSummary[metric]) < 0.001, metric);
  }
  assert.ok(
    weekdayMetrics([], "rate", true).every(
      (row) => Number.isFinite(row.value) && row.value === 0,
    ),
  );
});

test("detail aggregates and filtered donut amounts come from the same sample records", () => {
  const details = aggregateDetails(records, "manager");
  assert.equal(
    details.reduce((total, row) => total + row.count, 0),
    records.length,
  );
  assert.ok(
    Math.abs(
      details.reduce((total, row) => total + row.actual, 0) -
        salesMix(records, true).find((row) => row.name === "Shop Supplies")
          .value,
    ) < 1e-8,
  );
  assert.ok(salesMix([], true).every((row) => row.value === 0));
});

test("chart CSV uses its own columns and prevents spreadsheet formula injection", () => {
  const csv = detailCSV(
    [
      {
        advisor: '=HYPERLINK("x")',
        manager: "A",
        ro: "12",
        expected: 5,
        actual: 2,
        loss: 3,
      },
    ],
    detailColumns.advisor,
  );
  assert.ok(csv.startsWith('"Service Advisor","Sales Manager","RO Number"'));
  assert.ok(csv.includes('"\'=HYPERLINK(""x"")"'));
  assert.ok(csv.endsWith('"5","2","3"'));
});
