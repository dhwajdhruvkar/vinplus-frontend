import React, { useId } from "react";
import { colors } from "./Charts.jsx";
import { compactMoney } from "../data/dashboard.js";

// Draws alternate column or area views while preserving the same selection action.
export function SeriesChart({ data, series, type, onSelect, height = 225 }) {
  const id = useId();
  const width = 600,
    left = 55,
    right = 20,
    top = 25,
    bottom = 45;
  const plotWidth = width - left - right,
    plotHeight = height - top - bottom;
  const max =
    Math.max(
      1,
      ...data.flatMap((row) =>
        series.map((item) => (row[item.key] || 0) * (item.scale || 1)),
      ),
    ) * 1.2;
  const step = plotWidth / Math.max(1, data.length);

  // Formats each series according to whether it shows counts or currency.
  function label(value, item) {
    return item.currency ? compactMoney(value) : String(value);
  }

  return (
    <div className="chart-canvas alternate-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="group"
        aria-label={`${type} chart`}
      >
        {[0, 1, 2, 3].map((tick) => (
          <g key={tick}>
            <line
              x1={left}
              x2={width - right}
              y1={top + (plotHeight * tick) / 3}
              y2={top + (plotHeight * tick) / 3}
              className="grid-line"
            />
            <text
              x={left - 8}
              y={top + (plotHeight * tick) / 3 + 4}
              textAnchor="end"
              className="axis-label"
            >
              {Math.round(max * (1 - tick / 3)).toLocaleString()}
            </text>
          </g>
        ))}
        {series.map((item, seriesIndex) => {
          const points = data.map((row, index) => [
            left + step * (index + 0.5),
            top +
              plotHeight *
                (1 - ((row[item.key] || 0) * (item.scale || 1)) / max),
          ]);
          return (
            <g key={item.key}>
              {type === "area" && points.length > 0 && (
                <>
                  <path
                    d={`M${points[0][0]},${height - bottom} ${points.map((point) => `L${point}`).join(" ")} L${points.at(-1)[0]},${height - bottom} Z`}
                    fill={item.color}
                    opacity=".5"
                  />
                  <polyline
                    points={points.map((point) => point.join(",")).join(" ")}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="2"
                  />
                </>
              )}
              {data.map((row, index) => (
                <g
                  key={row.name}
                  className="chart-mark"
                  role="button"
                  tabIndex={0}
                  aria-label={`${row.name}: ${item.label} ${label(row[item.key] || 0, item)}`}
                  onClick={() => onSelect(row.name)}
                  onKeyDown={(event) => {
                    if (["Enter", " "].includes(event.key)) {
                      event.preventDefault();
                      onSelect(row.name);
                    }
                  }}
                >
                  <title id={`${id}-${seriesIndex}-${index}`}>
                    {row.name} · {item.label}: {label(row[item.key] || 0, item)}
                  </title>
                  {type === "area" ? (
                    <>
                      <circle
                        cx={points[index][0]}
                        cy={points[index][1]}
                        r="4"
                        fill={item.color}
                      />
                      <circle
                        cx={points[index][0]}
                        cy={points[index][1]}
                        r="14"
                        fill="transparent"
                      />
                    </>
                  ) : (
                    <rect
                      x={
                        left +
                        step * index +
                        step * 0.18 +
                        (seriesIndex * step * 0.6) / series.length
                      }
                      y={points[index][1]}
                      width={Math.min(50, (step * 0.55) / series.length)}
                      height={Math.max(1, height - bottom - points[index][1])}
                      rx="2"
                      fill={item.color || colors.green}
                    />
                  )}
                </g>
              ))}
            </g>
          );
        })}
        {data.map((row, index) => (
          <text
            key={row.name}
            x={left + step * (index + 0.5)}
            y={height - 20}
            textAnchor="middle"
            className="axis-label"
          >
            {row.name}
          </text>
        ))}
        {!data.length && (
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            className="empty-chart"
          >
            No data for this selection
          </text>
        )}
      </svg>
    </div>
  );
}
