import { enrichRecord } from "./detailData.js";

// Keeps the original sales mix until a filter switches to the available sample rows.
export function salesMix(rows, filtered) {
  const totals = filtered
    ? rows.map(enrichRecord).reduce(
        (sum, row) => ({
          misc: sum.misc + row.misc,
          labor: sum.labor + row.labor,
          parts: sum.parts + row.parts,
          actual: sum.actual + row.actual,
        }),
        { misc: 0, labor: 0, parts: 0, actual: 0 },
      )
    : {
        misc: 91670,
        labor: 291810,
        parts: 218850,
        actual: 8379.69,
      };
  return [
    { name: "Misc Sales", value: totals.misc, color: "#b689e1" },
    { name: "Labor Sales", value: totals.labor, color: "#9bbbec" },
    { name: "Part Sales", value: totals.parts, color: "#f6d986" },
    { name: "Shop Supplies", value: totals.actual, color: "#89bc8b" },
  ];
}
