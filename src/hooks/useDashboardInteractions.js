import { useReducer } from "react";
import {
  initialInteractions,
  interactionReducer,
} from "../data/interactions.js";

// Connects chart drill-downs, selection chips, and reset actions.
export function useDashboardInteractions() {
  const [state, dispatch] = useReducer(interactionReducer, initialInteractions);

  // Selects a chart category and optionally moves that panel to its next table.
  function select(
    owner,
    label,
    field,
    value,
    level,
    depth = level || 0,
    displayValue = value,
  ) {
    dispatch({
      type: "select",
      level,
      selection: {
        id: `${owner}-${depth}`,
        owner,
        label,
        field,
        value,
        depth,
        displayValue,
      },
    });
  }

  // Clears one chart and leaves selections from other charts in place.
  function resetPanel(owner) {
    dispatch({ type: "reset-panel", owner });
  }

  // Returns one step up in a chart and clears that step's filter.
  function up(owner) {
    dispatch({ type: "up", owner });
  }

  // Removes a chip and the drill steps that depend on it.
  function remove(id) {
    dispatch({ type: "remove", id });
  }

  // Restores all chart panels and clears their selections.
  function reset() {
    dispatch({ type: "reset" });
  }

  return { ...state, select, resetPanel, up, remove, reset };
}
