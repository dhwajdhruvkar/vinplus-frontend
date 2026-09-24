import React from "react";
import { DashboardChart } from "./DashboardChart.jsx";
import { SearchSelect } from "./SearchSelect.jsx";
import { advisors } from "../data/dashboard.js";
import { getChartData } from "../data/chartData.js";
import { panels } from "../data/panels.js";

// Arranges all dashboard charts and shares the current frontend selection.
export function DashboardCharts({
  rows,
  filtered,
  summary,
  filters,
  onFilterChange,
  interactions,
  embedded,
}) {
  const data = getChartData(rows, filtered);
  const chartData = { ...data, manager: data.managers, advisor: data.advisors };

  // Gives every panel the same filtered records and independent drill state.
  function chart(id) {
    return (
      <DashboardChart
        key={`${id}-${interactions.revision}`}
        id={id}
        data={chartData[id]}
        rows={rows}
        filtered={filtered}
        summary={summary}
        interactions={interactions}
      />
    );
  }

  if (embedded && panels[embedded])
    return <div className="embedded-chart">{chart(embedded)}</div>;
  return (
    <>
      <div className="three-column dealer-row">
        {chart("dealerOrders")}
        {chart("dealerLoss")}
        {chart("salesMix")}
      </div>
      {chart("manager")}
      <div className="two-column advisor-row">
        {chart("advisor")}
        <div className="advisor-right">
          <SearchSelect
            label="Service Advisor"
            options={advisors}
            value={filters.advisor}
            onChange={(value) => onFilterChange("advisor", value)}
          />
          {chart("monthly")}
        </div>
      </div>
      <div className="three-column vin-row">
        {chart("vinOrders")}
        {chart("vinLoss")}
        {chart("recurring")}
      </div>
    </>
  );
}
