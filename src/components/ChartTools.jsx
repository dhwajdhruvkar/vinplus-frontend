import React, { useEffect, useRef, useState } from "react";
import { IconButton } from "./Panel.jsx";

// Provides each chart's sort, display, reset, fullscreen, and export controls.
export function ChartTools({
  title,
  level,
  fields,
  onUp,
  onReset,
  onSort,
  onMode,
  onAction,
  fullscreen,
  onFullscreen,
}) {
  const [menu, setMenu] = useState("");
  const [field, setField] = useState(fields[0]?.[0] || "name");
  const [direction, setDirection] = useState("ascending");
  const ref = useRef(null);

  useEffect(() => {
    // Dismisses chart menus when clicking elsewhere or pressing Escape.
    function dismiss(event) {
      if (
        event.type === "keydown"
          ? event.key === "Escape"
          : !ref.current?.contains(event.target)
      )
        setMenu("");
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", dismiss);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", dismiss);
    };
  }, []);

  // Opens one menu at a time, or closes the menu already shown.
  function toggle(name) {
    setMenu((current) => (current === name ? "" : name));
  }

  // Runs an action and closes its menu.
  function run(action) {
    setMenu("");
    action();
  }

  return (
    <div className="chart-tools" ref={ref}>
      {fullscreen && (
        <IconButton
          icon="collapse"
          label={`Exit full screen ${title}`}
          onClick={onFullscreen}
        />
      )}
      {level > 0 ? (
        <IconButton icon="up" label={`Drill up ${title}`} onClick={onUp} />
      ) : (
        onMode && (
          <>
            <IconButton
              icon="bars"
              label={`Change chart type ${title}`}
              aria-expanded={menu === "type"}
              onClick={() => toggle("type")}
            />
            <IconButton
              icon="sort"
              label={`Sort ${title}`}
              aria-expanded={menu === "sort"}
              onClick={() => toggle("sort")}
            />
          </>
        )
      )}
      <IconButton
        icon="refresh"
        label={`Reset ${title}`}
        onClick={() => run(onReset)}
      />
      <IconButton
        icon="insight"
        label={`Insights ${title}`}
        aria-expanded={menu === "insights"}
        onClick={() => toggle("insights")}
      />
      <IconButton
        icon="info"
        label={`Information ${title}`}
        aria-expanded={menu === "info"}
        onClick={() => toggle("info")}
      />
      <IconButton
        icon="dots"
        label={`More ${title}`}
        aria-expanded={menu === "more" || menu === "export"}
        onClick={() => toggle("more")}
      />
      {menu === "info" && (
        <div className="chart-menu">
          <p>
            Select marks to inspect data. Reset clears this panel's choices.
          </p>
        </div>
      )}
      {menu === "insights" && (
        <div className="chart-menu">
          <button onClick={() => run(() => onAction("insights"))}>
            AI Insights
          </button>
          <button onClick={() => run(() => onAction("rca"))}>Guided RCA</button>
        </div>
      )}
      {menu === "type" && (
        <div className="chart-menu">
          <strong>Change chart type</strong>
          {[
            ["column", "Column chart"],
            ["bar", "Bar chart"],
            ["area", "Area chart"],
          ].map(([value, label]) => (
            <button key={value} onClick={() => run(() => onMode(value))}>
              {label}
            </button>
          ))}
        </div>
      )}
      {menu === "sort" && (
        <div className="chart-menu sort-menu">
          <strong>Sort</strong>
          <select
            aria-label="Select field to sort"
            value={field}
            onChange={(event) => setField(event.target.value)}
          >
            {fields.map(([key, label]) => (
              <option value={key} key={key}>
                {label}
              </option>
            ))}
          </select>
          <label>
            <input
              type="radio"
              name={`sort-${title}`}
              checked={direction === "ascending"}
              onChange={() => setDirection("ascending")}
            />
            Min To Max
          </label>
          <label>
            <input
              type="radio"
              name={`sort-${title}`}
              checked={direction === "descending"}
              onChange={() => setDirection("descending")}
            />
            Max To Min
          </label>
          <div className="menu-footer">
            <button onClick={() => setMenu("")}>Cancel</button>
            <button
              className="primary-button"
              onClick={() => run(() => onSort({ field, direction }))}
            >
              Apply
            </button>
          </div>
        </div>
      )}
      {menu === "more" && (
        <div className="chart-menu">
          <button onClick={() => run(onFullscreen)}>
            {fullscreen ? "Exit full screen" : "Full screen"}
          </button>
          <button onClick={() => run(() => onAction("table"))}>
            Table view
          </button>
          <button onClick={() => run(() => onAction("notes"))}>Notes</button>
          <button onClick={() => run(() => onAction("share"))}>Share</button>
          <button onClick={() => run(() => onAction("compare"))}>
            Quick compare
          </button>
          <button onClick={() => run(() => onAction("embed"))}>Embed</button>
          <button onClick={() => setMenu("export")}>Export →</button>
        </div>
      )}
      {menu === "export" && (
        <div className="chart-menu">
          <button onClick={() => setMenu("more")}>← Export</button>
          <button onClick={() => run(() => onAction("csv"))}>CSV</button>
          <button onClick={() => run(() => onAction("png"))}>PNG image</button>
          <button onClick={() => run(() => onAction("print"))}>
            PDF / Print
          </button>
        </div>
      )}
    </div>
  );
}
