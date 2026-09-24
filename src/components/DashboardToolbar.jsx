import React, { useEffect, useState } from "react";
import Icon from "./Icon.jsx";
import { IconButton } from "./Panel.jsx";

// Shows the page title and actions for filters, insights, view settings, and export.
export function DashboardToolbar({
  comfortable,
  hasSavedFilters,
  onComfortableChange,
  onOpenDialog,
  onOpenFilters,
  onReset,
  onLoadFilters,
  onExport,
  onReviewRecords,
}) {
  const [menu, setMenu] = useState("");

  useEffect(() => {
    if (!menu) return;

    // Closes a menu when the user clicks outside the toolbar's dropdowns.
    function closeOutside(event) {
      if (!event.target.closest(".menu-anchor")) setMenu("");
    }
    // Allows keyboard users to dismiss the open menu.
    function closeOnEscape(event) {
      if (event.key === "Escape") setMenu("");
    }
    document.addEventListener("click", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("click", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menu]);

  // Runs a dropdown action and closes the menu it came from.
  function runMenuAction(action) {
    action();
    setMenu("");
  }

  return (
    <div className="dashboard-toolbar">
      <div className="dashboard-title">
        <h1>Shop Supplies Analysiss</h1>
        <IconButton
          icon="info"
          label="About this dashboard"
          onClick={() =>
            onOpenDialog({ type: "about", title: "Shop Supplies Analysiss" })
          }
        />
      </div>
      <div className="toolbar-actions">
        <button
          className="toolbar-button"
          onClick={() =>
            onOpenDialog({ type: "insights", title: "Dashboard insights" })
          }
        >
          <Icon name="insight" />
          Insights
        </button>
        <button className="toolbar-button" onClick={onOpenFilters}>
          <Icon name="filter" size={14} />
          Filters
        </button>
        <button className="toolbar-button" onClick={onReset}>
          <Icon name="refresh" size={14} />
          Reset
        </button>
        <div className="menu-anchor">
          <button
            className="toolbar-button"
            aria-expanded={menu === "view"}
            onClick={() => setMenu(menu === "view" ? "" : "view")}
          >
            <Icon name="pin" size={14} />
            View preference
          </button>
          {menu === "view" && (
            <div className="dropdown-menu">
              <label>
                <input
                  type="checkbox"
                  checked={comfortable}
                  onChange={(event) =>
                    onComfortableChange(event.target.checked)
                  }
                />
                Larger summary cards
              </label>
              <button
                disabled={!hasSavedFilters}
                onClick={() => runMenuAction(onLoadFilters)}
              >
                Load saved filters
              </button>
            </div>
          )}
        </div>
        <div className="menu-anchor">
          <button
            className="toolbar-button"
            aria-expanded={menu === "more"}
            onClick={() => setMenu(menu === "more" ? "" : "more")}
          >
            <Icon name="dots" size={14} />
            More Options
          </button>
          {menu === "more" && (
            <div className="dropdown-menu">
              <button onClick={() => runMenuAction(onExport)}>
                <Icon name="download" />
                Export repair orders (CSV)
              </button>
              <button onClick={() => runMenuAction(onReviewRecords)}>
                View RO Details
              </button>
              <button
                onClick={() =>
                  runMenuAction(() =>
                    onOpenDialog({ type: "guide", title: "Dashboard help" }),
                  )
                }
              >
                Dashboard help
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
