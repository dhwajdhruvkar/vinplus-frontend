import React, { useState } from "react";
import { money, tableColumns, unrecoveredPercent } from "../data/dashboard.js";

const amountColumns = ["expected", "actual", "loss"];

// Formats a table cell and makes repair-order numbers open their details.
function RecordCell({ row, column, onRowClick }) {
  if (column === "ro")
    return <button onClick={() => onRowClick?.(row)}>{row.ro}</button>;
  if (column === "percent") return `${unrecoveredPercent(row).toFixed(2)}%`;
  if (amountColumns.includes(column))
    return money(row[column]).replace("$", "$ ");
  return row[column];
}

// Uses unrounded amounts when sorting percentages, as in the original table.
function sortValue(row, column) {
  if (column === "percent") return row.expected ? row.loss / row.expected : 0;
  return row[column];
}

// Shows sortable repair orders and an empty message when no records match.
export function RecordsTable({ rows, onRowClick, compact = false }) {
  const [sort, setSort] = useState({ key: "", asc: true });
  const sortedRows = [...rows].sort((first, second) => {
    if (!sort.key) return 0;
    const firstValue = sortValue(first, sort.key);
    const secondValue = sortValue(second, sort.key);
    const comparison =
      typeof firstValue === "number"
        ? firstValue - secondValue
        : String(firstValue).localeCompare(String(secondValue), undefined, {
            numeric: true,
          });
    return sort.asc ? comparison : -comparison;
  });

  // Starts a new column in ascending order or reverses the current column.
  function sortBy(key) {
    setSort((current) => ({
      key,
      asc: current.key === key ? !current.asc : true,
    }));
  }

  // Describes the active sort direction to assistive technology.
  function sortDirection(key) {
    if (sort.key !== key) return "none";
    return sort.asc ? "ascending" : "descending";
  }

  return (
    <div className={`table-scroll ${compact ? "compact-table" : ""}`}>
      <table>
        <thead>
          <tr>
            {tableColumns.map(([key, label]) => (
              <th key={key} aria-sort={sortDirection(key)}>
                <button onClick={() => sortBy(key)}>
                  {label}
                  {sort.key === key && <span>{sort.asc ? " ↑" : " ↓"}</span>}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={row.ro}>
              {tableColumns.map(([key]) => {
                const isNumeric =
                  amountColumns.includes(key) || key === "percent";
                return (
                  <td
                    key={key}
                    className={`${key === "ro" ? "ro-number" : ""} ${isNumeric ? "numeric" : ""}`}
                  >
                    <RecordCell
                      row={row}
                      column={key}
                      onRowClick={onRowClick}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <div className="empty-state">
          No repair orders match the current selection.
        </div>
      )}
    </div>
  );
}
