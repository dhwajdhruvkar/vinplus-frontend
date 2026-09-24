import React from "react";
import {
  HorizontalChart,
  VerticalChart,
  DonutChart,
  TrendChart,
  colors,
} from "./Charts.jsx";
import { getChartData } from "../data/chartData.js";
import { panels } from "../data/panels.js";
import { summarize, referenceSummary } from "../data/dashboard.js";
import { RecordsTable } from "./RecordsTable.jsx";

// Draws an independent chart for comparison and insight panels.
export function ChartPreview({ id, rows, filtered, onSelect = () => {} }) {
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
  const chartRows =
    data[{ manager: "managers", advisor: "advisors" }[id] || id] || [];
  const summary = filtered ? summarize(rows) : referenceSummary;
  if (id === "salesMix") return <DonutChart rows={rows} filtered={filtered} />;
  if (id === "monthly")
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
  if (config.type === "column")
    return (
      <VerticalChart
        data={chartRows}
        max={max}
        currency={config.currency}
        line={config.line}
        onSelect={onSelect}
        height={290}
      />
    );
  return (
    <HorizontalChart
      data={chartRows}
      max={max}
      series={series}
      height={290}
      labelWidth={config.field === "vin" ? 135 : 90}
      onSelect={onSelect}
    />
  );
}
