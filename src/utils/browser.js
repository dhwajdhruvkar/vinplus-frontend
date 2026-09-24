import { defaultFilters, toCSV } from "../data/dashboard.js";

const PREFERENCE_KEY = "shop-supplies-view-v1";

// Reads saved filters, filling missing or invalid fields with their defaults.
export function readPreference() {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFERENCE_KEY));
    if (!saved || typeof saved !== "object") return null;

    const filters = { ...defaultFilters };
    for (const key of Object.keys(defaultFilters)) {
      if (typeof saved[key] === "string") filters[key] = saved[key];
    }
    return filters;
  } catch {
    return null;
  }
}

// Stores a filter selection and returns false if browser storage is unavailable.
export function savePreference(filters) {
  try {
    localStorage.setItem(PREFERENCE_KEY, JSON.stringify(filters));
    return true;
  } catch {
    return false;
  }
}

// Downloads a CSV file and releases its temporary browser URL afterwards.
export function downloadRecords(rows) {
  const file = new Blob(["\ufeff" + toCSV(rows)], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "shop-supplies-repair-orders.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
