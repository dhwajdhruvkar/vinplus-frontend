import React from "react";
import { IconButton, Panel } from "./Panel.jsx";
import { RecordsTable } from "./RecordsTable.jsx";
import { records } from "../data/dashboard.js";

// Shows repair-order filters and the table for the current selection.
export function RepairOrders({ rows, filters, onFilterChange, onOpenRecord }) {
  // Selecting all or unchecking a status removes the status filter.
  function changeStatus(status, checked) {
    const value = checked && status !== "Select all" ? status : "";
    onFilterChange("status", value);
  }

  return (
    <div className="detail-row" id="ro-details">
      <div className="detail-filters">
        <div className="select-panel">
          <div className="filter-label">
            <label htmlFor="ro-select">Repair Order No</label>
            <IconButton
              icon="refresh"
              label="Reset repair order"
              onClick={() => onFilterChange("ro", "")}
            />
          </div>
          <select
            id="ro-select"
            value={filters.ro}
            onChange={(e) => onFilterChange("ro", e.target.value)}
          >
            <option value="">Select data</option>
            {records.map((record) => (
              <option key={record.ro}>{record.ro}</option>
            ))}
          </select>
        </div>
        <div className="select-panel status-panel">
          <div className="filter-label">
            <label>Status</label>
            <IconButton
              icon="refresh"
              label="Reset status"
              onClick={() => onFilterChange("status", "")}
            />
          </div>
          {["Select all", "Fully Recovered", "Partially Recovered"].map(
            (status) => (
              <label className="checkbox-label" key={status}>
                <input
                  type="checkbox"
                  checked={
                    status === "Select all"
                      ? !filters.status
                      : filters.status === status
                  }
                  onChange={(event) =>
                    changeStatus(status, event.target.checked)
                  }
                />
                {status}
              </label>
            ),
          )}
        </div>
      </div>
      <Panel title="RO Details" className="records-panel">
        <RecordsTable rows={rows} onRowClick={onOpenRecord} />
      </Panel>
    </div>
  );
}
