import React, { useMemo, useState } from "react";
import { DashboardContext } from "./components/DashboardContext.jsx";
import { readEmbed } from "./data/embed.js";
import Icon from "./components/Icon.jsx";
import { ConversationWidget } from "./conversations/ConversationWidget.jsx";
import { DashboardToolbar } from "./components/DashboardToolbar.jsx";
import { SelectionBar } from "./components/SelectionBar.jsx";
import { KpiCards } from "./components/KpiCards.jsx";
import { DashboardCharts } from "./components/DashboardCharts.jsx";
import { RepairOrders } from "./components/RepairOrders.jsx";
import { FilterDrawer } from "./components/FilterDrawer.jsx";
import { DashboardDialog } from "./components/DashboardDialog.jsx";
import { useDashboardInteractions } from "./hooks/useDashboardInteractions.js";
import { matchSelections, hasRecordSelection } from "./data/interactions.js";
import { panels } from "./data/panels.js";
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
  const [embed] = useState(() => readEmbed(window.location.search));
  const [filters, setFilters] = useState(
    embed?.filters || { ...defaultFilters },
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [comfortable, setComfortable] = useState(false);
  const [hasSavedFilters, setHasSavedFilters] = useState(() =>
    Boolean(readPreference()),
  );
  const { toast, notify } = useToast();

  const interactions = useDashboardInteractions(embed?.interactions);
  const embedded = embed?.id;
  const context = { filters, interactions, embed };
  const rows = useMemo(
    () =>
      matchSelections(filterRecords(records, filters), interactions.selections),
    [filters, interactions.selections],
  );
  const filtered =
    isFiltered(filters) || hasRecordSelection(interactions.selections);
  // The default totals match the reference; filters use the available sample rows.
  const summary = filtered ? summarize(rows) : referenceSummary;

  // Changes one filter while keeping the other selections.
  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  // Restores the original dashboard selection.
  function resetFilters() {
    setFilters({ ...defaultFilters });
    interactions.reset();
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

  if (embedded === "records") {
    return (
      <DashboardContext.Provider value={context}>
        <div className="embedded-chart embedded-records">
          <RepairOrders
            rows={rows}
            filters={filters}
            onFilterChange={updateFilter}
            onSelectRecord={(record) =>
              interactions.select("records", "RO Details", "ro", record.ro)
            }
            onResetSelection={() => interactions.resetPanel("records")}
            resetKey={interactions.revision}
          />
        </div>
      </DashboardContext.Provider>
    );
  }

  if (embedded && panels[embedded]) {
    return (
      <DashboardContext.Provider value={context}>
        <DashboardCharts
          embedded={embedded}
          rows={rows}
          filtered={filtered}
          summary={summary}
          filters={filters}
          onFilterChange={updateFilter}
          interactions={interactions}
        />
      </DashboardContext.Provider>
    );
  }

  return (
    <DashboardContext.Provider value={context}>
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
              selections={interactions.selections}
              onClearSelection={interactions.remove}
              filters={filters}
              onOpenFilters={openFilters}
              onFilterChange={updateFilter}
            />
            <KpiCards
              summary={summary}
              comfortable={comfortable}
              rows={rows}
              filtered={filtered}
              onMonthSelect={() =>
                interactions.select(
                  "kpi",
                  "Mon - Close date",
                  "month",
                  "2024-02",
                  undefined,
                  0,
                  "Feb",
                )
              }
            />
            <div className="dashboard-grid">
              <DashboardCharts
                rows={rows}
                filtered={filtered}
                summary={summary}
                filters={filters}
                onFilterChange={updateFilter}
                interactions={interactions}
              />
              <RepairOrders
                rows={rows}
                filters={filters}
                onFilterChange={updateFilter}
                onSelectRecord={(record) =>
                  interactions.select("records", "RO Details", "ro", record.ro)
                }
                onResetSelection={() => interactions.resetPanel("records")}
                resetKey={interactions.revision}
              />
            </div>
          </div>
        </main>
        <ConversationWidget />
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
    </DashboardContext.Provider>
  );
}
