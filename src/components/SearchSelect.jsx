import React, { useEffect, useRef, useState, useId } from "react";
import { IconButton } from "./Panel.jsx";

// Provides a searchable local selector with a reset action and keyboard support.
export function SearchSelect({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [draft, setDraft] = useState([]);
  const ref = useRef(null);
  const id = useId();
  const matching = options.filter((option) =>
    option.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    // Closes this selector when another part of the dashboard is clicked.
    function closeOutside(event) {
      if (!ref.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  // Toggles a draft value; Apply commits the selected values together.
  function choose(option) {
    setDraft((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  }

  // Starts a new draft from the current selection.
  function beginSelection() {
    setDraft(Array.isArray(value) ? value : value ? [value] : []);
    setOpen(true);
    setQuery("");
    setActive(0);
  }

  // Commits the draft and closes the options.
  function applySelection() {
    onChange(draft.length ? draft : "");
    setOpen(false);
  }

  // Moves through the options or chooses the highlighted option.
  function handleKey(event) {
    if (event.key === "Escape") setOpen(false);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) beginSelection();
      setActive((current) =>
        Math.max(
          0,
          Math.min(
            matching.length - 1,
            current + (event.key === "ArrowDown" ? 1 : -1),
          ),
        ),
      );
    }
    if (event.key === "Enter" && open && matching[active]) {
      event.preventDefault();
      choose(matching[active]);
    }
  }

  return (
    <div className="select-panel searchable-select" ref={ref}>
      <div className="filter-label">
        <label htmlFor={id}>{label}</label>
        <IconButton
          icon="refresh"
          label={`Reset ${label}`}
          onClick={() => {
            onChange("");
            setDraft([]);
            setOpen(false);
          }}
        />
      </div>
      <input
        id={id}
        role="combobox"
        autoComplete="off"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-autocomplete="list"
        aria-activedescendant={
          open && matching[active] ? `${id}-${active}` : undefined
        }
        value={open ? query : Array.isArray(value) ? value.join(", ") : value}
        placeholder="Select data"
        onFocus={beginSelection}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={handleKey}
      />
      {open && (
        <div className="select-options">
          <ul
            id={`${id}-options`}
            role="listbox"
            aria-label={label}
            aria-multiselectable="true"
          >
            {matching.map((option, index) => (
              <li
                id={`${id}-${index}`}
                key={option}
                role="option"
                aria-selected={draft.includes(option)}
              >
                <button
                  className={active === index ? "active-option" : ""}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(option)}
                >
                  {option}
                  <span>{draft.includes(option) ? "✓" : ""}</span>
                </button>
              </li>
            ))}
            {!matching.length && (
              <li className="empty-options">No matching options</li>
            )}
          </ul>
          <div className="select-options-footer">
            <span>{draft.length} selected</span>
            <button onClick={() => setOpen(false)}>Cancel</button>
            <button className="primary-button" onClick={applySelection}>
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
