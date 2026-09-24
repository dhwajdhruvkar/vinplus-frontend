import React, { useRef, useState } from "react";
import {
  comparisonCanvas,
  saveCanvasImage,
  saveCanvasPDF,
} from "../utils/chartExport.js";
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
export function QuickCompare({ id, rows, filtered, snapshot }) {
  const [copies, setCopies] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [grid, setGrid] = useState(3);
  const [exportOpen, setExportOpen] = useState(false);
  const [message, setMessage] = useState("");
  const ref = useRef(null);

  // Gives each new copy a stable identity so other comparison filters survive removal.
  function addComparison() {
    setCopies((current) => [...current, nextId]);
    setNextId((current) => current + 1);
  }

  // Exports every visible comparison, preserving each card's independent selection.
  async function exportComparisons(format) {
    setExportOpen(false);
    setMessage("");
    try {
      const canvas = await comparisonCanvas(ref.current);
      if (format === "pdf")
        await saveCanvasPDF(canvas, `${id}-comparison`, "Quick compare");
      else await saveCanvasImage(canvas, `${id}-comparison`);
    } catch {
      setMessage("The comparison export could not be created.");
    }
  }

  return (
    <div className="quick-compare">
      <div className="compare-actions">
        <div className="compare-export">
          <button
            onClick={() => setExportOpen((current) => !current)}
            aria-expanded={exportOpen}
          >
            Export
          </button>
          {exportOpen && (
            <div className="compare-export-menu">
              <button onClick={() => exportComparisons("png")}>Image</button>
              <button onClick={() => exportComparisons("pdf")}>PDF</button>
            </div>
          )}
        </div>
        <button className="primary-button" onClick={addComparison}>
          + Add comparison
        </button>
        <select
          aria-label="Comparison grid"
          value={grid}
          onChange={(event) => setGrid(Number(event.target.value))}
        >
          {[1, 2, 3].map((value) => (
            <option key={value} value={value}>
              {value} Grid
            </option>
          ))}
        </select>
      </div>
      <p role="status">{message}</p>
      <div
        ref={ref}
        className="comparison-grid"
        style={{ "--compare-columns": grid }}
      >
        <ComparisonCard
          id={id}
          rows={rows}
          filtered={filtered}
          label="ORIGINAL"
          snapshot={snapshot}
        />
        {copies.map((number) => (
          <ComparisonCard
            key={number}
            id={id}
            rows={rows}
            filtered={filtered}
            label={`COMPARE ${number}`}
            snapshot={snapshot}
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
function ComparisonCard({ id, rows, filtered, label, onRemove, snapshot }) {
  const [filters, setFilters] = useState(
    snapshot?.filters || { ...defaultFilters },
  );
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
        height={390}
        mode={snapshot?.mode}
        sort={snapshot?.sort}
      />
      <footer>
        <span>Current selection</span>
        <button onClick={() => setOpen(true)}>Filters</button>
        <button
          onClick={() => {
            setFilters(snapshot?.filters || { ...defaultFilters });
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
