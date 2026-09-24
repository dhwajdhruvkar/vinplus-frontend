import React, { useLayoutEffect, useRef, useState } from "react";

import { compactMoney, money } from "../data/dashboard.js";

import { salesMix } from "../data/salesMix.js";

export const colors = {
  green: "#89bc8b",

  yellow: "#ffdb67",

  red: "#e98588",

  blue: "#9bbbec",

  purple: "#b689e1",
};

// Measures the chart container and manages its hover tooltip.

function useChart(data) {
  const ref = useRef(null);

  const [width, setWidth] = useState(500);

  const [tip, setTip] = useState(null);
  useLayoutEffect(() => setTip(null), [data]);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(([e]) => setWidth(e.contentRect.width));

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  // Positions the tooltip near the pointer within the chart.

  const show = (event, text) => {
    const bounds = ref.current.getBoundingClientRect();

    setTip({
      text,

      x: Math.min(event.clientX - bounds.left + 10, bounds.width - 190),

      y: event.clientY - bounds.top - 45,
    });
  };

  return { ref, width, tip, show, hide: () => setTip(null) };
}

// Displays the hovered chart value without covering the pointer.

function Tooltip({ tip }) {
  return (
    tip && (
      <div
        className="chart-tooltip"

        role="status"

        style={{ left: Math.max(4, tip.x), top: Math.max(2, tip.y) }}
      >
        {tip.text}
      </div>
    )
  );
}

// Makes each chart mark selectable with the mouse, Enter, or Space.

function chartButtonProps(label, onSelect) {
  return {
    role: "button",

    tabIndex: 0,

    "aria-label": label,

    onClick: onSelect,

    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();

        onSelect?.();
      }
    },
  };
}

// Shortens large axis numbers while keeping small values readable.

function formatAxisValue(value) {
  if (value >= 1000) return `${Number((value / 1000).toFixed(2))} K`;

  return Number(value.toFixed(2));
}

// Formats a chart value as either a number or a dollar amount.

function formatChartValue(value, currency) {
  if (!currency) return value;

  if (value >= 1000) return compactMoney(value).replace("K", " K");

  return money(value);
}

// Names each bar according to whether it shows dollars or record counts.

function barLabel(key, currency) {
  if (key === "expected")
    return currency ? "Expected supplies" : "Total records";

  return currency ? "Actual supplies" : "Partial recovery";
}

// Draws paired vertical bars and an optional line for unrecovered amounts.

export function VerticalChart({
  data,

  height = 225,

  max = 600,

  currency = false,

  line = false,

  onSelect,

  legends = false,
}) {
  const { ref, width, tip, show, hide } = useChart(data);

  const left = 56;

  const right = 25;

  const top = 29;

  const bottom = 45;

  const plotWidth = Math.max(1, width - left - right);

  const plotHeight = height - top - bottom;

  const step = plotWidth / Math.max(data.length, 1);

  const barWidth = Math.min(line ? 64 : 57, step * 0.27);

  const linePoints = data

    .map(
      (row, i) =>
        `${left + step * (i + 0.5)},${top + plotHeight - ((row.expected - row.actual) / max) * plotHeight}`,
    )

    .join(" ");

  return (
    <div ref={ref} className="chart-canvas" onMouseLeave={hide}>
      <svg
        width="100%"

        height={height}

        role="group"

        aria-label={
          line
            ? "Expected, actual, and unrecovered shop supplies by manager"
            : "Total and partial recovery repair orders by dealer"
        }
      >
        {[0, 1, 2, 3].map((i) => {
          const y = top + plotHeight - (i * plotHeight) / 3;

          return (
            <g key={i}>
              <line
                x1={left}

                x2={width - right}

                y1={y}

                y2={y}

                className={i ? "grid-line" : "axis-line"}
              />

              <text
                x={left - 16}

                y={y + 4}

                textAnchor="end"

                className="axis-label"
              >
                {formatAxisValue((max * i) / 3)}
              </text>
            </g>
          );
        })}

        {data.map((row, i) => {
          const x = left + step * (i + 0.5);

          return (
            <g key={row.name}>
              {[
                ["expected", colors.green],

                ["actual", colors.yellow],
              ].map(([key, color], j) => {
                const barHeight = (row[key] / max) * plotHeight;

                const barX = x + (j ? 5 : -barWidth - 8);

                return (
                  <g
                    key={key}

                    {...chartButtonProps(
                      `${row.name}: ${key} ${formatChartValue(row[key], currency)}`,

                      () => onSelect?.(row.name),
                    )}

                    onMouseMove={(e) =>
                      show(
                        e,

                        `${row.name} · ${barLabel(key, currency)}: ${formatChartValue(row[key], currency)}`,
                      )
                    }

                    className="chart-mark"
                  >
                    <rect
                      x={barX}

                      y={top + plotHeight - Math.max(barHeight, 1)}

                      width={barWidth}

                      height={Math.max(barHeight, 1)}

                      rx="2"

                      fill={color}
                    />

                    <text
                      x={barX + barWidth / 2}

                      y={top + plotHeight - barHeight - 9}

                      textAnchor="middle"

                      className="data-label"
                    >
                      {formatChartValue(row[key], currency)}
                    </text>
                  </g>
                );
              })}

              <text
                x={x}

                y={height - 20}

                textAnchor="middle"

                className="axis-label"
              >
                {row.name}
              </text>
            </g>
          );
        })}

        {line && (
          <>
            <polyline
              points={linePoints}

              fill="none"

              stroke={colors.red}

              strokeWidth="1.8"
            />

            {data.map((row, i) => (
              <g
                key={row.name}
                className="chart-mark"
                {...chartButtonProps(
                  `${row.name}: unrecovered ${money(row.expected - row.actual)}`,
                  () => onSelect?.(row.name),
                )}

                onMouseMove={(event) =>
                  show(
                    event,
                    `${row.name} · Unrecovered: ${money(row.expected - row.actual)}`,
                  )
                }
              >
                <circle
                  cx={left + step * (i + 0.5)}

                  cy={
                    top +
                    plotHeight -
                    ((row.expected - row.actual) / max) * plotHeight
                  }

                  r="3.5"

                  fill={colors.red}
                />

                {i === 0 && (
                  <text
                    x={left + step * 0.5}

                    y={
                      top +
                      plotHeight -
                      ((row.expected - row.actual) / max) * plotHeight -
                      10
                    }

                    textAnchor="middle"

                    className="data-label"
                  >
                    {formatChartValue(row.expected - row.actual, true)}
                  </text>
                )}
              </g>
            ))}
          </>
        )}

        {!data.length && (
          <text
            x={width / 2}

            y={height / 2}

            className="empty-chart"

            textAnchor="middle"
          >
            No data for this selection
          </text>
        )}
      </svg>

      {tip && <Tooltip tip={tip} />}

      {legends && (
        <div className="legend">
          <span>
            <i style={{ background: colors.green }} />
            Expected
          </span>

          <span>
            <i style={{ background: colors.yellow }} />
            Actual
          </span>

          <span>
            <i style={{ background: colors.red }} />
            Unrecovered
          </span>
        </div>
      )}
    </div>
  );
}

// Draws one or more horizontal bar series for each category.

export function HorizontalChart({
  data,

  series = [{ key: "loss", color: colors.red, currency: true }],

  height = 212,

  max = 125,

  labelWidth = 145,

  onSelect,

  scroll = false,

  ticks = 5,

  insideLabels = false,
}) {
  const { ref, width, tip, show, hide } = useChart(data);

  const left = Math.min(labelWidth, width * 0.34);

  const right = 45;

  const top = 20;

  const bottom = 32;

  const plotWidth = Math.max(1, width - left - right);

  const plotHeight = height - top - bottom;

  const step = plotHeight / Math.max(data.length, 1);

  const barHeight = Math.min(
    series.length > 1 ? 9 : 19,

    step / (series.length + 1.1),
  );

  return (
    <div
      ref={ref}

      className={`chart-canvas ${scroll ? "chart-scroll" : ""}`}

      onMouseLeave={hide}
    >
      <svg
        width="100%"

        height={height}

        role="group"

        aria-label="Shop supplies breakdown"
      >
        {Array.from({ length: ticks + 1 }, (_, i) => {
          const x = left + (plotWidth * i) / ticks;

          return (
            <g key={i}>
              <line
                x1={x}

                x2={x}

                y1={top}

                y2={height - bottom}

                className={i ? "grid-line" : "axis-line"}
              />

              <text
                x={x}

                y={height - 8}

                textAnchor="middle"

                className="axis-label"
              >
                {formatAxisValue((max * i) / ticks)}
              </text>
            </g>
          );
        })}

        {data.map((row, i) => {
          const y = top + step * (i + 0.5);

          return (
            <g key={row.name}>
              <text
                x={left - 15}

                y={y + 3}

                textAnchor="end"

                className="axis-label"
              >
                {row.name}
              </text>

              {series.map((seriesItem, j) => {
                const value = row[seriesItem.key] || 0;

                const visualValue = seriesItem.scale
                  ? value * seriesItem.scale
                  : value;

                const barWidth = Math.min(
                  plotWidth,

                  (visualValue / max) * plotWidth,
                );

                const barY = y + (j - series.length / 2) * (barHeight + 4);

                return (
                  <g
                    key={seriesItem.key}

                    className="chart-mark"

                    {...chartButtonProps(
                      `${row.name}: ${seriesItem.key} ${formatChartValue(value, seriesItem.currency)}`,

                      () => onSelect?.(row.name),
                    )}

                    onMouseMove={(e) =>
                      show(
                        e,

                        `${row.name} · ${seriesItem.label || seriesItem.key}: ${formatChartValue(value, seriesItem.currency)}`,
                      )
                    }
                  >
                    <rect
                      x={left}

                      y={barY}

                      width={Math.max(barWidth, 1)}

                      height={barHeight}

                      rx="2"

                      fill={seriesItem.color}
                    />

                    <text
                      x={
                        left +
                        barWidth +
                        (insideLabels && barWidth > plotWidth * 0.8 ? -5 : 8)
                      }

                      y={barY + barHeight - 1}

                      textAnchor={
                        insideLabels && barWidth > plotWidth * 0.8
                          ? "end"
                          : "start"
                      }

                      className="data-label"
                    >
                      {formatChartValue(value, seriesItem.currency)}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

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

      <Tooltip tip={tip} />
    </div>
  );
}

// Highlights sales slices independently without changing dashboard filters.

export function DonutChart({ rows = [], filtered = false, onSelect }) {
  const { ref, width, tip, show, hide } = useChart(rows);

  const [selected, setSelected] = useState([]);

  const [hovered, setHovered] = useState("");

  const segments = salesMix(rows, filtered);

  const total = segments.reduce((sum, row) => sum + row.value, 0);

  const cx = width / 2,
    cy = width < 410 ? 90 : 120,
    outer = 65,
    inner = 29;

  let angle = -Math.PI / 2;

  // Converts each value to an arc and an optional outward selection offset.

  function makeArc(segment) {
    const start = angle;

    angle += total ? (segment.value / total) * Math.PI * 2 : 0;

    const end = Math.min(angle, start + Math.PI * 2 - 0.00001);

    const middle = (start + end) / 2;

    const large = end - start > Math.PI ? 1 : 0;

    // Locates one point on the inner or outer circle.

    function point(radius, value) {
      return [cx + radius * Math.cos(value), cy + radius * Math.sin(value)];
    }

    return {
      ...segment,
      percent: total ? (segment.value / total) * 100 : 0,

      offset: `${Math.cos(middle) * 8},${Math.sin(middle) * 8}`,

      path: `M${point(outer, start)} A${outer},${outer} 0 ${large} 1 ${point(outer, end)} L${point(inner, end)} A${inner},${inner} 0 ${large} 0 ${point(inner, start)} Z`,
    };
  }

  const arcs = segments.map(makeArc);

  // Toggles just the clicked slice, matching the original donut behavior.

  function toggleSlice(name) {
    onSelect?.(name);
    setSelected((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  }

  // Formats the visible amount and its share of the sales mix.

  function amount(segment) {
    return `${compactMoney(segment.value).replace("K", " K")} (${segment.percent.toFixed(1)}%)`;
  }

  return (
    <div
      ref={ref}
      className="chart-canvas donut-chart"
      onMouseLeave={() => {
        hide();
        setHovered("");
      }}
    >
      <svg
        width="100%"
        height={width < 410 ? 180 : 240}
        role="group"
        aria-label="Sales metrics breakdown"
      >
        {arcs
          .filter((segment) => segment.value > 0)
          .map((segment) => (
            <path
              key={segment.name}
              d={segment.path}
              fill={segment.color}
              stroke="white"
              strokeWidth="1"
              className="chart-mark"

              transform={
                selected.includes(segment.name)
                  ? `translate(${segment.offset})`
                  : undefined
              }

              opacity={!hovered || hovered === segment.name ? 1 : 0.45}
              aria-pressed={selected.includes(segment.name)}

              {...chartButtonProps(`${segment.name} ${amount(segment)}`, () =>
                toggleSlice(segment.name),
              )}

              onFocus={() => setHovered(segment.name)}
              onBlur={() => setHovered("")}

              onMouseMove={(event) => {
                setHovered(segment.name);
                show(event, `${segment.name}: ${amount(segment)}`);
              }}
            >
              <title>
                {segment.name}: {amount(segment)}
              </title>
            </path>
          ))}

        {!total && (
          <text x={cx} y={cy} textAnchor="middle" className="empty-chart">
            No data for this selection
          </text>
        )}

        {total > 0 && width >= 410 && (
          <g className="data-label donut-label">
            <path
              d={`M${cx + 28} 61l10-9h9M${cx + 47} 164l12 10h9M${cx - 62} 99l-17-12h-7M${cx - 3} 55l-8-7h-20`}
              className="donut-connector"
            />

            {arcs.map((segment, index) => {
              const [x, y, anchor] = [
                [cx + 50, 50, "start"],
                [cx + 70, 175, "start"],
                [cx - 84, 85, "end"],
                [cx - 43, 44, "end"],
              ][index];

              return (
                <text key={segment.name} x={x} y={y} textAnchor={anchor}>
                  <tspan>{segment.name}</tspan>
                  <tspan x={x} dy="14">
                    {amount(segment)}
                  </tspan>
                </text>
              );
            })}
          </g>
        )}
      </svg>

      {width < 410 && total > 0 && (
        <div className="donut-compact-legend">
          {arcs.map((segment) => (
            <button
              key={segment.name}
              onClick={() => toggleSlice(segment.name)}
              aria-pressed={selected.includes(segment.name)}
            >
              <i style={{ background: segment.color }} />
              <span>
                {segment.name}
                <strong>{amount(segment)}</strong>
              </span>
            </button>
          ))}
        </div>
      )}

      <Tooltip tip={tip} />
    </div>
  );
}

// Shows the monthly unrecovered amount for the available reporting period.

export function TrendChart({ value, onSelect }) {
  const { ref, width, tip, show, hide } = useChart(value);

  const x = width / 2;

  return (
    <div ref={ref} className="chart-canvas" onMouseLeave={hide}>
      <svg
        width="100%"

        height="192"

        role="group"

        aria-label="Monthly unrecovered shop supplies trend"
      >
        <line x1="65" x2={width - 25} y1="35" y2="35" className="grid-line" />

        <line x1="65" x2={width - 25} y1="138" y2="138" className="axis-line" />

        <text x="49" y="39" textAnchor="end" className="axis-label">
          {formatAxisValue(value + 1)}
        </text>

        <text x="49" y="141" textAnchor="end" className="axis-label">
          {formatAxisValue(value)}
        </text>

        <g
          className="chart-mark"

          {...chartButtonProps(`February 2024: ${money(value)}`, onSelect)}

          onMouseMove={(e) => show(e, `February 2024 · ${money(value)}`)}
        >
          <circle cx={x} cy="97" r="4" fill={colors.red} />

          <circle cx={x} cy="97" r="15" fill="transparent" />

          <text x={x} y="87" textAnchor="middle" className="data-label">
            {compactMoney(value).replace("K", " K")}
          </text>
        </g>

        <text x={x} y="164" textAnchor="middle" className="axis-label">
          Feb-2024
        </text>
      </svg>

      <Tooltip tip={tip} />
    </div>
  );
}
