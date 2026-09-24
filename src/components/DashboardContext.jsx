import { createContext } from "react";
import { defaultFilters } from "../data/dashboard.js";
import { initialInteractions } from "../data/interactions.js";

// Shares the current selection with chart utilities without duplicating page state.
export const DashboardContext = createContext({
  filters: defaultFilters,
  interactions: initialInteractions,
  embed: null,
});
