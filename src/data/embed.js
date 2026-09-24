import { defaultFilters } from "./dashboard.js";
import { initialInteractions } from "./interactions.js";
import { panels } from "./panels.js";

export const embedControls = [
  ["filters", "Current filters with an applied state"],
  ["title", "Title"],
  ["type", "Change chart type"],
  ["info", "Info"],
  ["sort", "Sort"],
  ["refresh", "Refresh"],
  ["pdf", "PDF export"],
  ["png", "Image export"],
  ["xlsx", "Excel export"],
  ["csv", "CSV export"],
];

// Reads only supported embed settings and ignores malformed links.
export function readEmbed(search) {
  const params = new URLSearchParams(search);
  const id = params.get("chart");
  if (!Object.hasOwn(panels, id) && id !== "records") return null;
  const result = {
    id,
    controls: null,
    filters: { ...defaultFilters },
    interactions: initialInteractions,
    mode: "",
    sort: null,
  };
  try {
    const data = JSON.parse(params.get("config") || "null");
    if (!data || typeof data !== "object") return result;
    result.controls = Array.isArray(data.controls)
      ? data.controls.filter((key) =>
          embedControls.some(([name]) => name === key),
        )
      : null;
    if (result.controls?.includes("filters") && data.state) {
      for (const key of Object.keys(defaultFilters)) {
        const value = data.state.filters?.[key];
        if (
          typeof value === "string" &&
          (!["from", "to"].includes(key) ||
            (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
              !Number.isNaN(Date.parse(value))))
        )
          result.filters[key] = value;
        if (
          ["manager", "advisor", "status", "vin", "ro"].includes(key) &&
          Array.isArray(value) &&
          value.every((item) => typeof item === "string")
        )
          result.filters[key] = value;
      }
      const selections = data.state.interactions?.selections;
      if (Array.isArray(selections)) {
        result.interactions = {
          selections: selections.filter(
            (item) =>
              item &&
              typeof item.id === "string" &&
              typeof item.owner === "string" &&
              typeof item.label === "string" &&
              [
                "dealer",
                "manager",
                "advisor",
                "status",
                "vin",
                "ro",
                "month",
              ].includes(item.field) &&
              typeof item.value === "string" &&
              Number.isInteger(item.depth),
          ),
          levels: {},
          revision: 0,
        };
        for (const [key, level] of Object.entries(
          data.state.interactions?.levels || {},
        ))
          if (
            panels[key] &&
            Number.isInteger(level) &&
            level >= 0 &&
            level <= 2
          )
            result.interactions.levels[key] = level;
      }
    }
    if (
      ["bar", "area", "column", "lollipop", "line"].includes(data.state?.mode)
    )
      result.mode = data.state.mode;
    const sort = data.state?.sort;
    if (
      sort &&
      typeof sort.field === "string" &&
      ["ascending", "descending"].includes(sort.direction)
    )
      result.sort = sort;
  } catch {
    /* Invalid URL settings fall back to the normal chart. */
  }
  return result;
}

// Builds a local chart link; access control remains the responsibility of its host.
export function createEmbedLink(base, id, type, controls, state) {
  const url = new URL(base);
  url.search = "";
  url.hash = "";
  url.searchParams.set("chart", id);
  const savedState = controls.includes("filters")
    ? state
    : { mode: state.mode, sort: state.sort };
  url.searchParams.set(
    "config",
    JSON.stringify({ type, controls, state: savedState }),
  );
  return url.toString();
}

// Escapes attribute text in the copyable iframe snippet.
export function embedSnippet(url, title) {
  const escape = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  return `<iframe src="${escape(url)}" title="${escape(title)}" width="100%" height="500" style="border:0"></iframe>`;
}
