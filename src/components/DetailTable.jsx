import React, { useState } from "react";
import { detailValue } from "../data/detailData.js";

// Shows the active chart's detail columns with sorting and cell selection.
export function DetailTable({
  rows,
  columns,
  onSelect,
  label = "Chart details",
}) {
  const [sort, setSort] = useState({ index: -1, ascending: true });
  const [selected, setSelected] = useState("");
  const sorted = [...rows].sort((first, second) => {
    if (sort.index < 0) return 0;
    const key = columns[sort.index][0];
    const a = first[key];
    const b = second[key];
    const difference =
      typeof a === "number"
        ? a - b
        : String(a ?? "").localeCompare(String(b ?? ""), undefined, {
            numeric: true,
          });
    return sort.ascending ? difference : -difference;
  });

  // Reverses the selected column or starts sorting a different column.
  function changeSort(index) {
    setSort((current) => ({
      index,
      ascending: current.index !== index || !current.ascending,
    }));
  }

  // Highlights the cell and sends chart-specific fields to the dashboard filter.
  function selectCell(row, key, identity) {
    setSelected(identity);
    onSelect?.(key, row);
  }

  return (
    <div className="detail-table-scroll">
      <table className="detail-table" aria-label={label}>
        <thead>
          <tr>
            {columns.map(([key, title], index) => (
              <th
                key={`${key}-${index}`}
                aria-sort={
                  sort.index === index
                    ? sort.ascending
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <button onClick={() => changeSort(index)}>
                  {title}
                  {sort.index === index && (sort.ascending ? " ↑" : " ↓")}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, rowIndex) => (
            <tr
              key={row.ro || row.manager || row.status || row.name || rowIndex}
            >
              {columns.map(([key, , format], index) => {
                const identity = `${row.ro || row.manager || row.status || rowIndex}-${index}`;
                return (
                  <td
                    key={`${key}-${index}`}
                    className={`${format || typeof row[key] === "number" ? "numeric" : ""} ${selected === identity ? "selected-cell" : ""}`}
                  >
                    <button onClick={() => selectCell(row, key, identity)}>
                      {detailValue(row[key], format)}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <p className="empty-state">No records match the current selection.</p>
      )}
    </div>
  );
}
