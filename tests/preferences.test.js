import test from "node:test";
import assert from "node:assert/strict";
import { readPreference, savePreference } from "../src/utils/browser.js";
import { defaultFilters } from "../src/data/dashboard.js";

// Supplies isolated browser storage and restores the original global after a test.
function useStorage(context, storage) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });
  context.after(() => {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else delete globalThis.localStorage;
  });
}

test("saved filters round-trip through the existing browser preference key", (context) => {
  const values = new Map();
  useStorage(context, {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  });
  const filters = {
    ...defaultFilters,
    manager: "Abbas-Haider",
    from: "2024-02-02",
  };
  assert.equal(savePreference(filters), true);
  assert.ok(values.has("shop-supplies-view-v1"));
  assert.deepEqual(readPreference(), filters);
});

test("older or malformed preference fields use defaults without adding unknown fields", (context) => {
  useStorage(context, {
    getItem: () =>
      JSON.stringify({ manager: "Abbas-Haider", from: 42, unknown: "ignored" }),
  });
  assert.deepEqual(readPreference(), {
    ...defaultFilters,
    manager: "Abbas-Haider",
  });
});

test("broken or unavailable browser storage does not prevent using the dashboard", (context) => {
  const storage = {
    getItem: () => "invalid JSON",
    setItem: () => {
      throw new Error("Storage unavailable");
    },
  };
  useStorage(context, storage);
  assert.equal(readPreference(), null);
  assert.equal(savePreference(defaultFilters), false);
  storage.getItem = () => {
    throw new Error("Storage unavailable");
  };
  assert.equal(readPreference(), null);
});
