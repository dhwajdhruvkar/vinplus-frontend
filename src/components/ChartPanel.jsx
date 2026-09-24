import React, { useRef, useState } from "react";
import { useFullscreenFocus } from "../hooks/useFullscreenFocus.js";
import { Panel } from "./Panel.jsx";
import { DetailTable } from "./DetailTable.jsx";
import { ChartTools } from "./ChartTools.jsx";
import { ChartDialog } from "./ChartDialog.jsx";
import { sortChartRows } from "../data/panels.js";
import { detailCSV } from "../data/detailData.js";
import { downloadFile } from "../utils/browser.js";
import { exportPanelImage, printPanel } from "../utils/chartExport.js";

// Keeps chart display options local while the dashboard owns data selections.
export function ChartPanel({
  id,
  title,
  crumbs,
  level = 0,
  onUp,
  onReset,
  children,
  className = "",
  rows,
  columns,
  fields = [],
  allowTypes = true,
  description,
  comparisonRows = [],
  comparisonFiltered = false,
}) {
  const [sort, setSort] = useState(null);
  const [mode, setMode] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [dialog, setDialog] = useState("");
  const [message, setMessage] = useState("");
  const [version, setVersion] = useState(0);
  const ref = useRef(null);
  useFullscreenFocus(ref, fullscreen);
  const displayedRows = sortChartRows(rows, sort);

  // Restores this panel's original chart type, sorting, and drill selections.
  function resetPanel() {
    setSort(null);
    setMode("");
    setMessage("");
    setVersion((current) => current + 1);
    onReset();
  }

  // Exports this panel or opens its local comparison, embed, or insights view.
  async function runAction(action) {
    setMessage("");
    try {
      if (action === "csv")
        downloadFile(
          `${id}.csv`,
          "\ufeff" + detailCSV(displayedRows, columns),
          "text/csv;charset=utf-8;",
        );
      else if (action === "png")
        await exportPanelImage(ref.current, id, displayedRows, columns);
      else if (action === "print") printPanel(ref.current);
      else if (action === "table")
        setMode((current) => (current === "table" ? "" : "table"));
      else setDialog(action);
    } catch {
      setMessage("The export could not be created. Try CSV instead.");
    }
  }

  return (
    <div
      className={`panel-slot ${fullscreen ? "panel-fullscreen" : ""}`}
      ref={ref}
      data-panel={id}
    >
      <Panel
        title={title}
        id={id}
        className={className}
        crumbs={crumbs}
        active={level}
        actions={
          <ChartTools
            title={title}
            level={level}
            fields={fields}
            onUp={onUp}
            onReset={resetPanel}
            onSort={setSort}
            onMode={allowTypes ? setMode : undefined}
            onAction={runAction}
            fullscreen={fullscreen}
            onFullscreen={() => setFullscreen((current) => !current)}
          />
        }
      >
        <div className="panel-content" key={version}>
          {mode === "table" ? (
            <DetailTable
              rows={displayedRows}
              columns={columns}
              label={`${title} table view`}
            />
          ) : (
            children({ sort, mode, fullscreen })
          )}
        </div>
        {message && (
          <p className="export-message" role="status">
            {message}
          </p>
        )}
      </Panel>
      {dialog && (
        <ChartDialog
          kind={dialog}
          id={id}
          title={title}
          rows={rows}
          columns={columns}
          description={description}
          comparisonRows={comparisonRows}
          comparisonFiltered={comparisonFiltered}
          onClose={() => setDialog("")}
        />
      )}
    </div>
  );
}
