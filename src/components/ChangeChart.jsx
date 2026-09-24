import React from "react";
import { compactMoney } from "../data/dashboard.js";

// Shows period totals as bars and percentage changes on a separate right axis.
export function ChangeChart({ data, label, currency, onSelect }) {
  const width = 620,
    height = 430,
    left = 60,
    right = 60,
    top = 30,
    bottom = 50;
  const plotWidth = width - left - right,
    plotHeight = height - top - bottom;
  const maximum = Math.max(1, ...data.map((row) => row.value)) * 1.15;
  const changes = data.filter((row) => row.change !== null);
  const changeMin = Math.min(0, ...changes.map((row) => row.change));
  const changeMax = Math.max(1, ...changes.map((row) => row.change));
  const step = plotWidth / Math.max(1, data.length);

  // Converts a percentage into a height on the right-hand scale.
  function changeY(value) {
    return (
      top + plotHeight * (1 - (value - changeMin) / (changeMax - changeMin))
    );
  }

  return (
    <div className="chart-canvas change-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="group"
        aria-label="Period totals and percentage change"
      >
        {[0, 1, 2, 3, 4].map((tick) => (
          <g key={tick}>
            <line
              className="grid-line"
              x1={left}
              x2={width - right}
              y1={top + (plotHeight * tick) / 4}
              y2={top + (plotHeight * tick) / 4}
            />
            <text
              className="axis-label"
              x={left - 8}
              y={top + (plotHeight * tick) / 4 + 4}
              textAnchor="end"
            >
              {Math.round(maximum * (1 - tick / 4)).toLocaleString()}
            </text>
            <text
              className="axis-label"
              x={width - right + 8}
              y={top + (plotHeight * tick) / 4 + 4}
            >
              {(changeMax - ((changeMax - changeMin) * tick) / 4).toFixed(1)}%
            </text>
          </g>
        ))}
        {data.map((row, index) => (
          <g
            key={row.name}
            className="chart-mark"
            role="button"
            tabIndex={0}
            aria-label={`${row.name}: ${label} ${row.value}, change ${row.change === null ? "unavailable" : row.change.toFixed(2) + "%"}`}
            onClick={() => onSelect(row.name)}
            onKeyDown={(event) => {
              if (["Enter", " "].includes(event.key)) {
                event.preventDefault();
                onSelect(row.name);
              }
            }}
          >
            <title>
              {row.name}: {currency ? compactMoney(row.value) : row.value} ·
              Change:{" "}
              {row.change === null
                ? "Unavailable"
                : row.change.toFixed(2) + "%"}
            </title>
            <rect
              x={left + step * (index + 0.5) - Math.min(60, step * 0.6) / 2}
              y={top + plotHeight * (1 - row.value / maximum)}
              width={Math.min(60, step * 0.6)}
              height={Math.max(1, (plotHeight * row.value) / maximum)}
              fill="#92ddef"
            />
            <text
              className="value-label"
              x={left + step * (index + 0.5)}
              y={top + plotHeight * (1 - row.value / maximum) - 8}
              textAnchor="middle"
            >
              {currency ? compactMoney(row.value) : row.value.toLocaleString()}
            </text>
            <text
              className="axis-label"
              x={left + step * (index + 0.5)}
              y={height - 25}
              textAnchor="middle"
            >
              {row.name}
            </text>
          </g>
        ))}
        <polyline
          fill="none"
          stroke="#a788db"
          strokeWidth="2"
          points={data
            .flatMap((row, index) =>
              row.change === null
                ? []
                : [`${left + step * (index + 0.5)},${changeY(row.change)}`],
            )
            .join(" ")}
        />
        {data.map(
          (row, index) =>
            row.change !== null && (
              <circle
                key={row.name}
                cx={left + step * (index + 0.5)}
                cy={changeY(row.change)}
                r="5"
                fill="#a788db"
              >
                <title>
                  {row.name} change: {row.change.toFixed(2)}%
                </title>
              </circle>
            ),
        )}
        {!data.length && (
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            className="empty-chart"
          >
            No history for this selection
          </text>
        )}
      </svg>
    </div>
  );
}
