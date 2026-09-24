import React, { useState } from "react";
import { ChartPreview } from "./ChartPreview.jsx";
import { FilterDrawer } from "./FilterDrawer.jsx";
import {
  defaultFilters,
  filterRecords,
  isFiltered,
  dateLabel,
} from "../data/dashboard.js";
import { panels } from "../data/panels.js";

// Adds independent chart copies so filter changes can be compared side by side.
export function QuickCompare({ id, rows, filtered }) {
  const [copies, setCopies] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [list, setList] = useState(false);

  // Gives each new copy a stable identity so other comparison filters survive removal.
  function addComparison() {
    setCopies((current) => [...current, nextId]);
    setNextId((current) => current + 1);
  }

  return (
    <div className="quick-compare">
      <div className="compare-actions">
        <button className="primary-button" onClick={addComparison}>
          + Add comparison
        </button>
        <label>
          <input
            type="checkbox"
            checked={list}
            onChange={(event) => setList(event.target.checked)}
          />
          List view
        </label>
      </div>
      <div className={`comparison-grid ${list ? "comparison-list" : ""}`}>
        <ComparisonCard
          id={id}
          rows={rows}
          filtered={filtered}
          label="ORIGINAL"
        />
        {copies.map((number) => (
          <ComparisonCard
            key={number}
            id={id}
            rows={rows}
            filtered={filtered}
            label={`COMPARE ${number}`}
            onRemove={() =>
              setCopies((current) =>
                current.filter((value) => value !== number),
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

// Owns one comparison's filters without changing the dashboard or other copies.
function ComparisonCard({ id, rows, filtered, label, onRemove }) {
  const [filters, setFilters] = useState({ ...defaultFilters });
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(null);
  const selectedRows = filterRecords(rows, filters).filter(
    (row) =>
      !category ||
      (category.field === "month"
        ? row.date.slice(0, 7)
        : row[category.field]) === category.value,
  );

  // Applies a clicked category only inside this comparison card.
  function selectCategory(value) {
    const field = id === "records" ? "ro" : panels[id]?.field;
    if (field) setCategory({ field, value });
  }

  return (
    <section className="comparison-card" aria-label={label}>
      <header>
        <strong>{label}</strong>
        {onRemove && (
          <button aria-label={`Remove ${label}`} onClick={onRemove}>
            ×
          </button>
        )}
      </header>
      <ChartPreview
        id={id}
        rows={selectedRows}
        filtered={filtered || isFiltered(filters) || Boolean(category)}
        onSelect={selectCategory}
      />
      <footer>
        <span>Current selection</span>
        <button onClick={() => setOpen(true)}>Filters</button>
        <button
          onClick={() => {
            setFilters({ ...defaultFilters });
            setCategory(null);
          }}
        >
          Reset
        </button>
        {category && <span className="compare-chip">{category.value}</span>}
        <p>
          {dateLabel(filters.from)} – {dateLabel(filters.to)}
        </p>
        {Object.entries(filters)
          .filter(
            ([key, value]) => !["from", "to", "query"].includes(key) && value,
          )
          .map(([key, value]) => (
            <span className="compare-chip" key={key}>
              {Array.isArray(value) ? value.join(", ") : value}
            </span>
          ))}
      </footer>
      {open && (
        <FilterDrawer
          filters={filters}
          onClose={() => setOpen(false)}
          onApply={(draft) => {
            setFilters(draft);
            setOpen(false);
          }}
        />
      )}
    </section>
  );
}
