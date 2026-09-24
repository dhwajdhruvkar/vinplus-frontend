import React from "react";
import Icon from "./Icon.jsx";
import { Logo } from "./Logo.jsx";
import { Modal } from "./Modal.jsx";
import { money, compactMoney, dateLabel } from "../data/dashboard.js";

// Chooses the content for the currently open dashboard dialog.
export function DashboardDialog({
  dialog,
  summary,
  filters,
  onClose,
  onReviewRecords,
  onOpenFilters,
}) {
  let content;
  switch (dialog.type) {
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
    <Modal title={dialog.title} onClose={onClose}>
      {content}
    </Modal>
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
        Select chart marks to filter the dashboard or open inline detail tables.
        Use the up arrow to return to a chart. Select table headings to sort and
        RO numbers to filter the dashboard.
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
