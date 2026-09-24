import React, { useMemo, useState } from "react";
import Icon from "./components/Icon.jsx";
import { DashboardToolbar } from "./components/DashboardToolbar.jsx";
import { SelectionBar } from "./components/SelectionBar.jsx";
import { KpiCards } from "./components/KpiCards.jsx";
import { DashboardCharts } from "./components/DashboardCharts.jsx";
import { RepairOrders } from "./components/RepairOrders.jsx";
import { FilterDrawer } from "./components/FilterDrawer.jsx";
import { DashboardDialog } from "./components/DashboardDialog.jsx";
import { useToast } from "./hooks/useToast.js";
import {
  readPreference,
  savePreference,
  downloadRecords,
} from "./utils/browser.js";
import {
  defaultFilters,
  records,
  referenceSummary,
  filterRecords,
  isFiltered,
  summarize,
} from "./data/dashboard.js";

// Shows the shop supplies dashboard and connects its filters, charts, and dialogs.
export default function App() {
  const [filters, setFilters] = useState({ ...defaultFilters });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [comfortable, setComfortable] = useState(false);
  const [hasSavedFilters, setHasSavedFilters] = useState(() =>
    Boolean(readPreference()),
  );
  const { toast, notify } = useToast();

  const rows = useMemo(() => filterRecords(records, filters), [filters]);
  const filtered = isFiltered(filters);
  // The default totals match the reference; filters use the available sample rows.
  const summary = filtered ? summarize(rows) : referenceSummary;

  // Changes one filter while keeping the other selections.
  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  // Restores the original dashboard selection.
  function resetFilters() {
    setFilters({ ...defaultFilters });
    notify("Dashboard reset to the default selection.");
  }

  // Applies the drawer's draft only when the user chooses Apply.
  function applyFilters(draft) {
    setFilters(draft);
    setIsFilterOpen(false);
  }

  // Saves filters in this browser and reports whether saving succeeded.
  function saveFilters(draft) {
    if (savePreference(draft)) {
      setHasSavedFilters(true);
      notify("Filter preference saved.");
    } else {
      notify("This browser could not save the preference.");
    }
  }

  // Restores a saved selection when one is available.
  function loadFilters() {
    const preference = readPreference();
    if (preference) setFilters(preference);
  }

  // Downloads the rows currently shown by the dashboard filters.
  function exportRecords() {
    downloadRecords(rows);
    notify(`${rows.length} repair orders exported.`);
  }

  // Opens the repair orders associated with a selected chart or date.
  function openRecords(title, field, value) {
    setDialog({ type: "records", title, field, value });
  }

  // Opens the details of one repair order.
  function openRecord(record) {
    setDialog({ type: "record", title: `Repair Order ${record.ro}`, record });
  }

  // Takes the user to the repair-order table from a menu or dialog.
  function reviewRecords() {
    setDialog(null);
    document
      .getElementById("ro-details")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  // Opens the filter drawer, closing any help dialog first.
  function openFilters() {
    setDialog(null);
    setIsFilterOpen(true);
  }

  return (
    <div className={`app ${comfortable ? "comfortable-view" : ""}`}>
      <main className="workspace">
        <DashboardToolbar
          comfortable={comfortable}
          hasSavedFilters={hasSavedFilters}
          onComfortableChange={setComfortable}
          onOpenDialog={setDialog}
          onOpenFilters={openFilters}
          onReset={resetFilters}
          onLoadFilters={loadFilters}
          onExport={exportRecords}
          onReviewRecords={reviewRecords}
        />
        <div className="dashboard-scroll">
          <SelectionBar
            filters={filters}
            onOpenFilters={openFilters}
            onFilterChange={updateFilter}
          />
          <KpiCards
            summary={summary}
            comfortable={comfortable}
            onDrill={(title) => setDialog({ type: "daily", title })}
          />
          <div className="dashboard-grid">
            <DashboardCharts
              rows={rows}
              filtered={filtered}
              summary={summary}
              filters={filters}
              onFilterChange={updateFilter}
              onOpenRecords={openRecords}
              onOpenChart={(title, chart) =>
                setDialog({ type: "chart", title, chart })
              }
            />
            <RepairOrders
              rows={rows}
              filters={filters}
              onFilterChange={updateFilter}
              onOpenRecord={openRecord}
            />
          </div>
        </div>
      </main>
      {isFilterOpen && (
        <FilterDrawer
          filters={filters}
          saved={hasSavedFilters}
          onClose={() => setIsFilterOpen(false)}
          onApply={applyFilters}
          onSave={saveFilters}
          onLoad={readPreference}
        />
      )}
      {dialog && (
        <DashboardDialog
          dialog={dialog}
          rows={rows}
          summary={summary}
          filters={filters}
          onClose={() => setDialog(null)}
          onOpenRecords={openRecords}
          onOpenRecord={openRecord}
          onReviewRecords={reviewRecords}
          onOpenFilters={openFilters}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
