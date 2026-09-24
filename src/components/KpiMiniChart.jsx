import React, { useState } from "react";
import Icon from "./Icon.jsx";
import { compactMoney } from "../data/dashboard.js";
import { weekdayMetrics } from "../data/kpiData.js";

// Expands a monthly KPI mark into a weekday chart inside the same card.
export function KpiMiniChart({ card, rows, filtered, onMonthSelect }) {
  const [daily, setDaily] = useState(false);
  const [tooltip, setTooltip] = useState("");
  const data = weekdayMetrics(rows, card.metric, filtered);
  const minimum = card.bar ? 0 : Math.min(...data.map((row) => row.value));
  const range = Math.max(1, ...data.map((row) => row.value - minimum));
  const points = data.map((row, index) => [
    16 + index * 36,
    44 - ((row.value - minimum) / range) * 36,
  ]);

  // Keeps the month selected when this card returns to its monthly view.
  function showMonth() {
    setDaily(false);
    setTooltip("");
  }

  // Changes the card's level and adds the shared month selection chip.
  function showWeekdays() {
    setDaily(true);
    onMonthSelect();
  }

  // Shows a value on hover, focus, or click without opening another drill level.
  function describeDay(row) {
    const value =
      card.metric === "rate"
        ? `${row.value.toFixed(2)}%`
        : card.metric === "partial"
          ? row.value
          : compactMoney(row.value);
    setTooltip(`${row.name} in Feb · ${card.title}: ${value}`);
  }

  return (
    <>
      {daily && (
        <button
          className="kpi-back"
          aria-label={`Back to monthly ${card.title}`}
          onClick={showMonth}
        >
          <Icon name="back" size={13} />
        </button>
      )}
      {!daily ? (
        <button
          className={`kpi-mini-chart ${card.bar ? "bar" : "dot"}`}
          aria-label={`Show days in Feb, ${card.title}`}
          onClick={showWeekdays}
        >
          <i />
          <span>Feb</span>
        </button>
      ) : (
        <div className="kpi-weekdays" onMouseLeave={() => setTooltip("")}>
          <svg
            viewBox={`0 0 ${data.length * 36} 62`}
            aria-label={`${card.title} by weekday`}
          >
            {!card.bar && (
              <>
                <path
                  d={`M${points[0]} ${points
                    .slice(1)
                    .map((point) => `L${point}`)
                    .join(" ")} L${points.at(-1)[0]},44 L16,44 Z`}
                  fill="var(--chart-color)"
                  opacity=".12"
                />
                <polyline
                  points={points.map((point) => point.join(",")).join(" ")}
                  fill="none"
                  stroke="var(--chart-color)"
                  strokeWidth="1.5"
                />
              </>
            )}
            {data.map((row, index) => (
              <g
                key={row.name}
                role="button"
                tabIndex={0}
                aria-label={`${row.name} in Feb, ${card.title}: ${row.value.toFixed(2)}`}
                onMouseEnter={() => describeDay(row)}
                onFocus={() => describeDay(row)}
                onClick={() => describeDay(row)}
                onKeyDown={(event) => {
                  if (["Enter", " "].includes(event.key)) {
                    event.preventDefault();
                    describeDay(row);
                  }
                }}
              >
                <rect
                  x={index * 36}
                  y="0"
                  width="33"
                  height="62"
                  fill="transparent"
                />
                {card.bar ? (
                  <rect
                    x={index * 36 + 7}
                    y={points[index][1]}
                    width="19"
                    height={Math.max(1, 44 - points[index][1])}
                    rx="2"
                    fill="var(--chart-color)"
                  />
                ) : (
                  <circle
                    cx={points[index][0]}
                    cy={points[index][1]}
                    r="2.5"
                    fill="var(--chart-color)"
                  />
                )}
                <text x={points[index][0]} y="57" textAnchor="middle">
                  {["Mo", "Tu", "Wd", "Td", "Fr", "Sa", "Su"][index]}
                </text>
              </g>
            ))}
          </svg>
          {tooltip && (
            <div className="kpi-tooltip" role="status">
              {tooltip}
            </div>
          )}
        </div>
      )}
    </>
  );
}
