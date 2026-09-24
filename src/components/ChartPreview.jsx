import React from "react";
import {
  HorizontalChart,
  VerticalChart,
  DonutChart,
  TrendChart,
  colors,
} from "./Charts.jsx";
import { getChartData } from "../data/chartData.js";
import { panels, sortChartRows } from "../data/panels.js";
import { SeriesChart } from "./SeriesChart.jsx";
import { summarize, referenceSummary } from "../data/dashboard.js";
import { RecordsTable } from "./RecordsTable.jsx";

// Draws an independent chart for comparison and insight panels.
export function ChartPreview({
  id,
  rows,
  filtered,
  onSelect = () => {},
  height = 290,
  mode = "",
  sort = null,
}) {
  if (id === "records")
    return (
      <RecordsTable
        rows={rows}
        compact
        onRowClick={(row) => onSelect(row.ro)}
      />
    );
  const config = panels[id];
  const data = getChartData(rows, filtered);
  const summary = filtered ? summarize(rows) : referenceSummary;
  const chartRows = sortChartRows(
    id === "monthly"
      ? [{ name: "Feb-2024", loss: summary.loss }]
      : data[{ manager: "managers", advisor: "advisors" }[id] || id] || [],
    sort,
  );
  if (id === "salesMix")
    return <DonutChart rows={rows} filtered={filtered} onSelect={onSelect} />;
  if (id === "monthly" && !mode)
    return (
      <TrendChart value={summary.loss} onSelect={() => onSelect("2024-02")} />
    );
  const series = config.series.map(([key, label, color, currency, scale]) => ({
    key,
    label,
    color: colors[color],
    currency: currency ?? config.currency,
    scale: scale ? (filtered ? 10 : scale) : undefined,
  }));
  const max = filtered
    ? Math.max(
        1,
        ...chartRows.flatMap((row) =>
          series.map((item) => (row[item.key] || 0) * (item.scale || 1)),
        ),
      ) * 1.2
    : config.max;
  const type = mode || config.type;
  if (
    ["line", "lollipop", "area"].includes(type) ||
    (type === "column" && !["dealerOrders", "manager"].includes(id))
  )
    return (
      <SeriesChart
        data={chartRows}
        series={series}
        type={type}
        height={height}
        onSelect={onSelect}
      />
    );
  if (type === "column")
    return (
      <VerticalChart
        data={chartRows}
        max={max}
        currency={config.currency}
        line={config.line}
        onSelect={onSelect}
        height={height}
      />
    );
  return (
    <HorizontalChart
      data={chartRows}
      max={max}
      series={series}
      height={height}
      labelWidth={config.field === "vin" ? 135 : 90}
      onSelect={onSelect}
    />
  );
}
