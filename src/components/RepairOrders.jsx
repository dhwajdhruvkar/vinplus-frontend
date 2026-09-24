import React, { useState } from "react";
import { IconButton } from "./Panel.jsx";
import { ChartPanel } from "./ChartPanel.jsx";
import { SearchSelect } from "./SearchSelect.jsx";
import { RecordsTable } from "./RecordsTable.jsx";
import { records, tableColumns } from "../data/dashboard.js";

// Shows searchable order/status filters and the cross-filtering repair-order table.
export function RepairOrders({
  rows,
  filters,
  onFilterChange,
  onSelectRecord,
  onResetSelection,
  resetKey,
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [statusQuery, setStatusQuery] = useState("");
  const selected = Array.isArray(filters.status)
    ? filters.status
    : filters.status
      ? [filters.status]
      : [];

  // Combines both checked statuses as an unrestricted status selection.
  function changeStatus(status, checked) {
    if (status === "Select all") {
      onFilterChange("status", "");
      return;
    }
    const next = checked
      ? [...selected, status]
      : selected.filter((item) => item !== status);
    onFilterChange("status", next.length === 2 || !next.length ? "" : next);
  }

  return (
    <div className="detail-row" id="ro-details">
      <div className="detail-filters">
        <SearchSelect
          label="Repair Order No"
          options={records.map((record) => record.ro)}
          value={filters.ro}
          onChange={(value) => onFilterChange("ro", value)}
        />
        <div className="select-panel status-panel">
          <div className="filter-label">
            <label>Status</label>
            <div>
              <IconButton
                icon="search"
                label="Search status"
                onClick={() => setSearchOpen((current) => !current)}
              />
              <IconButton
                icon="refresh"
                label="Reset status"
                onClick={() => {
                  onFilterChange("status", "");
                  setStatusQuery("");
                }}
              />
            </div>
          </div>
          {searchOpen && (
            <input
              className="status-search"
              aria-label="Find status"
              placeholder="Search"
              value={statusQuery}
              onChange={(event) => setStatusQuery(event.target.value)}
            />
          )}
          {["Select all", "Fully Recovered", "Partially Recovered"]
            .filter((status) =>
              status.toLowerCase().includes(statusQuery.toLowerCase()),
            )
            .map((status) => (
              <label className="checkbox-label" key={status}>
                <input
                  type="checkbox"
                  checked={
                    status === "Select all"
                      ? !selected.length
                      : selected.includes(status)
                  }
                  onChange={(event) =>
                    changeStatus(status, event.target.checked)
                  }
                />
                {status}
              </label>
            ))}
        </div>
      </div>
      <ChartPanel
        key={resetKey}
        id="records"
        title="RO Details"
        className="records-panel"
        allowTypes={false}
        comparisonRows={rows}
        comparisonFiltered={true}
        rows={rows}
        columns={tableColumns.map(([key, label]) => [
          key,
          label,
          key === "percent"
            ? "percent"
            : ["actual", "expected", "loss"].includes(key)
              ? "money"
              : undefined,
        ])}
        onReset={onResetSelection}
        description="Select an RO number to filter the dashboard. Select column headings to sort the table."
      >
        {() => <RecordsTable rows={rows} onRowClick={onSelectRecord} />}
      </ChartPanel>
    </div>
  );
}
