import React from "react";
import { Panel } from "./Panel.jsx";
import {
  colors,
  VerticalChart,
  HorizontalChart,
  DonutChart,
  TrendChart,
} from "./Charts.jsx";
import { advisors } from "../data/dashboard.js";
import { getChartData, chartMaximum } from "../data/chartData.js";

// Wraps a chart in a titled panel with an option to open a larger view.
function ChartPanel({ title, children, onOpenChart, ...props }) {
  return (
    <div className="panel-slot">
      <Panel
        {...props}
        title={title}
        onExpand={() => onOpenChart(title, children)}
      >
        {children}
      </Panel>
    </div>
  );
}

// Displays the dealer, manager, advisor, and vehicle charts for the selection.
export function DashboardCharts({
  rows,
  filtered,
  summary,
  filters,
  onFilterChange,
  onOpenRecords,
  onOpenChart,
}) {
  const data = getChartData(rows, filtered);

  // Keeps the original axis scale until the user applies a filter.
  function maximum(rows, key, referenceMaximum) {
    return filtered ? chartMaximum(rows, key) : referenceMaximum;
  }

  return (
    <>
      <div className="three-column dealer-row">
        <ChartPanel
          title="Partial Recovery Repair Orders by Dealer"
          id="dealer-orders"
          onOpenChart={onOpenChart}
        >
          <VerticalChart
            data={data.dealerOrders}
            max={maximum(data.dealerOrders, "expected", 600)}
            onSelect={(name) =>
              onOpenRecords(`${name} · Repair Orders`, "dealer", name)
            }
          />
        </ChartPanel>
        <ChartPanel
          title="Unrecovered Shop Supplies by Dealer"
          crumbs={["Unrecovered SS", "Detail"]}
          onDrill={() => onOpenRecords("Unrecovered Shop Supplies by Dealer")}
          onOpenChart={onOpenChart}
        >
          <HorizontalChart
            data={data.dealerLoss}
            height={190}
            labelWidth={82}
            max={maximum(data.dealerLoss, "loss", 25000)}
            onSelect={(name) =>
              onOpenRecords(
                `${name} · Unrecovered Shop Supplies`,
                "dealer",
                name,
              )
            }
          />
        </ChartPanel>
        <ChartPanel
          title="Unrecovered Shop Supplies Sales Metrics Breakdown"
          onOpenChart={onOpenChart}
        >
          {filtered ? (
            <VerticalChart
              data={[
                {
                  name: "Selected repair orders",
                  expected: summary.expected,
                  actual: summary.actual,
                },
              ]}
              currency
              max={Math.max(1, summary.expected * 1.25)}
              onSelect={() => onOpenRecords("Selected repair orders")}
            />
          ) : (
            <DonutChart
              onSelect={(name) => onOpenRecords(`${name} · RO Details`)}
            />
          )}
        </ChartPanel>
      </div>
      <ChartPanel
        title="Manager Performance Analysis"
        className="manager-panel"
        crumbs={["Manager Name", "Manager Details", "Status Detail"]}
        onDrill={() => onOpenRecords("Manager Performance Analysis")}
        onOpenChart={onOpenChart}
      >
        <VerticalChart
          data={data.managers}
          currency
          line
          max={maximum(data.managers, "expected", 7500)}
          height={247}
          onSelect={(name) =>
            onOpenRecords(`${name} · Manager Details`, "manager", name)
          }
        />
      </ChartPanel>
      <div className="two-column advisor-row">
        <ChartPanel
          title="Service Advisor Performance"
          crumbs={["Service Advisor", "RO Details"]}
          onDrill={() => onOpenRecords("Service Advisor · RO Details")}
          onOpenChart={onOpenChart}
        >
          <div className="advisor-chart-scroll">
            <HorizontalChart
              data={data.advisors}
              height={Math.max(292, data.advisors.length * 49)}
              labelWidth={116}
              max={maximum(data.advisors, "loss", 5400)}
              ticks={9}
              scroll
              series={[
                {
                  key: "count",
                  color: colors.yellow,
                  scale: filtered ? 10 : 60,
                  label: "Repair orders",
                },
                {
                  key: "loss",
                  color: colors.red,
                  currency: true,
                  label: "Unrecovered shop supplies",
                },
              ]}
              onSelect={(name) =>
                onOpenRecords(`${name} · RO Details`, "advisor", name)
              }
            />
          </div>
        </ChartPanel>
        <div className="advisor-right">
          <div className="select-panel">
            <label htmlFor="advisor-select">Service Advisor</label>
            <select
              id="advisor-select"
              value={filters.advisor}
              onChange={(event) =>
                onFilterChange("advisor", event.target.value)
              }
            >
              <option value="">Select data</option>
              {advisors.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </div>
          <ChartPanel
            title="Monthly Unrecovered Shop Supplies Trend"
            crumbs={["Monthly", "RO Details"]}
            onDrill={() => onOpenRecords("Monthly · RO Details")}
            onOpenChart={onOpenChart}
          >
            <TrendChart
              value={summary.loss}
              onSelect={() => onOpenRecords("February 2024 · RO Details")}
            />
          </ChartPanel>
        </div>
      </div>
      <div className="three-column vin-row">
        <ChartPanel
          title="Partial Recovery Repair Orders by VIN"
          onOpenChart={onOpenChart}
        >
          <HorizontalChart
            data={data.vinOrders}
            max={maximum(data.vinOrders, "expected", 2.5)}
            height={241}
            scroll
            series={[
              { key: "expected", color: colors.green, label: "Total records" },
              { key: "actual", color: colors.red, label: "Partial recovery" },
            ]}
            onSelect={(name) => onOpenRecords("VIN · RO Details", "vin", name)}
          />
        </ChartPanel>
        <ChartPanel
          title="Unrecovered Shop Supplies by VIN"
          crumbs={["Unrecovered S S", "Details"]}
          onDrill={() => onOpenRecords("Unrecovered Shop Supplies by VIN")}
          onOpenChart={onOpenChart}
        >
          <HorizontalChart
            insideLabels
            data={data.vinLoss}
            max={maximum(data.vinLoss, "loss", 125)}
            height={207}
            scroll
            onSelect={(name) =>
              onOpenRecords("VIN · Unrecovered Shop Supplies", "vin", name)
            }
          />
        </ChartPanel>
        <ChartPanel
          title="Recurring Shop Supplies Shortfall by Vehicle"
          crumbs={["VIN", "Detail"]}
          onDrill={() =>
            onOpenRecords("Recurring Shop Supplies Shortfall by Vehicle")
          }
          onOpenChart={onOpenChart}
        >
          <HorizontalChart
            data={data.recurring}
            max={maximum(data.recurring, "expected", 150)}
            height={207}
            scroll
            series={[
              {
                key: "expected",
                color: colors.green,
                currency: true,
                label: "Expected supplies",
              },
              {
                key: "count",
                color: colors.yellow,
                scale: 60,
                label: "Recurring exceptions",
              },
            ]}
            onSelect={(name) =>
              onOpenRecords("Recurring Vehicle · Details", "vin", name)
            }
          />
        </ChartPanel>
      </div>
    </>
  );
}
