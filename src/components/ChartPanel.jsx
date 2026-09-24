import React, { useContext, useRef, useState } from "react";
import { DashboardContext } from "./DashboardContext.jsx";
import { useFullscreenFocus } from "../hooks/useFullscreenFocus.js";
import { Panel } from "./Panel.jsx";
import { ChartTools } from "./ChartTools.jsx";
import { ChartDialog } from "./ChartDialog.jsx";
import { sortChartRows } from "../data/panels.js";
import { detailCSV } from "../data/detailData.js";
import { downloadFile } from "../utils/browser.js";
import {
  exportPanelImage,
  exportPanelPDF,
  exportPanelExcel,
  panelCanvas,
} from "../utils/chartExport.js";

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
  defaultType = "bar",
}) {
  const context = useContext(DashboardContext);
  const [sort, setSort] = useState(context.embed?.sort || null);
  const [mode, setMode] = useState(context.embed?.mode || "");
  const [fullscreen, setFullscreen] = useState(false);
  const [dialog, setDialog] = useState("");
  const [message, setMessage] = useState("");
  const [version, setVersion] = useState(0);
  const [noteImage, setNoteImage] = useState("");
  const ref = useRef(null);
  useFullscreenFocus(ref, fullscreen);
  const displayedRows = sortChartRows(rows, sort);
  const options = context.embed?.controls;
  const snapshot = {
    filters: context.filters,
    interactions: {
      selections: context.interactions.selections,
      levels: context.interactions.levels,
    },
    mode,
    sort,
  };

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
      else if (action === "pdf")
        await exportPanelPDF(ref.current, id, displayedRows, columns, title);
      else if (action === "xlsx")
        await exportPanelExcel(id, displayedRows, columns);
      else if (action === "notes") {
        setNoteImage(
          (await panelCanvas(ref.current, displayedRows, columns)).toDataURL(
            "image/png",
          ),
        );
        setDialog(action);
      } else setDialog(action);
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
        className={`${className} ${options && !options.includes("title") ? "hide-panel-title" : ""}`}
        crumbs={crumbs}
        active={level}
        actions={
          <ChartTools
            title={title}
            type={mode || defaultType}
            sort={sort}
            options={options}
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
          {children({ sort, mode, fullscreen })}
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
          rows={displayedRows}
          columns={columns}
          description={description}
          comparisonRows={comparisonRows}
          comparisonFiltered={comparisonFiltered}
          snapshot={snapshot}
          noteImage={noteImage}
          level={level}
          onClose={() => setDialog("")}
        />
      )}
    </div>
  );
}
