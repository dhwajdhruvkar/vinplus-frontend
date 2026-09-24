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
      if (
        ["manager", "advisor", "status", "vin", "ro"].includes(key) &&
        Array.isArray(saved[key]) &&
        saved[key].every((item) => typeof item === "string")
      )
        filters[key] = saved[key];
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
  downloadFile(
    "shop-supplies-repair-orders.csv",
    "\ufeff" + toCSV(rows),
    "text/csv;charset=utf-8;",
  );
}

// Saves generated text or an image without contacting a backend.
export function downloadFile(name, content, type = "text/plain") {
  const file =
    content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
