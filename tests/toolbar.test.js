import test from "node:test";
import assert from "node:assert/strict";
import { readEmbed, createEmbedLink, embedSnippet } from "../src/data/embed.js";
import { defaultFilters } from "../src/data/dashboard.js";
import { chartFindings, periodMetrics } from "../src/data/analysis.js";
import { excelCells } from "../src/utils/chartExport.js";

test("embed links preserve selected filters, drill state, type, and sorting", () => {
  const state = {
    filters: { ...defaultFilters, manager: ["Manager A"] },
    interactions: {
      selections: [
        {
          id: "vinLoss-1",
          owner: "vinLoss",
          label: "VIN",
          field: "vin",
          value: "TEST-VIN",
          depth: 1,
        },
      ],
      levels: { vinLoss: 1 },
    },
    mode: "lollipop",
    sort: { field: "loss", direction: "ascending" },
  };
  const link = createEmbedLink(
    "https://example.test/?old=true#hash",
    "vinLoss",
    "public",
    ["filters", "title", "csv"],
    state,
  );
  const result = readEmbed(new URL(link).search);
  assert.deepEqual(result.filters, state.filters);
  assert.deepEqual(
    result.interactions.selections,
    state.interactions.selections,
  );
  assert.equal(result.interactions.levels.vinLoss, 1);
  assert.equal(result.mode, "lollipop");
  assert.deepEqual(result.sort, state.sort);
  assert.deepEqual(result.controls, ["filters", "title", "csv"]);
  assert.equal(new URL(link).hash, "");
});

test("embed links omit dashboard filters when that control is unchecked", () => {
  const link = createEmbedLink(
    "https://example.test/",
    "vinLoss",
    "private",
    [],
    { filters: { manager: "Manager A" }, mode: "line", sort: null },
  );
  const result = readEmbed(new URL(link).search);
  assert.deepEqual(result.filters, defaultFilters);
  assert.deepEqual(result.controls, []);
  assert.equal(result.mode, "line");
});

test("malformed and unsupported embed options fall back safely", () => {
  assert.equal(readEmbed("?chart=constructor"), null);
  assert.equal(readEmbed("?chart=unknown"), null);
  assert.equal(readEmbed("?chart=vinLoss&config=broken").mode, "");
  const config = {
    controls: ["filters", "unexpected"],
    state: {
      filters: { from: "invalid" },
      mode: "invalid",
      sort: { field: "loss", direction: "wrong" },
    },
  };
  const result = readEmbed(
    `?chart=vinLoss&config=${encodeURIComponent(JSON.stringify(config))}`,
  );
  assert.equal(result.filters.from, defaultFilters.from);
  assert.deepEqual(result.controls, ["filters"]);
  assert.equal(result.sort, null);
  assert.equal(result.mode, "");
  assert.ok(
    embedSnippet('https://example.test/?x="test"', "<Chart>").includes(
      'title="&lt;Chart&gt;"',
    ),
  );
});

test("RCA aggregates periods and computes change from the preceding available period", () => {
  const rows = [
    { date: "2023-01-01", vin: "A", loss: 50 },
    { date: "2023-03-01", vin: "A", loss: 50 },
    { date: "2024-02-01", vin: "A", loss: 150 },
    { date: "2024-02-01", vin: "B", loss: 900 },
  ];
  assert.deepEqual(periodMetrics(rows, "vin", "A", "loss", "YTD"), [
    { name: "2023", value: 100, change: null },
    { name: "2024", value: 150, change: 50 },
  ]);
  assert.deepEqual(
    periodMetrics(rows, "vin", "A", "count", "QTD").map((row) => [
      row.name,
      row.value,
    ]),
    [
      ["2023 Q1", 2],
      ["2024 Q1", 1],
    ],
  );
  assert.deepEqual(
    periodMetrics(rows, "vin", "A", "loss", "MTD").map((row) => row.name),
    ["2023-01", "2023-03", "2024-02"],
  );
  assert.deepEqual(periodMetrics(rows, "vin", "missing", "loss", "YTD"), []);
});

test("RCA does not invent a percentage when the previous period is zero", () => {
  assert.equal(
    periodMetrics(
      [
        { date: "2023-01-01", loss: 0 },
        { date: "2024-01-01", loss: 10 },
      ],
      null,
      null,
      "loss",
      "YTD",
    )[1].change,
    null,
  );
});

test("local findings respond to lowest prompts and average percentage columns", () => {
  const rows = [
    { name: "A", rate: 20, loss: 10 },
    { name: "B", rate: 60, loss: 30 },
  ];
  const result = chartFindings(
    rows,
    [
      ["name", "Name"],
      ["rate", "Rate", "percent"],
      ["loss", "Loss", "money"],
    ],
    "lowest",
  );
  assert.match(result[0], /40/);
  assert.match(result[0], /Lowest: A/);
  assert.match(result[1], /40/);
  assert.deepEqual(chartFindings([], [["loss", "Loss"]]), []);
});

test("Excel retains numeric precision and never interprets text as a formula", () => {
  const cells = excelCells(
    [{ name: "=1+1", loss: 119.38 }],
    [
      ["name", "VIN"],
      ["loss", "Loss", "money"],
    ],
  );
  assert.equal(cells[1][0].type, String);
  assert.equal(cells[1][0].value, "=1+1");
  assert.equal(cells[1][1].type, Number);
  assert.equal(cells[1][1].value, 119.38);
  assert.equal(cells[1][1].format, '"$"#,##0.00');
});
