import React, { useLayoutEffect, useRef, useState } from "react";
import { compactMoney, money } from "../data/dashboard.js";

export const colors = {
  green: "#89bc8b",
  yellow: "#ffdb67",
  red: "#e98588",
  blue: "#9bbbec",
  purple: "#b689e1",
};
function useChart() {
  const ref = useRef(null),
    [width, setWidth] = useState(500),
    [tip, setTip] = useState(null);
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
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
function interactive(label, fn) {
  return {
    role: "button",
    tabIndex: 0,
    "aria-label": label,
    onClick: fn,
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fn?.();
      }
    },
  };
}
const axisText = (n) =>
  n >= 1000 ? `${+(n / 1000).toFixed(2)} K` : +n.toFixed(2);
const valueLabel = (n, currency) =>
  currency ? (n >= 1000 ? compactMoney(n).replace("K", " K") : money(n)) : n;
export function VerticalChart({
  data,
  height = 225,
  max = 600,
  currency = false,
  line = false,
  onSelect,
  legends = false,
}) {
  const { ref, width, tip, show, hide } = useChart();
  const left = 56,
    right = 25,
    top = 29,
    bottom = 45,
    plotW = Math.max(1, width - left - right),
    plotH = height - top - bottom;
  const step = plotW / Math.max(data.length, 1),
    barWidth = Math.min(line ? 64 : 57, step * 0.27);
  const linePoints = data
    .map(
      (r, i) =>
        `${left + step * (i + 0.5)},${top + plotH - ((r.expected - r.actual) / max) * plotH}`,
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
          const y = top + plotH - (i * plotH) / 3;
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
                {axisText((max * i) / 3)}
              </text>
            </g>
          );
        })}
        {data.map((r, i) => {
          const x = left + step * (i + 0.5);
          return (
            <g key={r.name}>
              {[
                ["expected", colors.green],
                ["actual", colors.yellow],
              ].map(([key, color], j) => {
                const h = (r[key] / max) * plotH,
                  bx = x + (j ? 5 : -barWidth - 8);
                return (
                  <g
                    key={key}
                    {...interactive(
                      `${r.name}: ${key} ${valueLabel(r[key], currency)}`,
                      () => onSelect?.(r.name),
                    )}
                    onMouseMove={(e) =>
                      show(
                        e,
                        `${r.name} · ${key === "expected" ? (currency ? "Expected supplies" : "Total records") : currency ? "Actual supplies" : "Partial recovery"}: ${valueLabel(r[key], currency)}`,
                      )
                    }
                    className="chart-mark"
                  >
                    <rect
                      x={bx}
                      y={top + plotH - Math.max(h, 1)}
                      width={barWidth}
                      height={Math.max(h, 1)}
                      rx="2"
                      fill={color}
                    />
                    <text
                      x={bx + barWidth / 2}
                      y={top + plotH - h - 9}
                      textAnchor="middle"
                      className="data-label"
                    >
                      {valueLabel(r[key], currency)}
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
                {r.name}
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
            {data.map((r, i) => (
              <g key={r.name}>
                <circle
                  cx={left + step * (i + 0.5)}
                  cy={top + plotH - ((r.expected - r.actual) / max) * plotH}
                  r="3.5"
                  fill={colors.red}
                />
                {i === 0 && (
                  <text
                    x={left + step * 0.5}
                    y={
                      top + plotH - ((r.expected - r.actual) / max) * plotH - 10
                    }
                    textAnchor="middle"
                    className="data-label"
                  >
                    {valueLabel(r.expected - r.actual, true)}
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
  const { ref, width, tip, show, hide } = useChart();
  const left = Math.min(labelWidth, width * 0.34),
    right = 45,
    top = 20,
    bottom = 32,
    plotW = Math.max(1, width - left - right),
    plotH = height - top - bottom;
  const step = plotH / Math.max(data.length, 1),
    barH = Math.min(series.length > 1 ? 9 : 19, step / (series.length + 1.1));
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
          const x = left + (plotW * i) / ticks;
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
                {axisText((max * i) / ticks)}
              </text>
            </g>
          );
        })}
        {data.map((r, i) => {
          const y = top + step * (i + 0.5);
          return (
            <g key={r.name}>
              <text
                x={left - 15}
                y={y + 3}
                textAnchor="end"
                className="axis-label"
              >
                {r.name}
              </text>
              {series.map((s, j) => {
                const value = r[s.key] || 0,
                  visualValue = s.scale ? value * s.scale : value,
                  w = Math.min(plotW, (visualValue / max) * plotW),
                  by = y + (j - series.length / 2) * (barH + 4);
                return (
                  <g
                    key={s.key}
                    className="chart-mark"
                    {...interactive(
                      `${r.name}: ${s.key} ${valueLabel(value, s.currency)}`,
                      () => onSelect?.(r.name),
                    )}
                    onMouseMove={(e) =>
                      show(
                        e,
                        `${r.name} · ${s.label || s.key}: ${valueLabel(value, s.currency)}`,
                      )
                    }
                  >
                    <rect
                      x={left}
                      y={by}
                      width={Math.max(w, 1)}
                      height={barH}
                      rx="2"
                      fill={s.color}
                    />
                    <text
                      x={left + w + (insideLabels && w > plotW * 0.8 ? -5 : 8)}
                      y={by + barH - 1}
                      textAnchor={
                        insideLabels && w > plotW * 0.8 ? "end" : "start"
                      }
                      className="data-label"
                    >
                      {valueLabel(value, s.currency)}
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
      {scroll && (
        <span className="decorative-scroll" aria-hidden="true">
          <i />
        </span>
      )}
      <Tooltip tip={tip} />
    </div>
  );
}
export function DonutChart({ onSelect }) {
  const { ref, width, tip, show, hide } = useChart();
  const cx = width / 2,
    cy = 120,
    r = 65,
    inner = 29;
  const segments = [
    {
      name: "Misc Sales",
      value: 15,
      color: colors.purple,
      text: "$91.67 K (15.0%)",
    },
    {
      name: "Labor Sales",
      value: 47.8,
      color: colors.blue,
      text: "$291.81 K (47.8%)",
    },
    {
      name: "Part Sales",
      value: 35.8,
      color: "#f6d986",
      text: "$218.85 K (35.8%)",
    },
    {
      name: "Shop Supplies",
      value: 1.4,
      color: colors.green,
      text: "$8.38 K (1.4%)",
    },
  ];
  let angle = -Math.PI / 2;
  const arcs = segments.map((segment) => {
    const start = angle;
    angle += (segment.value / 100) * Math.PI * 2;
    const end = angle;
    const polar = (rad, a) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
    const a = polar(r, start),
      b = polar(r, end),
      c = polar(inner, end),
      d = polar(inner, start);
    return {
      ...segment,
      path: `M${a} A${r},${r} 0 ${end - start > Math.PI ? 1 : 0} 1 ${b} L${c} A${inner},${inner} 0 ${end - start > Math.PI ? 1 : 0} 0 ${d} Z`,
    };
  });
  return (
    <div ref={ref} className="chart-canvas" onMouseLeave={hide}>
      <svg
        width="100%"
        height="240"
        role="group"
        aria-label="Sales metrics breakdown: Labor 47.8%, Parts 35.8%, Misc 15%, Shop supplies 1.4%"
      >
        {arcs.map((s, i) => (
          <path
            key={s.name}
            d={s.path}
            fill={s.color}
            stroke="white"
            strokeWidth="1"
            className="chart-mark"
            {...interactive(`${s.name} ${s.text}`, () => onSelect?.(s.name))}
            onMouseMove={(e) => show(e, `${s.name}: ${s.text}`)}
          />
        ))}
        <g className="data-label donut-label">
          <path
            d={`M${cx + 28} 61l10-9h9M${cx + 47} 164l12 10h9M${cx - 62} 99l-17-12h-7M${cx - 3} 55l-8-7h-20`}
            className="donut-connector"
          />
          <text x={cx + 50} y="50">
            <tspan>Misc Sales</tspan>
            <tspan x={cx + 50} dy="14">
              $91.67 K (15.0%)
            </tspan>
          </text>
          <text x={cx + 70} y="175">
            <tspan>Labor Sales</tspan>
            <tspan x={cx + 70} dy="14">
              $291.81 K (47.8%)
            </tspan>
          </text>
          <text x={cx - 84} y="85" textAnchor="end">
            <tspan>Part Sales</tspan>
            <tspan x={cx - 84} dy="14">
              $218.85 K (35.8%)
            </tspan>
          </text>
          <text x={cx - 43} y="44" textAnchor="end">
            <tspan>Shop Supplies</tspan>
            <tspan x={cx - 43} dy="14">
              $8.38 K (1.4%)
            </tspan>
          </text>
        </g>
      </svg>
      <Tooltip tip={tip} />
    </div>
  );
}
export function TrendChart({ value, onSelect }) {
  const { ref, width, tip, show, hide } = useChart();
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
          {axisText(value + 1)}
        </text>
        <text x="49" y="141" textAnchor="end" className="axis-label">
          {axisText(value)}
        </text>
        <g
          className="chart-mark"
          {...interactive(`February 2024: ${money(value)}`, onSelect)}
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
