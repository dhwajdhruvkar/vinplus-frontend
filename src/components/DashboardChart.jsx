import React from "react";
import { ChartPanel } from "./ChartPanel.jsx";
import { DetailTable } from "./DetailTable.jsx";
import { SeriesChart } from "./SeriesChart.jsx";
import {
  colors,
  VerticalChart,
  HorizontalChart,
  DonutChart,
  TrendChart,
} from "./Charts.jsx";
import { salesMix } from "../data/salesMix.js";
import { panels, sortChartRows } from "../data/panels.js";
import {
  aggregateDetails,
  detailColumns,
  enrichRecord,
} from "../data/detailData.js";

// Connects one chart to its own drill table and dashboard selection behavior.
export function DashboardChart({
  id,
  data,
  rows,
  filtered,
  summary,
  interactions,
}) {
  const config = panels[id];
  const level = interactions.levels[id] || 0;
  const title =
    id === "monthly" && level
      ? "Monthly Unrecovered Shop Supplies"
      : config.title;
  const series = config.series.map(([key, label, color, currency, scale]) => ({
    key,
    label,
    color: colors[color],
    currency: currency ?? config.currency,
    scale: scale ? (filtered ? 10 : scale) : undefined,
  }));
  const chartRows =
    id === "monthly" ? [{ name: "Feb-2024", loss: summary.loss }] : data || [];
  const tableRows =
    id === "manager"
      ? aggregateDetails(rows, level === 2 ? "status" : "manager")
      : rows.map(enrichRecord);
  const columns =
    detailColumns[id === "manager" && level === 2 ? "status" : id];
  const chartColumns = [
    ["name", config.selection || "Category"],
    ...series.map((item) => [
      item.key,
      item.label,
      item.currency ? "money" : undefined,
    ]),
  ];

  // Opens the next level for detail charts, or filters a count chart in place.
  function selectCategory(value) {
    if (id === "monthly")
      interactions.select(id, "Monthly", "month", "2024-02", 1, 1, "Feb-2024");
    else
      interactions.select(
        id,
        config.selection,
        config.field,
        value,
        config.crumbs ? 1 : undefined,
      );
  }

  // Applies only the detail columns that filter or drill in the reference.
  function selectCell(key, row) {
    if (id === "manager" && key === "manager" && level === 1)
      interactions.select(id, "Manager Details", "manager", row.manager, 2);
    else if (id === "manager" && key === "status")
      interactions.select(id, "Status", "status", row.status, 2, 3);
    else if (
      ["advisor", "monthly", "vinLoss", "recurring"].includes(id) &&
      key === "ro"
    )
      interactions.select(
        id,
        id === "recurring" ? "Detail" : "RO Details",
        "ro",
        row.ro,
        level,
        level + 1,
      );
  }

  // Draws the original chart or the user's chosen alternative with the same data.
  function renderChart({ sort, mode, fullscreen }) {
    if (level)
      return (
        <DetailTable
          rows={tableRows}
          columns={columns}
          onSelect={selectCell}
          label={`${title} details`}
        />
      );
    if (id === "salesMix")
      return <DonutChart rows={rows} filtered={filtered} />;
    if (id === "monthly" && !mode)
      return <TrendChart value={summary.loss} onSelect={selectCategory} />;
    const sorted = sortChartRows(chartRows, sort);
    const type = mode || config.type;
    const height = fullscreen
      ? Math.max(300, window.innerHeight - 150)
      : id === "manager"
        ? 247
        : id === "advisor"
          ? Math.max(292, sorted.length * 49)
          : id === "vinOrders"
            ? 241
            : id === "dealerLoss"
              ? 190
              : config.crumbs
                ? 207
                : 225;
    const max = filtered
      ? Math.max(
          1,
          ...sorted.flatMap((row) =>
            series.map((item) => (row[item.key] || 0) * (item.scale || 1)),
          ),
        ) * 1.15
      : config.max || Math.max(1, summary.loss * 1.15);
    if (
      ["area", "line", "lollipop"].includes(type) ||
      (type === "column" && !["dealerOrders", "manager"].includes(id))
    )
      return (
        <SeriesChart
          data={sorted}
          series={series}
          type={type}
          height={height}
          onSelect={selectCategory}
        />
      );
    if (type === "column")
      return (
        <VerticalChart
          data={sorted}
          currency={config.currency}
          line={config.line}
          height={height}
          max={max}
          onSelect={selectCategory}
        />
      );
    return (
      <div
        className={
          id === "advisor" ? "advisor-chart-scroll" : "bar-chart-scroll"
        }
      >
        <HorizontalChart
          data={sorted}
          series={series}
          height={height}
          max={max || 1}
          labelWidth={
            config.field === "vin" ? 145 : id === "advisor" ? 116 : 82
          }
          ticks={id === "advisor" ? 9 : 5}
          insideLabels={id === "vinLoss"}
          onSelect={selectCategory}
        />
      </div>
    );
  }

  return (
    <ChartPanel
      id={id}
      title={title}
      defaultType={config.type === "trend" ? "line" : config.type}
      crumbs={config.crumbs}
      level={level}
      className={id === "manager" ? "manager-panel" : ""}
      comparisonRows={rows}
      comparisonFiltered={filtered}
      onUp={() => interactions.up(id)}
      onReset={() => interactions.resetPanel(id)}
      rows={
        level
          ? tableRows
          : id === "salesMix"
            ? salesMix(rows, filtered)
            : chartRows
      }
      columns={
        level
          ? columns
          : id === "salesMix"
            ? [
                ["name", "Category"],
                ["value", "Sales", "money"],
              ]
            : chartColumns
      }
      fields={
        config.sortFields || config.series.map(([key, label]) => [key, label])
      }
      allowTypes={config.type !== "donut"}
      description={
        config.crumbs
          ? `Select a category to view ${config.crumbs[1]}. Use the up arrow to return and clear that selection.`
          : id === "salesMix"
            ? "Select a sales category to highlight its slice. The dashboard selection stays the same."
            : "Select a category to filter the dashboard to its repair orders."
      }
    >
      {renderChart}
    </ChartPanel>
  );
}
