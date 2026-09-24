import React, { useState } from "react";
import { SearchSelect } from "./SearchSelect.jsx";
import Icon from "./Icon.jsx";
import { IconButton } from "./Panel.jsx";
import { useDialogFocus } from "../hooks/useDialogFocus.js";
import { defaultFilters, managers, advisors, vins } from "../data/dashboard.js";

// Lets the user edit a draft selection, then apply it or save it for later.
export function FilterDrawer({
  filters,
  onClose,
  onApply,
  onSave,
  saved,
  onLoad,
}) {
  const [draft, setDraft] = useState(filters);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const ref = useDialogFocus(onClose);

  // Changes the drawer's draft without changing the dashboard yet.
  function change(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  // Validates the dates before either applying or saving the draft.
  function submitDraft(action) {
    if (draft.from && draft.to && draft.from > draft.to) {
      setError("Start date must be on or before end date.");
      return;
    }
    setError("");
    action(draft);
  }
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        className="filter-drawer"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
      >
        <header>
          <h2 id="filter-title">
            <Icon name="filter" />
            Filters
          </h2>
          {onLoad && (
            <select
              aria-label="Set Preference"
              value=""
              onChange={() => {
                const value = onLoad();
                if (value) setDraft(value);
              }}
            >
              <option value="">Set Preference</option>
              <option value="saved" disabled={!saved}>
                Saved preference
              </option>
            </select>
          )}
          <IconButton icon="close" label="Close filters" onClick={onClose} />
        </header>
        <div className="filter-body">
          <div className="filter-search">
            <input
              placeholder="Search filter"
              aria-label="Search filter"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Icon name="search" size={13} />
          </div>
          {"Closed Date".toLowerCase().includes(search.toLowerCase()) && (
            <div className="filter-field">
              <label>Closed Date</label>
              <div className="date-range">
                <input
                  aria-label="Start date"
                  type="date"
                  value={draft.from}
                  onChange={(e) => change("from", e.target.value)}
                  onInput={(e) => change("from", e.currentTarget.value)}
                />
                <span>~</span>
                <input
                  aria-label="End date"
                  type="date"
                  value={draft.to}
                  onChange={(e) => change("to", e.target.value)}
                  onInput={(e) => change("to", e.currentTarget.value)}
                />
              </div>
            </div>
          )}
          {[
            ["manager", "Manager", managers],
            ["advisor", "Service Advisor", advisors],
            ["vin", "VIN Number", vins],
            ["status", "Status", ["Fully Recovered", "Partially Recovered"]],
          ]
            .filter(([, label]) =>
              label.toLowerCase().includes(search.toLowerCase()),
            )
            .map(([key, label, options]) => (
              <div className="filter-field" key={key}>
                <SearchSelect
                  label={label}
                  options={options}
                  value={draft[key]}
                  onChange={(value) => change(key, value)}
                />
              </div>
            ))}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <footer>
          <button
            className="text-button"
            onClick={() => {
              setDraft({ ...defaultFilters });
              setError("");
            }}
          >
            Reset Filters
          </button>
          {onSave && (
            <button
              className="primary-button"
              onClick={() => submitDraft(onSave)}
            >
              Save Preferences
            </button>
          )}
          <button
            className="primary-button"
            onClick={() => submitDraft(onApply)}
          >
            Apply
          </button>
        </footer>
      </aside>
    </div>
  );
}
