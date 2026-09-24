import React from "react";
import Icon from "./Icon.jsx";
import { Logo } from "./Logo.jsx";
import { Modal } from "./Modal.jsx";
import { RecordsTable } from "./RecordsTable.jsx";
import { colors, HorizontalChart } from "./Charts.jsx";
import {
  money,
  compactMoney,
  dateLabel,
  summarize,
  dailyMetrics,
} from "../data/dashboard.js";

// Chooses the content for the currently open dashboard dialog.
export function DashboardDialog({
  dialog,
  rows,
  summary,
  filters,
  onClose,
  onOpenRecords,
  onOpenRecord,
  onReviewRecords,
  onOpenFilters,
}) {
  let content;
  switch (dialog.type) {
    case "records": {
      const matchingRows = dialog.field
        ? rows.filter((row) => row[dialog.field] === dialog.value)
        : rows;
      content = (
        <>
          <div className="modal-summary">
            <span>{matchingRows.length} repair orders</span>
            <strong>Unrecovered: {money(summarize(matchingRows).loss)}</strong>
          </div>
          <RecordsTable rows={matchingRows} compact onRowClick={onOpenRecord} />
        </>
      );
      break;
    }
    case "chart":
      content = <div className="expanded-chart">{dialog.chart}</div>;
      break;
    case "daily":
      content = (
        <DailyMetric
          rows={rows}
          title={dialog.title}
          filters={filters}
          onOpenRecords={onOpenRecords}
        />
      );
      break;
    case "record":
      content = <RecordDetails record={dialog.record} />;
      break;
    case "insights":
      content = (
        <Insights summary={summary} onReviewRecords={onReviewRecords} />
      );
      break;
    case "about":
      content = <AboutDashboard filters={filters} />;
      break;
    case "guide":
      content = <DashboardHelp onOpenFilters={onOpenFilters} />;
      break;
    default:
      return null;
  }
  return (
    <Modal
      title={dialog.title}
      onClose={onClose}
      wide={["records", "chart"].includes(dialog.type)}
    >
      {content}
    </Modal>
  );
}

// Breaks a selected summary metric into daily values for the available records.
function DailyMetric({ rows, title, filters, onOpenRecords }) {
  const data = dailyMetrics(rows, title);
  const isCurrency =
    !title.includes("%") && title !== "Shop Supplies Partial Recovery";
  const maximum = Math.max(1, ...data.map((row) => row.metric)) * 1.2;
  return (
    <>
      <p className="muted">
        {dateLabel(filters.from)} – {dateLabel(filters.to)} · Available repair
        orders
      </p>
      <HorizontalChart
        data={data}
        series={[
          {
            key: "metric",
            label: title,
            color: colors.red,
            currency: isCurrency,
          },
        ]}
        max={maximum}
        height={380}
        onSelect={(name) =>
          onOpenRecords(`${dateLabel(name)} · RO Details`, "date", name)
        }
      />
    </>
  );
}

// Lists the vehicle, staff, and recovery amounts for one repair order.
function RecordDetails({ record }) {
  const fields = [
    ["RO Number", record.ro],
    ["Dealer Code", record.dealer || "—"],
    ["Make / Model", `${record.make} ${record.model}`],
    ["VIN", record.vin],
    ["Manager", record.manager],
    ["Service Advisor", record.advisor],
    ["Closed Date", dateLabel(record.date)],
    ["Expected Shop Supplies", money(record.expected)],
    ["Actual Shop Supplies", money(record.actual)],
    ["Unrecovered Shop Supplies", money(record.loss)],
    ["Status", record.status],
  ];
  return (
    <dl className="record-details">
      {fields.map(([label, value]) => (
        <React.Fragment key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

// Summarizes recovery performance and links to the repair-order table.
function Insights({ summary, onReviewRecords }) {
  return (
    <div className="insights">
      <div className="insight-heading">
        <Icon name="sparkle" size={28} />
        <h3>Shop supplies at a glance</h3>
      </div>
      <p>
        <strong>
          {summary.partial} of {summary.total}
        </strong>{" "}
        repair orders require review, representing{" "}
        <strong>{summary.rate.toFixed(2)}%</strong> of the current selection.
      </p>
      <p>
        Actual shop supplies recovery is{" "}
        <strong>{compactMoney(summary.actual)}</strong> against{" "}
        <strong>{compactMoney(summary.expected)}</strong> expected.
      </p>
      <div className="insight-total">
        <span>Unrecovered shop supplies</span>
        <strong>{money(summary.loss)}</strong>
      </div>
      <button className="primary-button" onClick={onReviewRecords}>
        Review repair orders
      </button>
    </div>
  );
}

// Explains the dashboard's purpose and the selected reporting period.
function AboutDashboard({ filters }) {
  return (
    <div className="about-content">
      <Logo />
      <h3>Shop Supplies Analysiss</h3>
      <p>
        Service sales, recovery performance, and shop supplies shortfalls across
        dealers, managers, service advisors, and vehicles.
      </p>
      <p className="muted">
        Current period: {dateLabel(filters.from)} – {dateLabel(filters.to)}
      </p>
    </div>
  );
}

// Explains how to filter, inspect, sort, and export the dashboard records.
function DashboardHelp({ onOpenFilters }) {
  return (
    <div className="help-content">
      <p>
        Use <strong>Filters</strong> to choose a date range, manager, service
        advisor, VIN, or recovery status.
      </p>
      <p>
        Select a bar or a chart breadcrumb to review the matching repair orders.
        Click a table heading to sort, or an RO number to see its details.
      </p>
      <p>
        <strong>More Options</strong> lets you export the current repair orders.
        Save filter preferences to return to the same selection later.
      </p>
      <button className="primary-button" onClick={onOpenFilters}>
        Open filters
      </button>
    </div>
  );
}
