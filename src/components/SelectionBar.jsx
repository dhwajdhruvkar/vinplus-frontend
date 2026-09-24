import React from "react";
import Icon from "./Icon.jsx";
import { IconButton } from "./Panel.jsx";
import { dateLabel } from "../data/dashboard.js";

// Shows the active dates and lets the user clear individual filters.
export function SelectionBar({
  filters,
  onOpenFilters,
  onFilterChange,
  selections = [],
  onClearSelection,
}) {
  return (
    <section className="selection-bar" aria-label="Current selection">
      <div className="selection-label">
        Current selection
        <IconButton
          icon="filter"
          label="Edit current selection"
          onClick={onOpenFilters}
        />
      </div>
      {selections.map((item) => (
        <button
          className="selection-chip extra-chip"
          key={item.id}
          onClick={() => onClearSelection(item.id)}
          title={`Clear ${item.label}`}
        >
          <span>
            {item.label}
            <strong>{item.displayValue}</strong>
          </span>
          <Icon name="close" size={12} />
        </button>
      ))}
      {[
        ["Closed Date From", filters.from],
        ["Closed Date To", filters.to],
      ].map(([label, value]) => (
        <button
          className="selection-chip date-chip"
          key={label}
          onClick={onOpenFilters}
        >
          <Icon name="calendar" size={13} />
          <span>
            {label}
            <strong>{dateLabel(value)}</strong>
          </span>
        </button>
      ))}
      {[
        ["manager", "Manager"],
        ["advisor", "Service Advisor"],
        ["status", "Status"],
        ["vin", "VIN Number"],
        ["ro", "Repair Order No"],
        ["query", "Search"],
      ]
        .filter(([key]) => filters[key])
        .map(([key, label]) => (
          <button
            className="selection-chip extra-chip"
            key={key}
            onClick={() => onFilterChange(key, "")}
            title={`Clear ${label}`}
          >
            <span>
              {label}
              <strong>
                {Array.isArray(filters[key])
                  ? filters[key].join(", ")
                  : filters[key]}
              </strong>
            </span>
            <Icon name="close" size={12} />
          </button>
        ))}
    </section>
  );
}
