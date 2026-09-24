import React, { useEffect, useRef, useState } from "react";
import { IconButton } from "./Panel.jsx";
import Icon from "./Icon.jsx";
import { ChartTypeIcon, chartTypes } from "./ChartTypeIcon.jsx";

const moreActions = [
  ["table", "Table view", "grid"],
  ["compare", "Quick compare", "compare"],
  ["notes", "Notes", "note"],
  ["share", "Share", "share"],
  ["embed", "Embed", "globe"],
];
const exportActions = [
  ["pdf", "PDF"],
  ["png", "Image"],
  ["xlsx", "Excel"],
  ["csv", "CSV"],
];

// Provides the source chart's type, sort, refresh, insights, info, and More menus.
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
  type = "bar",
  sort,
  options = null,
}) {
  const [menu, setMenu] = useState("");
  const [field, setField] = useState("");
  const [direction, setDirection] = useState("");
  const ref = useRef(null);
  const menuRef = useRef(null);
  const trigger = useRef(null);

  // Restricts controls only when an embed explicitly customizes its toolbar.
  function enabled(name) {
    return !options || options.includes(name);
  }

  useEffect(() => {
    // Closes menus outside the toolbar and returns focus after Escape.
    function dismiss(event) {
      if (event.type === "keydown" && event.key === "Escape") {
        setMenu("");
        trigger.current?.focus();
      } else if (
        event.type === "pointerdown" &&
        !ref.current?.contains(event.target)
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

  useEffect(() => {
    if (!menuRef.current) return;
    const bounds = ref.current.getBoundingClientRect();
    const above =
      bounds.bottom + menuRef.current.offsetHeight + 12 > window.innerHeight &&
      bounds.top > menuRef.current.offsetHeight;
    menuRef.current.style.bottom = above ? "31px" : "auto";
    menuRef.current.style.top = above ? "auto" : "31px";
  }, [menu]);

  // Starts a fresh sort draft so Cancel never changes the applied sort.
  function toggle(name, event) {
    trigger.current = event.currentTarget;
    if (name === "sort") {
      setField(sort?.field || "");
      setDirection(sort?.direction || "");
    }
    setMenu((current) => (current === name ? "" : name));
  }

  // Runs one toolbar action, then dismisses the open popover.
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
        <>
          {onMode && enabled("type") && (
            <button
              className="icon-button chart-type-trigger"
              aria-label={`Change chart type ${title}`}
              title="Change chart type"
              aria-expanded={menu === "type"}
              onClick={(event) => toggle("type", event)}
            >
              <ChartTypeIcon type={type} />
            </button>
          )}
          {!!fields.length && enabled("sort") && (
            <IconButton
              icon="sort"
              label={`Sort ${title}`}
              title="Sort"
              aria-expanded={menu === "sort"}
              onClick={(event) => toggle("sort", event)}
            />
          )}
        </>
      )}
      {enabled("refresh") && (
        <IconButton
          icon="refresh"
          label={`Refresh ${title}`}
          title="Refresh"
          onClick={() => run(onReset)}
        />
      )}
      {!options && (
        <IconButton
          icon="insight"
          label={`Insights ${title}`}
          title="Insights"
          aria-expanded={menu === "insights"}
          onClick={(event) => toggle("insights", event)}
        />
      )}
      {enabled("info") && (
        <IconButton
          icon="info"
          label={`Information ${title}`}
          title="Info"
          aria-expanded={menu === "info"}
          onClick={(event) => toggle("info", event)}
        />
      )}
      {(!options || exportActions.some(([key]) => enabled(key))) && (
        <IconButton
          icon="dots"
          label={`More ${title}`}
          title="More"
          aria-expanded={["more", "export"].includes(menu)}
          onClick={(event) => toggle("more", event)}
        />
      )}
      {menu && (
        <div
          ref={menuRef}
          className={`chart-menu ${menu === "export" ? "more" : menu}-menu`}
        >
          {menu === "info" && <p>Data display limit : 35000</p>}
          {menu === "type" && (
            <>
              <div className="chart-menu-heading">
                Change chart type
                <button
                  aria-label="Close chart type"
                  onClick={() => setMenu("")}
                >
                  <Icon name="close" size={13} />
                </button>
              </div>
              <div className="chart-type-options">
                {chartTypes.map(([value, label]) => (
                  <button
                    key={value}
                    title={label}
                    aria-label={label}
                    aria-pressed={type === value}
                    onClick={() => run(() => onMode(value))}
                  >
                    <ChartTypeIcon type={value} />
                  </button>
                ))}
              </div>
            </>
          )}
          {menu === "sort" && (
            <>
              <div className="chart-menu-heading">Sort</div>
              <div className="sort-menu-body">
                <select
                  aria-label="Select field to sort"
                  value={field}
                  onChange={(event) => setField(event.target.value)}
                >
                  <option value="" disabled>
                    Select field to sort
                  </option>
                  {fields.map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                {[
                  ["ascending", "Min To Max"],
                  ["descending", "Max To Min"],
                ].map(([value, label]) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name={`sort-${title}`}
                      checked={direction === value}
                      onChange={() => setDirection(value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
              <div className="menu-footer">
                <button onClick={() => setMenu("")}>Cancel</button>
                <button
                  className="primary-button"
                  disabled={!field || !direction}
                  onClick={() => run(() => onSort({ field, direction }))}
                >
                  Apply
                </button>
              </div>
            </>
          )}
          {menu === "insights" && (
            <>
              <button onClick={() => run(() => onAction("insights"))}>
                <Icon name="note" />
                AI Insights
              </button>
              <button onClick={() => run(() => onAction("rca"))}>
                <Icon name="insight" />
                Guided RCA
              </button>
            </>
          )}
          {["more", "export"].includes(menu) && (
            <>
              {!options && (
                <>
                  <button onClick={() => run(onFullscreen)}>
                    <Icon name="expand" />
                    {fullscreen ? "Exit full screen" : "Full screen"}
                  </button>
                  {moreActions.map(([action, label, icon]) => (
                    <button
                      key={action}
                      onClick={() => run(() => onAction(action))}
                    >
                      <Icon name={icon} />
                      {label}
                    </button>
                  ))}
                </>
              )}
              <div className="export-submenu">
                <button
                  aria-expanded={menu === "export"}
                  onClick={() =>
                    setMenu((current) =>
                      current === "export" ? "more" : "export",
                    )
                  }
                >
                  <Icon name="download" />
                  Export
                  <Icon name="chevron" className="submenu-arrow" />
                </button>
                {menu === "export" && (
                  <div className="export-options">
                    {exportActions
                      .filter(([key]) => enabled(key))
                      .map(([action, label]) => (
                        <button
                          key={action}
                          onClick={() => run(() => onAction(action))}
                        >
                          {label}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
