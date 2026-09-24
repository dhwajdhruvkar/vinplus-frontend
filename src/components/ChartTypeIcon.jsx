import React from "react";

export const chartTypes = [
  ["bar", "Bar chart"],
  ["area", "Area chart"],
  ["column", "Column chart"],
  ["lollipop", "Lollipop chart"],
  ["line", "Line chart"],
];

// Draws the small colored chart previews used by the source toolbar.
export function ChartTypeIcon({ type }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      {type === "bar" ? (
        <>
          <path
            d="M3 5h15M3 9h10M3 13h17M3 17h11"
            stroke="#ed8b43"
            strokeWidth="3"
          />
          <path d="M3 3v18M3 9h8M3 17h6" stroke="#69869d" strokeWidth="2" />
        </>
      ) : type === "column" ? (
        <>
          <path d="M5 20V5M13 20V8M21 20V11" stroke="#ed8b43" strokeWidth="3" />
          <path d="M9 20V10M17 20V14" stroke="#69869d" strokeWidth="2" />
        </>
      ) : type === "area" ? (
        <path d="M3 20V9l4 4 4-9 5 7 5-3v12Z" fill="#ed8b43" opacity=".8" />
      ) : type === "lollipop" ? (
        <>
          {[
            [5, 7],
            [12, 11],
            [19, 4],
          ].map(([x, y]) => (
            <g key={x}>
              <path d={`M${x} 21V${y}`} stroke="#ed8b43" />
              <circle cx={x} cy={y} r="2" fill="#ed8b43" />
            </g>
          ))}
        </>
      ) : (
        <>
          <path d="M3 3v18h19" stroke="#69869d" fill="none" />
          <path
            d="m4 17 5-8 5 4 7-9"
            stroke="#ed8b43"
            strokeWidth="1.5"
            fill="none"
          />
          {[
            [4, 17],
            [9, 9],
            [14, 13],
            [21, 4],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="1.6" fill="#69869d" />
          ))}
        </>
      )}
    </svg>
  );
}
