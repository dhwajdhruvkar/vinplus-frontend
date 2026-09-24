import React from "react";
import Icon from "./Icon.jsx";
import { colors } from "./Charts.jsx";
import { compactMoney, money } from "../data/dashboard.js";

// Shows the five summary cards and opens a daily breakdown when a chart is selected.
export function KpiCards({ summary, onDrill, comfortable }) {
  const cards = [
    {
      title: "Total Sales",
      sub: "Labor + Parts",
      value: compactMoney(summary.sales),
      footer: "Expected Shop Supplies Recovery",
      bottom: compactMoney(summary.expected),
      color: "green",
      icon: "data",
      tooltip: money(summary.sales),
    },
    {
      title: "Shop Supplies Partial Recovery",
      sub: "Records Requiring Review",
      value: summary.partial,
      denom: summary.total,
      footer: "Shop Supplies Partial Recovery Amount",
      bottom: compactMoney(summary.expected),
      color: "yellow",
      bar: true,
      icon: "filter",
      tooltip: `${summary.partial} of ${summary.total} records`,
    },
    {
      title: "Partial Recovery %",
      sub: "Share of all records",
      value: `${summary.rate.toFixed(2)}%`,
      footer: "Compliance Rate",
      bottom: `${summary.total ? (100 - summary.rate).toFixed(2) : "0.00"}%`,
      color: "yellow",
      icon: "sparkle",
      tooltip: `${summary.rate.toFixed(2)}%`,
    },
    {
      title: "Shop Supplies Recovery Status",
      sub: "Amount of Flagged Records",
      value: compactMoney(summary.actual),
      denom: compactMoney(summary.expected),
      footer: "Shop Supplies Recovery %",
      bottom: `${summary.recovery.toFixed(2)}%`,
      color: "green",
      bar: true,
      icon: "pin",
      tooltip: money(summary.actual),
    },
    {
      title: "Unrecovered Shop Supplies",
      sub: "Total Reported Loss",
      value: compactMoney(summary.loss),
      footer: "Unrecovered %",
      bottom: `${summary.expected ? (100 - summary.recovery).toFixed(2) : "0.00"}%`,
      color: "red",
      icon: "data",
      tooltip: money(summary.loss),
    },
  ];
  return (
    <section
      className={`kpi-region ${comfortable ? "comfortable" : ""}`}
      aria-label="Dashboard summary"
    >
      <div className="kpi-grid">
        {cards.map((card) => (
          <article className="kpi-card" key={card.title}>
            <h2>{card.title}</h2>
            <p className="kpi-subtitle">{card.sub}</p>
            <div className="kpi-value" title={card.tooltip}>
              {card.value}
              {card.denom !== undefined && <span> / {card.denom}</span>}
            </div>
            <button
              className={`kpi-mini-chart ${card.bar ? "bar" : "dot"}`}
              aria-label={`Show daily ${card.title}`}
              onClick={() => onDrill(card.title)}
              style={{ "--chart-color": colors[card.color] }}
            >
              <i />
              <span>Feb</span>
            </button>
            <div className={`kpi-footer ${card.color}`}>
              <span className="kpi-footer-icon">
                <Icon name={card.icon} size={8} />
              </span>
              <div>
                <strong>{card.footer}</strong>
                <span>{card.bottom}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
